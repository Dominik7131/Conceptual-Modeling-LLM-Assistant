from flask import Flask, request
from flask_cors import CORS, cross_origin
from LLM_assistant import LLMAssistant
from text_utility import TextUtility
import json
import time

app = Flask(__name__)
llm_assistant = None

# CORS error from frontend solution: https://stackoverflow.com/a/33091782
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type' 


@app.route('/suggest', methods=['POST'])
@cross_origin()
def suggest():

    body_data = request.get_json()
    source_entity = body_data["sourceEntity"]
    target_entity = body_data["targetEntity"]
    user_choice = body_data["userChoice"]
    domain_description = body_data["domainDescription"]

    return llm_assistant.suggest(source_entity, target_entity, user_choice, 5, conceptual_model=[], domain_description=domain_description)


@app.route('/getOnly', methods=['POST'])
@cross_origin()
def generate_single_field():

    body_data = request.get_json()
    source_entity = body_data["sourceEntity"]
    target_entity = body_data["targetEntity"]
    name = body_data["name"]
    field = body_data["field"]
    domain_description = body_data["domainDescription"]
    user_choice = body_data["userChoice"]

    print(field)

    return llm_assistant.generate_single_field(user_choice, name, source_entity, target_entity, domain_description, field)


@app.route('/summary1', methods=['POST'])
@cross_origin()
def summary1():

    body_data = request.get_json()
    domain_description = body_data["domainDescription"]
    conceptual_model = body_data["conceptualModel"]

    return llm_assistant.summarize_conceptual_model1(conceptual_model, domain_description)


@app.route('/summary2', methods=['POST'])
@cross_origin()
def summary2():

    body_data = request.get_json()
    domain_description = body_data["domainDescription"]
    conceptual_model = body_data["conceptualModel"]

    return llm_assistant.summarize_conceptual_model2(conceptual_model, domain_description)


@app.route('/merge_original_texts', methods=['POST'])
@cross_origin()
def merge_original_texts():

    body_data = request.get_json()
    original_text_indexes_object = body_data["originalTextIndexesObject"]
    print(f"Received: {original_text_indexes_object}\n")

    parsed_original_text_indexes_object = [(item['indexes'][0], item['indexes'][1], item['label']) for item in original_text_indexes_object]
    result = TextUtility.merge_original_texts(parsed_original_text_indexes_object)

    return result

if __name__ == '__main__':
    llm_assistant = LLMAssistant()

    app.run(port=5000) # host="0.0.0.0"