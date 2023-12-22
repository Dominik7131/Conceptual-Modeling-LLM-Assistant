# Example from: https://huggingface.co/BAAI/bge-large-en-v1.5

from FlagEmbedding import FlagModel
from termcolor import cprint
import numpy as np
import os
import time
from text_utility import TextUtility

#INPUT_TEXT = "What do you know about Dormitory Units?"
#INPUT_TEXT = "Which part of the text contains info about courses?"
#INPUT_TEXT = "Course mentions"
INPUT_TEXT = "Info about courses"
#INPUT_TEXT = "What do you know about professors?"


def print_green_on_black(x):
    return cprint(x, 'green', 'on_black')

def print_yellow_on_black(x):
    return cprint(x, 'yellow', 'on_black')

TEXT = """
Represent Professors and Students.
They both have a name.
Then there are also courses, which are taught by one or more professors, and are taken by five or more students.
Each course has a name and a number of credits.
Finally, Dormitory Units can host between 1 and 4 students.
Each Dormitory Unit has a price.
"""

TEXT2 = """
"We know that courses have a name and a specific number of credits.
Each course can have one or more professors, who have a name.
Professors could participate in any number of courses.
For a course to exist, it must aggregate, at least, five students, where each student has a name.
Students can be enrolled in any number of courses.
Finally, students can be accommodated in dormitories, where each dormitory can have from one to four students.
Besides, each dormitory has a price."
"""

TEXT3 = "We know that courses have a name and a specific number of credits. Each course can have one or more professors, who have a name. Professors could participate in any number of courses. For a course to exist, it must aggregate, at least, five students, where each student has a name. Students can be enrolled in any number of courses. Finally, students can be accommodated in dormitories, where each dormitory can have from one to four students. Besides, each dormitory has a price."

class Embeddings:
    def __init__(self):
        self.passage_embeddings = None
        query_instruction_for_retrieval = "Represent this sentence for searching relevant passages: "
        self.model = FlagModel('BAAI/bge-large-en-v1.5', query_instruction_for_retrieval=query_instruction_for_retrieval,
                  use_fp16=False) # Setting use_fp16 to True speeds up computation with a slight performance degradation

    # for s2p(short query to long passage) retrieval task, suggest to use encode_queries() which will automatically add the instruction to each query
    # corpus in retrieval task can still use encode() or encode_corpus(), since they don't need instruction
    def encode_queries(self, queries):
        return self.model.encode_queries(queries)


    def encode(self, chunks_of_text):
        return self.model.encode(chunks_of_text)


    def compare_two_names(self, name1, name2):
        name1_encoded = self.encode(name1)
        name2_encoded = self.encode(name2)

        scores = name1_encoded @ name2_encoded.T
        scores = scores.flatten()
        return scores[0]

    
    def remove_unsimilar_text(self, queries, plain_text, is_debug=True):
        sentences = TextUtility.split_into_sentences(plain_text)

        queries_embeddings = self.encode_queries(queries)

        is_caching = True
        if is_caching:
            if os.path.isfile('cached_embeddings.npy'):
                self.passage_embeddings = np.load('cached_embeddings.npy')
            else:
                self.passage_embeddings = self.encode(sentences)
                np.save('cached_embeddings.npy', self.passage_embeddings)
        else:
            if self.passage_embeddings == None:
                self.passage_embeddings = self.encode(sentences)
        
        scores = queries_embeddings @ self.passage_embeddings.T
        scores = scores.flatten()
        scores_min_threshold = 0.52

        if is_debug:
            print(f"Input: {queries[0]}")
            for i in range(len(sentences)):
                msg = f"Score: {scores[i]} | {sentences[i]}"
                if scores[i] >= 0.6:
                    print_green_on_black(msg)
                elif scores[i] >= scores_min_threshold:
                    print_yellow_on_black(msg)
                else:
                    print(msg)
        print()

        result = ""
        for i in range(len(sentences)):
            if scores[i] >= scores_min_threshold:
                result += sentences[i] + ' '
        
        return result[:-1]

def main():

    time_start = time.time()

    embeddings = Embeddings()
    result = embeddings.remove_unsimilar_text(queries=[INPUT_TEXT], plain_text=TEXT3)
    print(result)

    time_end = time.time()
    print(f"\nTime: {time_end - time_start:.2f} seconds")

if __name__ == "__main__":
    main()