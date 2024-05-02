from flask import Flask, request
from flask_cors import CORS, cross_origin
from LLM_assistant import LLMAssistant
from text_utility import LOGGER_NAME, TextUtility
import json
import os
import time
import logging

app = Flask(__name__)
llm_assistant = None

TIMESTAMP = time.strftime('%Y-%m-%d-%H-%M-%S')
LOG_DIRECTORY = "logs"
LOG_FILE_PATH = os.path.join(LOG_DIRECTORY, f"{TIMESTAMP}-log.txt")

logging.basicConfig(level=logging.DEBUG, format="%(message)s", filename=LOG_FILE_PATH, filemode='w')
logger = logging.getLogger(LOGGER_NAME)


STORAGE_DIRECTORY = "storage"

# CORS error from frontend solution: https://stackoverflow.com/a/33091782
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type' 


@app.route('/suggest', methods=['POST'])
def suggest():

    body_data = request.get_json()
    source_entity = body_data["sourceEntity"]
    target_entity = body_data["targetEntity"]
    user_choice = body_data["userChoice"]
    domain_description = body_data["domainDescription"]

    return llm_assistant.suggest(source_entity, target_entity, user_choice, domain_description=domain_description, count_items_to_suggest=5)



@app.route('/getOnly', methods=['POST'])
def generate_single_field():

    body_data = request.get_json()
    source_entity = body_data["sourceEntity"]
    target_entity = body_data["targetEntity"]
    name = body_data["name"]
    field = body_data["field"]
    domain_description = body_data["domainDescription"]
    user_choice = body_data["userChoice"]

    return llm_assistant.generate_single_field(user_choice, name, source_entity, target_entity, domain_description, field)


@app.route('/summary_plain_text', methods=['POST'])
def summary_plain_text():

    body_data = request.get_json()
    domain_description = body_data["domainDescription"]
    conceptual_model = body_data["conceptualModel"]

    return llm_assistant.summarize_conceptual_model_plain_text(conceptual_model, domain_description)


@app.route('/summary_descriptions', methods=['POST'])
def summary_descriptions():

    body_data = request.get_json()
    domain_description = body_data["domainDescription"]
    conceptual_model = body_data["conceptualModel"]

    return llm_assistant.summarize_conceptual_model_descriptions(conceptual_model, domain_description)


@app.route('/merge_original_texts', methods=['POST'])
def merge_original_texts():

    body_data = request.get_json()
    original_text_indexes_object = body_data["originalTextIndexesObject"]
    # print(f"Received: {original_text_indexes_object}\n")

    parsed_original_text_indexes_object = [(item['indexes'][0], item['indexes'][1], item['label']) for item in original_text_indexes_object]
    result = TextUtility.merge_original_texts(parsed_original_text_indexes_object)

    return result


@app.route('/save_suggestion', methods=['POST'])
def save_suggestion():

    body_data = request.get_json()
    domain_description = body_data["domainDescription"]
    item = body_data["item"]
    isPositive = body_data["isPositive"]

    completed_item = { "domain_description": domain_description, "item": item, "is_positive": isPositive }

    # TODO: Check storage size
    # If the storage size > 100MB then print warning and do not store anything


    timestamp = time.strftime('%Y-%m-%d-%H-%M-%S')
    file_to_write_path = f"{os.path.join(STORAGE_DIRECTORY, timestamp)}.json"

    with open(file_to_write_path, 'w') as file:
        json.dump(completed_item, file)

    return "Done"


if __name__ == '__main__':

    if (not os.path.exists(LOG_DIRECTORY)):
        os.makedirs(LOG_DIRECTORY)
    
    if (not os.path.exists(STORAGE_DIRECTORY)):
        os.makedirs(STORAGE_DIRECTORY)

    llm_assistant = LLMAssistant()

    app.run(port=5000, threaded=True) # host="0.0.0.0"