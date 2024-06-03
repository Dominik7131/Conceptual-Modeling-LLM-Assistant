import argparse
from morphodita_tagger import Morphodita_Tagger
import sys

sys.path.append("utils")
from text_splitter import TextSplitter


class SyntacticTextFilterer:

    def __init__(self):

        self.tagger = Morphodita_Tagger()


    def _load_chunks(self, domain_description):

        self.enhanced_chunks, self.chunks = TextSplitter.split_into_chunks(domain_description)


    def get(self, clss, domain_description):

        result = []

        self._load_chunks(domain_description)
        class_lemmas = self.tagger.get_lemmas_one_by_one(clss)        

        for index, enhanced_chunk in enumerate(self.enhanced_chunks):

            enhanced_chunk_lemmas = self.tagger.get_lemmas_one_by_one(enhanced_chunk)

            are_class_lemmas_contained = True
            for lemma in class_lemmas:
                if not lemma in enhanced_chunk_lemmas:
                    are_class_lemmas_contained = False
                    break
            
            if are_class_lemmas_contained:
                result.append(self.chunks[index])

        return result


def main():

    # Simple usage example
    default_class = "student"
    default_domain_description = "Students are at school. They are studying. Hello world. Professors teach students."

    parser = argparse.ArgumentParser(description="Syntactic text filterer")
    parser.add_argument("-c", "--clss", type=str, default=default_class, help="Provide class for filtering the given text")
    parser.add_argument("-t", "--text", type=str, default=default_domain_description, help="Provide text to filter")

    args = parser.parse_args()
    clss = args.clss
    text = args.text

    filterer = SyntacticTextFilterer()

    print(f"Inputed class: {clss}")
    print(f"Inputed text: {text}\n")
    print("Relevant texts: ")

    relevant_texts = filterer.get(clss, text)

    for relevant_text in relevant_texts:
        print(f"{relevant_text} ", end="")


if __name__ == "__main__":
    main()