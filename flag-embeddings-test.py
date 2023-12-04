# Example from: https://huggingface.co/BAAI/bge-large-en-v1.5

from FlagEmbedding import FlagModel
from termcolor import cprint

#INPUT_TEXT = "What do you know about professors?"
INPUT_TEXT = "What do you know about Dormitory Units?"
#INPUT_TEXT = "Which part of the text contains info about courses?"


def print_green_on_black(x):
    return cprint(x, 'green', 'on_black')

def print_yellow_on_black(x):
    return cprint(x, 'yellow', 'on_black')


model = FlagModel('BAAI/bge-large-en-v1.5', 
                  query_instruction_for_retrieval="Represent this sentence for searching relevant passages: ",
                  use_fp16=True) # Setting use_fp16 to True speeds up computation with a slight performance degradation

text = """
Represent Professors and Students.
They both have a name.
Then there are also courses, which are taught by one or more professors, and are taken by five or more students.
Each course has a name and a number of credits.
Finally, Dormitory Units can host between 1 and 4 students. Each Dormitory Unit has a price.
"""

sentences = text.split(sep='\n')
sentences = [x for x in sentences if x != '']

# for s2p(short query to long passage) retrieval task, suggest to use encode_queries() which will automatically add the instruction to each query
# corpus in retrieval task can still use encode() or encode_corpus(), since they don't need instruction

queries = [INPUT_TEXT]
passages = sentences
q_embeddings = model.encode_queries(queries)
p_embeddings = model.encode(passages)
scores = q_embeddings @ p_embeddings.T

scores = scores.flatten()

print()
for i in range(len(sentences)):
    msg = f"Score: {scores[i]} | {sentences[i]}"
    if scores[i] >= 0.6:
        print_green_on_black(msg)
    elif scores[i] >= 0.53:
        print_yellow_on_black(msg)
    else:
        print(msg)

print()
