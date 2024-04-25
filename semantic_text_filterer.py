from sentence_transformers import SentenceTransformer, util
from text_utility import TextUtility
import os


SCORE_NECESSARY_THRESHOLD = 0.08
RANGE_FROM_TOP = 0.55 # E.g. if max score is 0.7 then invalidate any text with score lower than 0.7 - `RANGE_FROM_TOP`


class SemanticTextFilterer:

    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        # self.model = SentenceTransformer('all-mpnet-base-v2') # Symmetric
        # self.model = SentenceTransformer('msmarco-distilbert-base-v4') # Asymmetric
    
    def encode(self, queries):
        self.model.encode(queries, convert_to_tensor=True)
    

    def get(self, entity, domain_description):

        chunks = TextUtility.split_into_sentences(domain_description)
        query = f"Info about {entity}"

        queries_embeddings = self.model.encode(query, convert_to_tensor=True)
        chunks_embeddings = self.model.encode(chunks, convert_to_tensor=True)

        scores = util.cos_sim(queries_embeddings, chunks_embeddings)
        max_score = scores[0].max().item()

        threshold = max(max_score - RANGE_FROM_TOP, SCORE_NECESSARY_THRESHOLD)

        result = []

        for i in range(len(chunks)):
            score = scores[0, i]
            
            if score > threshold:
                result.append(chunks[i])
        
        return result


def main():

    # Simple usage example
    path = os.path.join("domain-modeling-benchmark", "domain-models", "farming 97627e23829afb", "domain-description-01.txt")
    with open(path) as file:
        domain_description = file.read()

    filterer = SemanticTextFilterer()
    entity = "farmer"
    actual_texts = filterer.get(entity, domain_description)
    print(actual_texts)


if __name__ == "__main__":
    main()