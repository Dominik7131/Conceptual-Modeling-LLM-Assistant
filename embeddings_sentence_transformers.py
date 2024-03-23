from sentence_transformers import SentenceTransformer, util
from termcolor import cprint
from text_utility import TextUtility
from RAG_tester import RAGTester
import logging
import os
import numpy as np


logging.basicConfig(level=logging.INFO, format="%(message)s")

SCORE_NECESSARY_THRESHOLD = 0.2
SCORE_MIN_THRESHOLD = 0.5
RANGE_FROM_TOP = 0.4 # E.g. if max score is 0.7 then invalidate any text with score lower than 0.7 - `RANGE_FROM_TOP`
IS_CACHING = False
PATH_TO_DATA_DIRECTORY = os.path.join("data", "56-2001-extract-llm-assistant-test-case")
INPUT_FILE_PATH = os.path.join(PATH_TO_DATA_DIRECTORY, "56-2001-extract-llm-assistant-test-case.txt")
OUTPUT_FILE_NAME = "out.txt"
IS_TESTING = False

ENTITY = "structural component"

def print_green_on_black(x):
    return cprint(x, 'green', 'on_black')

def print_yellow_on_black(x):
    return cprint(x, 'yellow', 'on_black')

def print_red_on_black(x):
    return cprint(x, 'red', 'on_black')


def show_result(scores, chunks, min_score_threshold):
    is_any_score_higher_than_threshold = False

    for i in range(len(chunks)):
        if scores[0][i] > min_score_threshold:
            is_any_score_higher_than_threshold = True
            break

    if not is_any_score_higher_than_threshold:
        return show_result(scores, chunks, min_score_threshold - 0.05)

    with open(OUTPUT_FILE_NAME, "w") as output:
        max_score = scores[0].max()

        previous_written_chunk_index = 0
        for i in range(len(chunks)):
            score = scores[0][i]
            msg = f"Score: {score} | {chunks[i]}"


            if score > SCORE_NECESSARY_THRESHOLD and score > max_score - RANGE_FROM_TOP:
                # Separate consecutive chunks by whitespace
                if previous_written_chunk_index + 1 == i:
                    output.write(f"{chunks[i]} ")

                # Separate non-consecutive chunks by a new line
                else:
                    output.write(f"{chunks[i]}\n")
                
                previous_written_chunk_index = i


            if score >= min_score_threshold:
                print_green_on_black(msg)
            elif score <= SCORE_NECESSARY_THRESHOLD:
                print_red_on_black(msg)
            else:
                print(msg)


def main():

    model = SentenceTransformer('all-MiniLM-L6-v2') # Symmetric
    # model = SentenceTransformer('all-mpnet-base-v2') # Symmetric
    # model = SentenceTransformer('msmarco-distilbert-base-v4') # Asymmetric
    
    chunks = TextUtility.split_file_into_chunks(INPUT_FILE_PATH)

    if IS_TESTING:
        RAGTester.test_RAG_approach(model, chunks, SCORE_NECESSARY_THRESHOLD, RANGE_FROM_TOP)
        return

    query = TextUtility.create_query(ENTITY)
    queries = [query]
    queries_embeddings = model.encode(queries, convert_to_tensor=True)

    chunks_embeddings = None
    if IS_CACHING:
        cached_file_name = f"{INPUT_FILE_PATH}_embeddings.npy"
        if os.path.isfile(cached_file_name):
            logging.debug(f"Using cached embeddings from: {cached_file_name}")
            chunks_embeddings = np.load(cached_file_name)
        else:
            logging.debug(f"Saving embeddings into cache")
            chunks_embeddings = model.encode(chunks, convert_to_tensor=True)
            np.save(cached_file_name, chunks_embeddings)
    else:
        chunks_embeddings = model.encode(chunks, convert_to_tensor=True)



    scores = util.cos_sim(queries_embeddings, chunks_embeddings)

    show_result(scores, chunks, SCORE_MIN_THRESHOLD)
    print()


if __name__ == "__main__":
    main()