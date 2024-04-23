from flask import Flask, request
from flask_cors import CORS, cross_origin
from LLM_assistant import LLMAssistant
from text_utility import TextUtility
import json
import os
import time

app = Flask(__name__)
llm_assistant = None

PATH_TO_DATA_STORAGE = "storage"

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

    return llm_assistant.suggest(source_entity, target_entity, user_choice, 5, conceptual_model=[], domain_description=domain_description)



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

    timestamp = time.strftime('%Y-%m-%d-%H-%M-%S')
    file_to_write_path = f"{os.path.join(PATH_TO_DATA_STORAGE, timestamp)}.json"

    with open(file_to_write_path, 'w') as file:
        json.dump(completed_item, file)

    return "Done"


if __name__ == '__main__':
    llm_assistant = LLMAssistant()

    app.run(port=5000, threaded=True) # host="0.0.0.0"