from LLM_assistant import LLMAssistant, ITEMS_COUNT
from text_utility import ATTRIBUTES_STRING
import time
import json

PATH_TO_DATA_DIRECTORY = "data/56-2001-extract-llm-assistant-test-case/"
ATTRIBUTES_TEST_FILE_PATH = f"{PATH_TO_DATA_DIRECTORY}/attributes.json"
EXPECTED_OUTPUT_FILE_PATH = f"{PATH_TO_DATA_DIRECTORY}/expected_output.txt"
ACTUAL_OUTPUT_FILE_PATH = f"{PATH_TO_DATA_DIRECTORY}/actual_output.txt"
INPUT_DOMAIN_DESCRIPTION_FILE_PATH = "input_truncated.txt"
IS_GENERATE_EXPECTED_OUTPUT = False


def generate_expected_output():
    with open(ATTRIBUTES_TEST_FILE_PATH) as file:
        test_data = json.load(file)
    
    test_data_attributes = test_data['attributes']

    with open(EXPECTED_OUTPUT_FILE_PATH, 'w') as file:
        for test_case in test_data_attributes:
            file.write(f"Entity: {test_case['entity']}\n")
            write_output_to_file(file, test_case['expected_output'])
            file.write("\n")


def write_output_to_file(file, outputs):
    for index, output in enumerate(outputs):
        file.write(f"{index + 1}) {output['name']}\n")
        file.write(f"- inference: {output['inference']}\n")
        file.write(f"- data type: {output['data_type']}\n")
        if 'cardinality' in output:
            file.write(f"- cardinality: {output['cardinality']}\n")
        file.write("\n")


def main():
    
    if IS_GENERATE_EXPECTED_OUTPUT:
        generate_expected_output()
        return

    llm_assistant = LLMAssistant()

    with open(INPUT_DOMAIN_DESCRIPTION_FILE_PATH, 'r') as file:
        domain_description = file.read()
    
    with open(ATTRIBUTES_TEST_FILE_PATH) as file:
        test_data = json.load(file)
    
    test_data_attributes = test_data['attributes'][:2]

    with open(ACTUAL_OUTPUT_FILE_PATH, 'w') as file:
        for test_case in test_data_attributes:
            entity_name = test_case['entity']
            file.write(f"Entity: {entity_name}\n")

            suggested_items = llm_assistant.suggest(entity_name, "", ATTRIBUTES_STRING, ITEMS_COUNT, conceptual_model=[], domain_description=domain_description)

            write_output_to_file(file, suggested_items)
            file.write("\n")

if __name__ == "__main__":
    main()