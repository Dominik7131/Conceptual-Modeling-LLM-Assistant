import logging
from ufal.morphodita import *

TAGGER_FILE = "C:/Users/dommo/.cache/morphodita-models/english-morphium-wsj-140407/english-morphium-wsj-140407.tagger"
logging.basicConfig(level=logging.DEBUG, format="%(message)s")

# Code based on the `run_tagger` documentation https://pypi.org/project/ufal.morphodita/
class Morphodita_Tagger:

    def __init__(self):
        self.tagger = Tagger.load(TAGGER_FILE)
        if not self.tagger:
            logging.error(f"Cannot load tagger from file: {TAGGER_FILE}")
            exit(1)
        
        self.forms = Forms()
        self.lemmas = TaggedLemmas()
        self.tokens = TokenRanges()
        self.tokenizer = self.tagger.newTokenizer()

        if self.tokenizer is None:
            logging.error("No tokenizer is defined for the supplied model")
            exit(1)


    def encode_entities(self, text):
        return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')


    def get_lemmas(self, text):
        self.tokenizer.setText(text)
        result = []

        while self.tokenizer.nextSentence(self.forms, self.tokens):
            self.tagger.tag(self.forms, self.lemmas)

            for i in range(len(self.lemmas)):
                lemma = self.lemmas[i]
                result.append(self.encode_entities(lemma.lemma).lower())
        
        return result


def main():

    # Simple usage example
    text = "road vehicles"
    morphodita_tagger = Morphodita_Tagger()
    result = morphodita_tagger.get_lemmas(text)
    print(result)


if __name__ == "__main__":
    main()
