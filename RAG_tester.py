import json
from sentence_transformers import util
from text_utility import TextUtility

PATH_TO_DATA_DIRECTORY = "data/56-2001-extract-llm-assistant-test-case/"
TEST_DATA_FILE_PATH = f"{PATH_TO_DATA_DIRECTORY}relevant_texts.json"

class RAGTester:

    def test(model, chunks, SCORE_NECESSARY_THRESHOLD, RANGE_FROM_TOP):

        with open(TEST_DATA_FILE_PATH, 'r') as file:
            test_data = json.load(file)

        test_cases = test_data['test_cases']
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