import logging
import json
import os

from ufal.morphodita import Tagger, Forms, TaggedLemmas, TokenRanges

CONFIG_FILE_PATH = os.path.join(
    "text-filtering", "syntactic", "morphodita-config.json")

# Code based on the `run_tagger` documentation: https://pypi.org/project/ufal.morphodita/
class MorphoditaTagger:

    def __init__(self):

        with open(CONFIG_FILE_PATH, "r", encoding="utf-8") as file:
            config = json.load(file)

        tagger_path = config["tagger_path"]
        self.tagger = Tagger.load(tagger_path)
        if not self.tagger:
            logging.error(f"Cannot load tagger from file: {tagger_path}")
            exit(1)

        self.forms = Forms()
        self.lemmas = TaggedLemmas()
        self.tokens = TokenRanges()
        self.tokenizer = self.tagger.newTokenizer()

        if self.tokenizer is None:
            logging.error("No tokenizer is defined for the supplied model")
            exit(1)

    def _encode_entities(self, text):

        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")

    def _split_into_tokens(self, text):

        self.tokenizer.setText(text)
        result = []

        while self.tokenizer.nextSentence(self.forms, self.tokens):
            self.tagger.tag(self.forms, self.lemmas)

            for i in range(len(self.lemmas)):
                token = self.tokens[i]
                token = self._encode_entities(
                    text[token.start: token.start + token.length])
                result.append(token.lower())
        return result

    def get_lemmas(self, text):

        self.tokenizer.setText(text)
        result = []

        while self.tokenizer.nextSentence(self.forms, self.tokens):
            self.tagger.tag(self.forms, self.lemmas)

            for index, lemma in enumerate(self.lemmas):
                lemma = self.lemmas[index]
                result.append(self._encode_entities(lemma.lemma).lower())

        return result

    def get_lemmas_one_by_one(self, text):

        # Same as `get_lemmas` method but instead of lemmatizing whole sentences lemmatize word by word

        tokens = self._split_into_tokens(text)
        result = []

        for token in tokens:

            # For example split "non-motorised vehicle" into "non", "motorised", "vehicle"
            if "-" in token:
                words = token.split("-")
                for word in words:
                    lemma = self.get_lemmas(word)
                    result.append(lemma)

            else:
                lemma = self.get_lemmas(token)
                result.append(lemma)

        flatten_result = [x for xs in result for x in xs]
        return flatten_result


def main():

    # Simple usage example
    text = "It contains records of user's road vehicles, the owners and operators of these vehicles, lost, stolen, damaged and destroyed road vehicle registration certificates and registration plates."
    morphodita_tagger = MorphoditaTagger()
    result = morphodita_tagger.get_lemmas_one_by_one(text)

    print(result)


if __name__ == "__main__":
    main()
