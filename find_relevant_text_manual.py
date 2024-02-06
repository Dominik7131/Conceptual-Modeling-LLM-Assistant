from text_utility import TextUtility
import requests
import json

PATH_TO_DATA_DIRECTORY = "data/56-2001-extract-llm-assistant-test-case/"
INPUT_DOMAIN_DESCRIPTION_FILE_PATH = f"{PATH_TO_DATA_DIRECTORY}/56-2001-extract-llm-assistant-test-case.txt"

ENTITY = "structural component"
MODEL = "english-morphium-wsj-140407"
BASE_URL = "http://lindat.mff.cuni.cz/services/morphodita/api/tag?"
CHACHING_FILE = "cache.txt"
OUTPUT_FILE = "out_manual.txt"

IS_CHUNKS_CACHING = False
IS_SAVE_OUTPUT_TO_FILE = True

class RelevantTextFinderManual:

    def load_chunks():
        # Edited chunks contain more text than chunks for more context
        edited_chunks, chunks = TextUtility.split_file_into_chunks(INPUT_DOMAIN_DESCRIPTION_FILE_PATH)

        if IS_CHUNKS_CACHING:
            RelevantTextFinderManual.cache_chunks(edited_chunks)
        
        return chunks

    def cache_chunks(chunks):
        with open(CHACHING_FILE, 'w') as file:
            for chunk in chunks:
                response = requests.get(f"{BASE_URL}model={MODEL}&data={chunk}&output=json")
                json_text = json.loads(response.text)
                results_json = json_text['result']

                parsed_lemmas = []
                for result in results_json:
                    for dictionary in result:
                        parsed_lemmas.append(dictionary['lemma'])

                lemmas_json = json.dumps(parsed_lemmas)
                lemmas_json = '{"lemmas" : ' + lemmas_json + ' }'

                file.write(f"{lemmas_json}\n")


    def get_lemmas(text):
        text_parts = text.split()
        lemmas = []
        for text_part in text_parts:

            try:
                response = requests.get(f"{BASE_URL}model={MODEL}&data={text_part}&output=json")
            except:
                print("Error: Invalid response")

            json_text = json.loads(response.text)
            lemmas.append(json_text['result'][0][0]['lemma'])
        
        print(f"Aquired lemmas: {lemmas}")
        return lemmas


    def get_relevant_texts(entity_lemmas, chunks):
        result = []

        with open(CHACHING_FILE, 'r') as caching_file:
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
    chunks = RelevantTextFinderManual.load_chunks()
    entity_lemmas = RelevantTextFinderManual.get_lemmas(ENTITY)
    relevant_texts = RelevantTextFinderManual.get_relevant_texts(entity_lemmas, chunks)

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