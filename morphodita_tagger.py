import logging
from ufal.morphodita import *

# TODO: Provide config similar to `llm-config.json` for setting the tagger file path
TAGGER_FILE_PATH = "C:/Users/dommo/.cache/morphodita-models/english-morphium-wsj-140407/english-morphium-wsj-140407.tagger"

# Code based on the `run_tagger` documentation https://pypi.org/project/ufal.morphodita/
class Morphodita_Tagger:

    def __init__(self):
        self.tagger = Tagger.load(TAGGER_FILE_PATH)
        if not self.tagger:
            logging.error(f"Cannot load tagger from file: {TAGGER_FILE_PATH}")
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


    def split_into_tokens(self, text):
        self.tokenizer.setText(text)
        result = []

        while self.tokenizer.nextSentence(self.forms, self.tokens):
            self.tagger.tag(self.forms, self.lemmas)

            for i in range(len(self.lemmas)):
                token = self.tokens[i]
                token = self.encode_entities(text[token.start : token.start + token.length])
                result.append(token.lower())
        return result


    def get_lemmas(self, text):
        self.tokenizer.setText(text)
        result = []

        while self.tokenizer.nextSentence(self.forms, self.tokens):
            self.tagger.tag(self.forms, self.lemmas)

            for i in range(len(self.lemmas)):
                lemma = self.lemmas[i]
                result.append(self.encode_entities(lemma.lemma).lower())
        
        return result


    # Same as `get_lemmas` method but instead of lemmatizing whole sentences lemmatize word by word
    def get_lemmas_one_by_one(self, text):
        tokens = self.split_into_tokens(text)
        result = []

        for i in range(len(tokens)):
            result.append(self.get_lemmas(tokens[i]))
        
        flatten_result = [x for xs in result for x in xs]
        return flatten_result


def main():

    # Simple usage example
    # text = "road's vehicles"
    # morphodita_tagger = Morphodita_Tagger()
    # result = morphodita_tagger.get_lemmas(text)
    # print(result)

    text = "It contains records of user's road vehicles, the owners and operators of these vehicles, lost, stolen, damaged and destroyed road vehicle registration certificates and registration plates."
    morphodita_tagger = Morphodita_Tagger()
    result = morphodita_tagger.get_lemmas_one_by_one(text)

    print(result)


if __name__ == "__main__":
    main()
