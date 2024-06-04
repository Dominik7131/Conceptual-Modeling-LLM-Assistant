import argparse
from sentence_transformers import SentenceTransformer, util
import sys

sys.path.append(".")

from utils.text_splitter import TextSplitter
from definitions.utility import PRONOUNS_TO_DETECT


# Best settings for "all-MiniLM-L6-v2"
SCORE_NECESSARY_THRESHOLD = 0.08
# E.g. if max score is 0.7 then invalidate any text with score lower than 0.7 - `RANGE_FROM_TOP`
RANGE_FROM_TOP = 0.46

# Best settings for "all-mpnet-base-v2"
# SCORE_NECESSARY_THRESHOLD = 0.04
# RANGE_FROM_TOP = 0.52


class SemanticTextFilterer:

    def __init__(self):

        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        # self.model = SentenceTransformer("all-mpnet-base-v2") # Symmetric language model
        # self.model = SentenceTransformer("msmarco-distilbert-base-v4") # Asymmetric language model

    def _enhance_chunks(self, chunks):

        enhanced_chunks = []

        for index, sentence in enumerate(chunks):
            if index == 0:
                enhanced_chunks.append(sentence)
                continue

            is_sentence_enhanced = False
            for pronoun in PRONOUNS_TO_DETECT:
                if sentence.startswith(pronoun):
                    is_sentence_enhanced = True
                    enhanced_chunks.append(f"{chunks[index - 1]} {sentence}")
                    break

            if not is_sentence_enhanced:
                enhanced_chunks.append(sentence)

        return enhanced_chunks

    def get(self, clss, domain_description):

        chunks = TextSplitter.split_into_sentences(domain_description)
        enhanced_chunks = self._enhance_chunks(chunks)

        query = f"Info about {clss}"

        queries_embeddings = self.model.encode(query, convert_to_tensor=True)
        chunks_embeddings = self.model.encode(
            enhanced_chunks, convert_to_tensor=True)

        scores = util.cos_sim(queries_embeddings, chunks_embeddings)
        max_score = scores[0].max().item()

        threshold = max(max_score - RANGE_FROM_TOP, SCORE_NECESSARY_THRESHOLD)

        result = []

        for index, chunk in enumerate(chunks):
            score = scores[0, index]

            if score > threshold:
                result.append(chunk)

        return result


def main():

    # Simple usage example
    default_class = "student"
    default_domain_description = "Students are at school. They are studying. Hello world. Professors teach students."

    parser = argparse.ArgumentParser(description="Semantic text filterer")
    parser.add_argument("-c", "--clss", type=str, default=default_class,
                        help="Provide class for filtering the given text")
    parser.add_argument("-t", "--text", type=str,
                        default=default_domain_description, help="Provide text to filter")

    args = parser.parse_args()
    clss = args.clss
    text = args.text

    filterer = SemanticTextFilterer()

    print(f"Inputed class: {clss}")
    print(f"Inputed text: {text}\n")
    print("Relevant texts: ")

    relevant_texts = filterer.get(clss, text)

    print(relevant_texts)


if __name__ == "__main__":
    main()
