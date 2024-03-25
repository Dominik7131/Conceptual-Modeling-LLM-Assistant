from flask import Flask, request
from flask_cors import CORS, cross_origin
from LLM_assistant import LLMAssistant
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

def get_attribute_description():
    body_data = request.get_json()
    sourceEntity = body_data["sourceEntity"]
    attribute_name = body_data["attributeName"]
    domain_description = body_data["domainDescription"]
    field = body_data["field"]

    return llm_assistant.get_field_content(attribute_name, sourceEntity, domain_description, field)


@app.route('/summary1', methods=['POST'])
@cross_origin()
def summary1():

    body_data = request.get_json()
    domain_description = body_data["domainDescription"]
    conceptual_model = body_data["conceptualModel"]

    return llm_assistant.summarize_conceptual_model(conceptual_model, domain_description)


if __name__ == '__main__':
    llm_assistant = LLMAssistant()

    app.run(port=5000) # host="0.0.0.0"