from llama_index import SimpleDirectoryReader, VectorStoreIndex, get_response_synthesizer
from llama_index import ServiceContext
from llama_index.embeddings import HuggingFaceEmbedding
from llama_index.retrievers import VectorIndexRetriever
from llama_index.query_engine import RetrieverQueryEngine
from llama_index.postprocessor import SimilarityPostprocessor
from llama_index.text_splitter import SentenceSplitter
from llama_index.schema import TextNode

from termcolor import cprint

def print_red_on_black(x):
    return cprint(x, 'red', 'on_black', end="")

def print_green_on_black(x):
    return cprint(x, 'green', 'on_black', end="")

text = """
Represent Professors and Students.
They both have a name.
Then there are also courses, which are taught by one or more professors, and are taken by five or more students.
Each course has a name and a number of credits.
Finally, Dormitory Units can host between 1 and 4 students. Each Dormitory Unit has a price.
"""

text_splitter = SentenceSplitter(chunk_size=20, chunk_overlap=10)

# Models leaderboard: https://huggingface.co/spaces/mteb/leaderboard
service_context = ServiceContext.from_defaults(embed_model="local:BAAI/bge-large-en-v1.5", llm=None, text_splitter=text_splitter)

path = "documents_storage"
documents = SimpleDirectoryReader(path).load_data()

# Let the text be split automatically
#index = VectorStoreIndex.from_documents(documents, service_context=service_context)

sentences = text.split(sep='\n')
sentences = [x for x in sentences if x != '']
nodes = []

# Make embeddings from the sentences
for sentence in sentences:
    node = TextNode()
    node_embedding = service_context.embed_model.get_text_embedding(sentence)
    node.embedding = node_embedding
    node.text = sentence
    nodes.append(node)
    vector_store = VectorStoreIndex(nodes, service_context=service_context)

retriever = VectorIndexRetriever(index=vector_store, similarity_top_k=3)
response_synthesizer = get_response_synthesizer(service_context=service_context)
query_engine = RetrieverQueryEngine(retriever=retriever, response_synthesizer=response_synthesizer,
                                    node_postprocessors=[SimilarityPostprocessor(similarity_cutoff=0.3)])

input_text = "All information about courses"
# Expected answer: Each course has a name and a number of credits.
response = query_engine.query(input_text)

similar_texts = []

for node in response.source_nodes:
    print("Text: " + node.text)
    print("Score: " + str(node.score))
    similar_texts.append(node.text.replace('\n', ' '))
    print()

print("Full text: ")

# Print nicely which part was highlighted by the corresponding similar vector embeddings
i = 0
iterations_to_skip = 0
while True:
    if i >= len(text):
        break

    for similar_text in similar_texts:
        if text[i:].startswith(similar_text):
            print_green_on_black(similar_text[iterations_to_skip:])
            iterations_to_skip = len(similar_text[iterations_to_skip:])
            break
    
    if iterations_to_skip > 0:
        i += 1
        iterations_to_skip -= 1
        continue
    
    print(str(text[i]), end="")
    i += 1
print()