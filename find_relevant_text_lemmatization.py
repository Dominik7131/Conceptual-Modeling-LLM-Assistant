from text_utility import TextUtility
from morphodita_tagger import Morphodita_Tagger
import json

PATH_TO_DATA_DIRECTORY = "data/56-2001-extract-llm-assistant-test-case/"
INPUT_DOMAIN_DESCRIPTION_FILE_PATH = f"{PATH_TO_DATA_DIRECTORY}/56-2001-extract-llm-assistant-test-case.txt"

ENTITY = "green card"
CHACHING_FILE = "cache.txt"
OUTPUT_FILE = "out_manual.txt"

IS_CHUNKS_CACHING = False
IS_SAVE_OUTPUT_TO_FILE = True


class RelevantTextFinderLemmatization:

    def __init__(self):
        self.tagger = Morphodita_Tagger()


    def load_chunks(self):
        # Edited chunks contain more text than chunks for more context
        edited_chunks, self.chunks, self.is_bullet_point_list, self.title_references = TextUtility.split_file_into_chunks(INPUT_DOMAIN_DESCRIPTION_FILE_PATH)

        if IS_CHUNKS_CACHING:
            RelevantTextFinderLemmatization.cache_chunks(edited_chunks)

        return


    def cache_chunks(self):
        with open(CHACHING_FILE, 'w') as file:
            for chunk in self.chunks:
                lemmas = self.tagger.get_lemmas(chunk)
                lemmas_json = json.dumps(lemmas)
                lemmas_json = '{"lemmas" : ' + lemmas_json + ' }'

                file.write(f"{lemmas_json}\n")


    def get(self, entity, domain_description = ""):

        # TODO: convert `domain_description` into chunks
        self.load_chunks()
        entity_lemmas = self.tagger.get_lemmas(entity)
        # print(f"Aquired lemmas: {lemmas}")

        result = []
        is_chunk_included = []

        with open(CHACHING_FILE, 'r') as caching_file:
            for index, chunk in enumerate(self.chunks):
                # Load chunk lemmas from the cached file
                chunk_lemmas = caching_file.readline()
                chunk_lemmas_json = json.loads(chunk_lemmas)
                chunk_lemmas_list = chunk_lemmas_json['lemmas']

                # Check if entity lemmas are contained in chunk lemmas
                are_entity_lemmas_contained = True
                for entity_lemma in entity_lemmas:
                    if not entity_lemma in chunk_lemmas_list:
                        are_entity_lemmas_contained = False
                        is_chunk_included.append(False)
                        break
                
                if are_entity_lemmas_contained:
                    is_chunk_included.append(True)

                    # If a bullet point is included then make sure that the text in front of these bullet points is included
                    if self.is_bullet_point_list[index]:
                        if not is_chunk_included[self.title_references[index]]:
                            result.append(self.chunks[self.title_references[index]])
                            is_chunk_included[self.title_references[index]] = True

                    result.append(chunk)

        return result


    def get_relevant_texts_and_save_to_file(entity_lemmas, chunks):
        with open(CHACHING_FILE, 'r') as caching_file:
            with open(OUTPUT_FILE, 'w') as output_file:
                for chunk in chunks:

                    # Load chunk lemmas from the cached file
                    chunk_lemmas = caching_file.readline()
                    chunk_lemmas_json = json.loads(chunk_lemmas)
                    chunk_lemmas_list = chunk_lemmas_json['lemmas']

                    # Check if entity lemmas are contained in chunk lemmas
                    are_entity_lemmas_contained = True
                    for entity_lemma in entity_lemmas:
                        if not entity_lemma in chunk_lemmas_list:
                            are_entity_lemmas_contained = False
                            break
                    
                    if are_entity_lemmas_contained:
                        output_file.write(f"{chunk}\n")

def main():

    relevant_text_finder = RelevantTextFinderLemmatization()
    relevant_texts = relevant_text_finder.get(ENTITY)

    if IS_SAVE_OUTPUT_TO_FILE:
        with open(OUTPUT_FILE, 'w') as file:
            for relevant_text in relevant_texts:
                file.write(f"{relevant_text}\n")
        return
    
    # Else print relevant texts in the terminal
    for relevant_text in relevant_texts:
        print(f"{relevant_text}\n")


if __name__ == "__main__":
    main()