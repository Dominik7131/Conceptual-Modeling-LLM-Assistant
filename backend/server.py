import argparse
import json
import os
import time
from flask import Flask, request
from flask_cors import CORS

from definitions.utility import Field, UserChoice
from utils.llm_assistant import LLMAssistant
from utils.original_text_merger import OriginalTextMerger
from utils.prompt_manager import PromptManager


STORAGE_DIRECTORY = "storage"
DEFAULT_PORT = 5000

app = Flask(__name__)
llm_assistant = None
prompt_manager = None

cors = CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"


@app.route("/suggest/items", methods=["POST"])
def suggest_items():

    body_data = request.get_json()
    source_class = body_data.get("sourceClass", "")
    target_class = body_data.get("targetClass", "")

    user_choice = body_data["userChoice"]
    domain_description = body_data["domainDescription"]
    text_filtering_variation = body_data["textFilteringVariation"]
    conceptual_model = body_data.get("conceptualModel", {})

    return llm_assistant.suggest_items(
        source_class=source_class, target_class=target_class, user_choice=user_choice, domain_description=domain_description,
        text_filtering_variation=text_filtering_variation, conceptual_model=conceptual_model, items_count_to_suggest=5)


@app.route("/suggest/single_field", methods=["POST"])
def suggest_single_field():

    body_data = request.get_json()
    source_class = body_data.get("sourceClass", "")
    target_class = body_data.get("targetClass", "")

    name = body_data["name"]
    description = body_data.get("description", "")
    original_text = body_data.get("originalText", "")
    field = body_data["field"]
    domain_description = body_data["domainDescription"]
    user_choice = body_data["userChoice"]
    text_filtering_variation = body_data["textFilteringVariation"]

    if user_choice == "associations":
        user_choice = UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value

    single_field = llm_assistant.suggest_single_field(
        user_choice=user_choice, name=name, description=description, original_text=original_text,
        source_class=source_class, target_class=target_class, domain_description=domain_description,
        field_name=field, text_filtering_variation=text_filtering_variation)

    if not single_field:
        single_field = ""

    return single_field


@app.route("/suggest/summary", methods=["POST"])
def suggest_summary():

    body_data = request.get_json()
    summary_type = body_data["summaryType"]
    domain_description = body_data["domainDescription"]
    conceptual_model = body_data["conceptualModel"]
    style = body_data.get("style", "")

    if summary_type == UserChoice.SUMMARY_PLAIN_TEXT.value:
        return llm_assistant.suggest_summary_plain_text(conceptual_model, domain_description, style)

    if summary_type == UserChoice.SUMMARY_DESCRIPTIONS.value:
        return llm_assistant.suggest_summary_descriptions(conceptual_model, domain_description)

    raise ValueError(f"Received unexpected summary type: {summary_type}")


@app.route("/merge_original_texts", methods=["POST"])
def merge_original_texts():

    body_data = request.get_json()
    original_text_indexes_object = body_data["originalTextIndexesObject"]

    parsed_original_text_indexes_object = [(item["indexes"][0], item["indexes"][1], item["label"])
                                           for item in original_text_indexes_object]
    result = OriginalTextMerger.merge(parsed_original_text_indexes_object)

    return result


def save_item_to_storage(item):

    timestamp = time.strftime("%Y-%m-%d-%H-%M-%S")
    file_to_write_path = f"{os.path.join(STORAGE_DIRECTORY, timestamp)}.json"

    with open(file_to_write_path, "w", encoding="utf-8") as file:
        json.dump(item, file)


@app.route("/save/suggested_item", methods=["POST"])
def save_suggested_item():

    body_data = request.get_json()
    user_choice = body_data["userChoice"]
    domain_description = body_data["domainDescription"]
    item = body_data["item"]
    is_positive = body_data["isPositive"]
    text_filtering_variation = body_data["textFilteringVariation"]

    completed_item = {"domain_description": domain_description, "item": item, "is_positive": is_positive}

    is_domain_description = domain_description != ""
    prompt = prompt_manager.get_prompt(user_choice=user_choice, is_domain_description=is_domain_description)
    completed_item["prompt"] = prompt

    if user_choice not in UserChoice.CLASSES.value:
        relevant_texts = llm_assistant.get_relevant_texts(
            domain_description=domain_description, source_class=item[Field.SOURCE_CLASS.value], filtering_variation=text_filtering_variation)
        completed_item["filtered_domain_description"] = relevant_texts

    save_item_to_storage(completed_item)

    return "Done"


@app.route("/save/suggested_single_field", methods=["POST"])
def save_suggested_single_field():

    body_data = request.get_json()
    user_choice = body_data["userChoice"]
    field_name = body_data["fieldName"]
    field_text = body_data["fieldText"]
    source_class = body_data.get("sourceClass", "")
    domain_description = body_data["domainDescription"]
    is_positive = body_data["isPositive"]
    text_filtering_variation = body_data["textFilteringVariation"]
    item = body_data.get("item", {})

    completed_item = {"domain_description": domain_description, "field_name": field_name,
                      "field_text": field_text, "is_positive": is_positive}

    if field_name == Field.NAME.value:
        completed_item[Field.DESCRIPTION.value] = item[Field.DESCRIPTION.value]
        completed_item[Field.ORIGINAL_TEXT.value] = item[Field.ORIGINAL_TEXT.value]

    is_domain_description = domain_description != ""
    prompt = prompt_manager.get_prompt(user_choice=user_choice, field_name=field_name, is_domain_description=is_domain_description)
    completed_item["prompt"] = prompt

    relevant_texts = llm_assistant.get_relevant_texts(
        domain_description=domain_description, source_class=source_class, filtering_variation=text_filtering_variation)
    completed_item["filtered_domain_description"] = relevant_texts

    save_item_to_storage(completed_item)

    return "Done"


@app.route("/save/suggested_summary", methods=["POST"])
def save_suggested_summary():

    body_data = request.get_json()
    summary_type = body_data["summaryType"]
    domain_description = body_data["domainDescription"]
    conceptual_model = body_data["conceptualModel"]
    summary = body_data["summary"]
    is_positive = body_data["isPositive"]
    style = body_data.get("style", "")

    completed_item = {"domain_description": domain_description, "summary": summary,
                      "style": style, "is_positive": is_positive, "conceptual_model": conceptual_model}

    is_domain_description = domain_description != ""
    prompt = prompt_manager.get_prompt(user_choice=summary_type, is_domain_description=is_domain_description,
                                       summary_plain_text_style=style)
    completed_item["prompt"] = prompt

    save_item_to_storage(completed_item)

    return "Done"


@app.route('/')
def index():

    return "<p>LLM assistant server</p>"


def main():

    global llm_assistant, prompt_manager

    parser = argparse.ArgumentParser(description="Start LLM assistant server")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help="Port to run the server on")

    if not os.path.exists(STORAGE_DIRECTORY):
        os.makedirs(STORAGE_DIRECTORY)

    args = parser.parse_args()
    port = args.port

    llm_assistant = LLMAssistant()
    prompt_manager = PromptManager()

    app.run(port=port, threaded=False, host="0.0.0.0")


if __name__ == "__main__":
    main()
