import time
import json
import os
import argparse
import sys

TEXT_FILTERING_DIRECTORY_NAME = "text-filtering"

sys.path.append(".")
sys.path.append(os.path.join(TEXT_FILTERING_DIRECTORY_NAME, "syntactic"))
sys.path.append(os.path.join(TEXT_FILTERING_DIRECTORY_NAME, "semantic"))

from definitions.utility import Field, FieldUI, TextFilteringVariation, UserChoice
from definitions.domain_modelling import DOMAIN_DESCRIPTIONS_COUNT, DOMAIN_MODELING_DIRECTORY_PATH, DOMAIN_MODELS
from utils.llm_assistant import LLMAssistant

ACTUAL_OUTPUT = "actual"
EXPECTED_OUTPUT = "expected"
TIMESTAMP_PREFIX = time.strftime("%Y-%m-%d-%H-%M-%S")

OUTPUT_DIRECTORY = "out"
OUTPUT_EXPECTED_DIRECTORY = os.path.join(OUTPUT_DIRECTORY, "expected")
OUTPUT_ACTUAL_DIRECTORY = os.path.join(OUTPUT_DIRECTORY, "actual")

# Settings
CSV_SEPARATOR = ","
CSV_HEADER = f"Class name{CSV_SEPARATOR}Generated description{CSV_SEPARATOR}Q1{CSV_SEPARATOR}Q2{CSV_SEPARATOR}Q3"


def generate_class_descriptions(llm_assistant, test_cases, text_filtering_variation, user_choice, domain_description):

    result = [CSV_HEADER]

    for test_case in test_cases:

        class_name = test_case["class"]
        single_field = llm_assistant.suggest_single_field(
            source_class=class_name, target_class="", user_choice=user_choice, domain_description=domain_description,
            text_filtering_variation=text_filtering_variation, field_name=Field.DESCRIPTION.value, original_text="", description="", name="")

        JSON = json.loads(single_field)
        description = JSON[Field.DESCRIPTION.value]
        result.append(f"\"{class_name}\"{CSV_SEPARATOR}\"{description}\"{CSV_SEPARATOR}")

    return result


def generate_actual_output(llm_assistant, domain_description, test_file_path, actual_output_file_path, user_choice, text_filtering_variation):

    with open(test_file_path, encoding="utf-8") as file:
        test_data = json.load(file)

    test_cases = test_data[user_choice]

    if user_choice == UserChoice.CLASSES.value:
        results = generate_class_descriptions(llm_assistant, test_cases, text_filtering_variation, user_choice, domain_description)

    with open(actual_output_file_path, "w", encoding="utf-8") as file:
        for result in results:
            file.write(f"{result}\n")


def main():

    parser = argparse.ArgumentParser(description="Suggestions generator")
    parser.add_argument("--user_choice", choices=[UserChoice.CLASSES.value, UserChoice.ATTRIBUTES.value, UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value,
                        UserChoice.ASSOCIATIONS_TWO_KNOWN_CLASSES.value], type=str, default=UserChoice.CLASSES.value, help="Elements to generate")
    parser.add_argument("--filtering", choices=[TextFilteringVariation.NONE.value, TextFilteringVariation.SYNTACTIC.value,
                        TextFilteringVariation.SEMANTIC.value], type=str, default=TextFilteringVariation.SYNTACTIC.value, help="Text filtering variation")

    args = parser.parse_args()

    user_choice = args.user_choice
    text_filtering_variation = args.filtering

    llm_assistant = LLMAssistant()

    for index, domain_model in enumerate(DOMAIN_MODELS):
        for i in range(DOMAIN_DESCRIPTIONS_COUNT[index]):

            file_index = i
            test_file_name = f"{user_choice}-expected-suggestions-0{file_index}.json"
            test_file_path = os.path.join(DOMAIN_MODELING_DIRECTORY_PATH, domain_model, test_file_name)

            if not os.path.isfile(test_file_path):
                raise ValueError(f"Test file not found: {test_file_path}")

            if not os.path.exists(OUTPUT_ACTUAL_DIRECTORY):
                os.makedirs(OUTPUT_ACTUAL_DIRECTORY)

            output_file_extension = ".csv"
            actual_output_file_path = os.path.join(
                OUTPUT_ACTUAL_DIRECTORY, f"{domain_model}-{user_choice}-{text_filtering_variation}-{ACTUAL_OUTPUT}-0{file_index}{output_file_extension}")
            domain_description_file_name = f"domain-description-0{file_index}.txt"
            domain_description_path = os.path.join(DOMAIN_MODELING_DIRECTORY_PATH, domain_model, domain_description_file_name)

            if not os.path.isfile(domain_description_path):
                raise ValueError(f"Domain description not found: {domain_description_path}")

            with open(domain_description_path, "r", encoding="utf-8") as file:
                domain_description = file.read()

            generate_actual_output(llm_assistant, domain_description, test_file_path,
                                   actual_output_file_path, user_choice, text_filtering_variation)


if __name__ == "__main__":
    main()
