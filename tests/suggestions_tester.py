import sys
sys.path.append('.')
from LLM_assistant import LLMAssistant, ITEMS_COUNT
from text_utility import TextUtility, UserChoice
import time
import json
import os


PATH_TO_DATA_DIRECTORY = os.path.join("data", "56-2001-extract-llm-assistant-test-case")
INPUT_DOMAIN_DESCRIPTION_FILE_PATH = os.path.join(PATH_TO_DATA_DIRECTORY, "56-2001-extract-llm-assistant-test-case.txt")
#INPUT_DOMAIN_DESCRIPTION_FILE_PATH = os.path.join(PATH_TO_DATA_DIRECTORY, "medium", "01_domain_description.txt")
IS_A_RELATIONSHIPS_STRING = "is_a_relationships"
ACTUAL_OUTPUT = "actual-output"
EXPECTED_OUTPUT = "expected-output"
TIMESTAMP_PREFIX = time.strftime('%Y-%m-%d-%H-%M-%S')

# Settings
IS_GENERATE_EXPECTED_OUTPUT = False
USER_CHOICE = UserChoice.RELATIONSHIPS
IS_SKIP_IS_A_RELATIONSHIPS = True


def generate_expected_output(test_file_path, output_file_path, test_name):
    with open(test_file_path) as file:
        test_data = json.load(file)

    test_cases = test_data[test_name]

    with open(output_file_path, 'w') as file:
        for index, test_case in enumerate(test_cases):
            if USER_CHOICE == UserChoice.ENTITIES:
                file.write(f"Entity: {test_case}\n")

            elif test_name == "relationships":
                # source_entity = TextUtility.convert_name_to_standard_convention(test_case['source_entity'])
                # target_entity = TextUtility.convert_name_to_standard_convention(test_case['target_entity'])
                # file.write(f"Entities: ({source_entity}, {target_entity})\n")
                write_to_file(file, index, test_case)

            else:
                file.write(f"Entity: {test_case['entity']}\n")
                write_outputs_to_file(file, test_case['expected_output'])
            file.write("\n")


def write_outputs_to_file(file, outputs):
    for index, output in enumerate(outputs):
        write_to_file(file, index, output)


def write_to_file(file, index, output):
    file.write(f"{index + 1}) {output['name']}\n")

    for key in output:
        # We already outputed the name
        if key == "name" or key == "inference_indexes":
            continue

        file.write((f"- {key}: {output[key]}\n"))

    file.write("\n")


# TODO: Merge this with the implementation in the main method
def test_relationships(llm_assistant, test_data_json, domain_description, actual_output_file_path):
    test_data = test_data_json[UserChoice.RELATIONSHIPS]

    iterations_count = 0
    tested_relationships = []

    with open(actual_output_file_path, 'w') as file:
        for test_case in test_data:
            source_entity = TextUtility.convert_name_to_standard_convention(test_case['source_entity'])
            target_entity = TextUtility.convert_name_to_standard_convention(test_case['target_entity'])

            if IS_SKIP_IS_A_RELATIONSHIPS:
                if test_case['name'] == 'is-a':
                    continue
            
            if iterations_count >= 20:
                break

            if USER_CHOICE == UserChoice.RELATIONSHIPS2:
                is_relationship_already_tested = (source_entity, target_entity) in tested_relationships
                if is_relationship_already_tested:
                    continue
                else:
                    tested_relationships.append((source_entity, target_entity))

            elif USER_CHOICE == UserChoice.RELATIONSHIPS:
                target_entity = ""
                is_relationship_already_tested = source_entity in tested_relationships
                if is_relationship_already_tested:
                    continue
                else:
                    tested_relationships.append(source_entity)            

            iterations_count += 1

            file.write(f"Entities: ({source_entity}, {target_entity})\n")

            iterator = llm_assistant.suggest(source_entity, target_entity, USER_CHOICE, ITEMS_COUNT, conceptual_model=[], domain_description=domain_description)

            for index, suggested_item in enumerate(iterator):
                suggested_item = json.loads(suggested_item)
                write_to_file(file, index, suggested_item)
                file.write("\n")



def main():

    test_name = USER_CHOICE
    if USER_CHOICE == UserChoice.RELATIONSHIPS or USER_CHOICE == UserChoice.RELATIONSHIPS2 or USER_CHOICE == IS_A_RELATIONSHIPS_STRING:
        test_name = "relationships"

    test_file_path = os.path.join(PATH_TO_DATA_DIRECTORY, f"{test_name}.json")
    expected_output_file_path = os.path.join(PATH_TO_DATA_DIRECTORY, f"{USER_CHOICE}-{EXPECTED_OUTPUT}.txt")
    actual_output_file_path = os.path.join(PATH_TO_DATA_DIRECTORY, f"{TIMESTAMP_PREFIX}-{USER_CHOICE}-{ACTUAL_OUTPUT}.txt")
 
    if IS_GENERATE_EXPECTED_OUTPUT:
        generate_expected_output(test_file_path, expected_output_file_path, test_name)
        return

    llm_assistant = LLMAssistant()

    with open(INPUT_DOMAIN_DESCRIPTION_FILE_PATH, 'r') as file:
        domain_description = file.read()
    
    if USER_CHOICE == UserChoice.ENTITIES:
        test_data_json = {"entities" : [{"entity": ""}]}
    else:
        with open(test_file_path) as file:
            test_data_json = json.load(file)
    
    if USER_CHOICE.startswith("relationships"):
        test_relationships(llm_assistant, test_data_json, domain_description, actual_output_file_path)
        return

    # TODO: Move this code into a function
    test_data = test_data_json[USER_CHOICE]

    with open(actual_output_file_path, 'w') as file:
        for test_case in test_data:
            entity_name = test_case['entity']
            file.write(f"Entity: {entity_name}\n")

            iterator = llm_assistant.suggest(entity_name, "", USER_CHOICE, ITEMS_COUNT, conceptual_model=[], domain_description=domain_description)

            for index, suggested_item in enumerate(iterator):
                suggested_item = json.loads(suggested_item)
                write_to_file(file, index, suggested_item)
                file.write("\n")

if __name__ == "__main__":
    main()
