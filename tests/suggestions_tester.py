import sys
sys.path.append('.')
from LLM_assistant import LLMAssistant, ITEMS_COUNT
from text_utility import ATTRIBUTES_STRING, RELATIONSHIPS_STRING
import time
import json

PATH_TO_DATA_DIRECTORY = "data/56-2001-extract-llm-assistant-test-case"
INPUT_DOMAIN_DESCRIPTION_FILE_PATH = f"{PATH_TO_DATA_DIRECTORY}/56-2001-extract-llm-assistant-test-case.txt"
IS_A_RELATIONSHIPS_STRING = "is_a_relationships"
ACTUAL_OUTPUT = "actual-output"
EXPECTED_OUTPUT = "expected-output"
TIMESTAMP_PREFIX = time.strftime('%Y-%m-%d-%H-%M-%S')

# Settings
IS_GENERATE_EXPECTED_OUTPUT = False
USER_CHOICE = ATTRIBUTES_STRING


def generate_expected_output(test_file_path, output_file_path):
    with open(test_file_path) as file:
        test_data = json.load(file)
    
    test_cases = test_data[USER_CHOICE]

    with open(output_file_path, 'w') as file:
        for test_case in test_cases:
            file.write(f"Entity: {test_case['entity']}\n")
            write_outputs_to_file(file, test_case['expected_output'])
            file.write("\n")


def write_outputs_to_file(file, outputs):
    for index, output in enumerate(outputs):
        file.write(f"{index + 1}) {output['name']}\n")

        for key in output:
            # We already outputed the name
            if key == "name":
                continue

            file.write((f"- {key}: {output[key]}\n"))

        file.write("\n")


def write_output_to_file(file, index, output):
    file.write(f"{index}) {output['name']}\n")

    for key in output:
        # We already outputed the name
        if key == "name":
            continue

        file.write((f"- {key}: {output[key]}\n"))

    file.write("\n")

def main():

    test_file_path = f"{PATH_TO_DATA_DIRECTORY}/{USER_CHOICE}.json"
    expected_output_file_path = f"{PATH_TO_DATA_DIRECTORY}/{USER_CHOICE}_{EXPECTED_OUTPUT}.txt"
    actual_output_file_path = f"{PATH_TO_DATA_DIRECTORY}/{TIMESTAMP_PREFIX}-{USER_CHOICE}-{ACTUAL_OUTPUT}.txt"
 
    if IS_GENERATE_EXPECTED_OUTPUT:
        generate_expected_output(test_file_path, expected_output_file_path)
        return

    llm_assistant = LLMAssistant()

    with open(INPUT_DOMAIN_DESCRIPTION_FILE_PATH, 'r') as file:
        domain_description = file.read()
    
    with open(test_file_path) as file:
        test_data = json.load(file)
    
    test_data_attributes = test_data[USER_CHOICE]

    with open(actual_output_file_path, 'w') as file:
        for test_case in test_data_attributes[2:]:
            entity_name = test_case['entity']
            file.write(f"Entity: {entity_name}\n")

            user_choice = USER_CHOICE
            if USER_CHOICE == IS_A_RELATIONSHIPS_STRING:
                user_choice = RELATIONSHIPS_STRING

            iterator = llm_assistant.suggest(entity_name, "", user_choice, ITEMS_COUNT, conceptual_model=[], domain_description=domain_description)

            for index, suggested_item in enumerate(iterator):
                suggested_item = json.loads(suggested_item)
                write_output_to_file(file, index, suggested_item)
                file.write("\n")

if __name__ == "__main__":
    main()
