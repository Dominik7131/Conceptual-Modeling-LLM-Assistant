import sys
sys.path.append('.')
import json
import os
from text_utility import TextUtility
from find_relevant_text_lemmatization import RelevantTextFinderLemmatization

PATH_TO_DATA_DIRECTORY = os.path.join("data", "56-2001-extract-llm-assistant-test-case")
TEST_DATA_FILE_PATH = f"{PATH_TO_DATA_DIRECTORY}relevant_texts.json"
INPUT_DOMAIN_DESCRIPTION_FILE_PATH = os.path.join(PATH_TO_DATA_DIRECTORY, "56-2001-extract-llm-assistant-test-case.txt")

class RAGTester:

    def test_lemmas_approach():
        test_cases = RAGTester.load_test_cases()
        relevant_text_finder = RelevantTextFinderLemmatization()

        with open(INPUT_DOMAIN_DESCRIPTION_FILE_PATH, 'r') as domain_description_file:
            domain_description = domain_description_file.read()

        are_all_tests_passing = True

        for test_case in test_cases:
            entity = test_case['entity']
            expected_relevant_texts = test_case['relevant_texts']

            actual_relevant_texts = relevant_text_finder.get(entity, domain_description)

            for expected_text in expected_relevant_texts:
                is_relevant_text_found = False
                for actual_relevant_text in actual_relevant_texts:
                    if expected_text in actual_relevant_text:
                        is_relevant_text_found = True
                        break

                if not is_relevant_text_found:
                    are_all_tests_passing = False
                    print(f"Test failed:\n- entity: {entity}\n- relevant text not found: {expected_text}")
            
        if are_all_tests_passing:
            print("All tests are passing")
    

    def output_relevant_text_for_given_entities():
        entities = ["vehicle type", "motorised vehicle", "structural component", "manufacturer", "vehicle system", "owner", "operator", "natural person", "business natural person", "address", "legal person", "registration", "registration application", "third party insurance", "insurance contract", "policy holder", "insurer", "green card", "technical inspection", "technical inspection report", "defect"]

        chunks, is_bullet_point_list, text_references = RelevantTextFinderLemmatization.load_chunks()
        print()
        
        for entity in entities:
            entity_lemmas = RelevantTextFinderLemmatization.get_lemmas(entity)
            relevant_texts = RelevantTextFinderLemmatization.get(entity_lemmas, chunks, is_bullet_point_list, text_references)
            print(f"Entity: {entity}")
            for text in relevant_texts:
                print(text)
            print()
            print()


    def test_RAG_approach(model, chunks, SCORE_NECESSARY_THRESHOLD, RANGE_FROM_TOP):

        # Import the module here so it is not loaded when not using this method
        from sentence_transformers import util

        test_cases = RAGTester.load_test_cases()
        are_all_tests_passing = True

        # "test_cases": [{"entity1": "", "relevant_texts": []}, {"entity2": "", "relevant_texts": [] }]
        # relevant_texts' -- list of relevant texts which must be in the RAG output
        
        queries = []
        for test_case in test_cases:
            entity = test_case['entity']
            queries.append(TextUtility.create_query(entity))

        queries_embeddings = model.encode(queries, convert_to_tensor=True)
        chunks_embeddings = model.encode(chunks, convert_to_tensor=True)

        scores = util.cos_sim(queries_embeddings, chunks_embeddings)
        min_score_in_relevant_texts_query_index = 0
        min_score_in_relevant_texts_chunk_index = 0
        min_score = 1
        min_score_text = ""

        max_range_distance = 0
        max_score_text = ""

        for test_case_index, test_case in enumerate(test_cases):
            relevant_texts = test_case['relevant_texts']

            max_score = scores[test_case_index].max().item()

            for text in relevant_texts:

                # Get chunk ID for the given text
                chunk_index = -1
                for i, chunk in enumerate(chunks):
                    if text in chunk:
                        chunk_index = i
                        # print(f"Found:\n- relevant text: {text}\n- chunk: {chunk}\n")
                        break
                
                if chunk_index == -1:
                    print(f"Error: relevant text not found in any of the chunks: \"{text}\"\nchunks:\n{chunks}")
                    continue
                
                score = scores[test_case_index, chunk_index]

                if score < min_score:
                    min_score_in_relevant_texts_query_index = test_case_index
                    min_score_in_relevant_texts_chunk_index = chunk_index
                    min_score_text = text
                    min_score = score
                
                threshold = max_score - RANGE_FROM_TOP
                if abs(score - threshold) > max_range_distance:
                    max_range_distance = abs(score - threshold)
                    max_score_text = text

                if score <= SCORE_NECESSARY_THRESHOLD or score < max_score - RANGE_FROM_TOP:
                    print(f"Test failed:\n- query: {queries[test_case_index]}\n- relevant text: {text}\n- score: {score}")
                    print(f"- max score: {max_score}")
                    are_all_tests_passing = False
        
        if are_all_tests_passing:
            print("All tests are passing")
        
        print(f"Minimal score in relevant texts: {scores[min_score_in_relevant_texts_query_index, min_score_in_relevant_texts_chunk_index]}\n- query: {queries[min_score_in_relevant_texts_query_index]}\n- text: {min_score_text}\n")
        print(f"Max range distance: {max_range_distance}\n- text: {max_score_text}")
    

    def load_test_cases():
        with open(TEST_DATA_FILE_PATH, 'r') as file:
            test_data = json.load(file)

        test_cases = test_data['test_cases']
        return test_cases


def main():
    RAGTester.test_lemmas_approach()

    #RAGTester.output_relevant_text_for_given_entities()


if __name__ == "__main__":
    main()