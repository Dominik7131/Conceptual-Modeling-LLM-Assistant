import time
import json
import os
import argparse
import sys

sys.path.append('.')
from LLM_assistant import LLMAssistant, ITEMS_COUNT
from text_utility import Field, FieldUI, TextUtility, UserChoice


DIRECTORY_PATH = os.path.join("domain-modeling-benchmark", "evaluation domain models")
domain_models = ["aircraft manufacturing 48982a787d8d25", "conference papers 56cd5f7cf40f52", "farming 97627e23829afb", "college 1dc8e791-1d0e-477c-b5c2-24e376e3f6f1", "zoological gardens e95b5ea472deb8", "registry of road vehicles 60098f15-668b-4a39-8503-285e0b51d56d"]
DOMAIN_DESCRIPTIONS_COUNT = [3, 3, 3, 1, 1, 1]

IS_A_RELATIONSHIPS_STRING = "is_a_relationships"
ACTUAL_OUTPUT = "actual-output"
EXPECTED_OUTPUT = "expected-output"
TIMESTAMP_PREFIX = time.strftime('%Y-%m-%d-%H-%M-%S')

# Settings
IS_SKIP_IS_A_RELATIONSHIPS = True


def create_entities_expected_output(test_cases):

    result = []
    for test_case in test_cases:
        entity_name = test_case['entity']
        original_text = test_case[Field.ORIGINAL_TEXT.value]
        
        entity = f"Entity: {entity_name}\n- {FieldUI.ORIGINAL_TEXT.value}: {original_text}\n\n"
        result.append(entity)

    return result


def create_attributes_expected_output(test_cases):

    result = []
    for test_case in test_cases:
        entity = f"Entity: {test_case['entity']}"
        result.append(entity)

        expected_output = test_case['expected_output']

        for index, output in enumerate(expected_output):
            name = output[Field.NAME.value]
            original_text = output[Field.ORIGINAL_TEXT.value]
            entry = f"{index + 1}) {name}\n- {FieldUI.ORIGINAL_TEXT.value}: {original_text}\n\n"
            result.append(entry)

    return result


def create_relationships_expected_output(test_cases):

    result = []
    for test_case in test_cases:
        entity = f"Entity: {test_case['entity']}"
        result.append(entity)

        expected_output = test_case['expected_output']

        for index, output in enumerate(expected_output):
            name = output[Field.NAME.value]
            original_text = output[Field.ORIGINAL_TEXT.value]
            source_entity = output[Field.SOURCE_ENTITY.value]
            target_entity = output[Field.TARGET_ENTITY.value]

            entry = f"{index + 1}) {name}\n- {FieldUI.ORIGINAL_TEXT.value}: {original_text}\n- {FieldUI.SOURCE_ENTITY.value}: {source_entity}\n- {FieldUI.TARGET_ENTITY.value}: {target_entity}\n\n"
            result.append(entry)

    return result


def create_relationships2_expected_output(test_cases):

    result = []
    for test_case in test_cases:
        name = test_case[Field.NAME.value]
        original_text = test_case[Field.ORIGINAL_TEXT.value]
        source_entity = test_case[Field.SOURCE_ENTITY.value]
        target_entity = test_case[Field.TARGET_ENTITY.value]


        entry = f"{name}\n- {Field.ORIGINAL_TEXT.value}: {original_text}\n- {FieldUI.SOURCE_ENTITY.value}: {source_entity}\n- {FieldUI.TARGET_ENTITY.value}: {target_entity}\n\n"
        result.append(entry)

    return result


def generate_expected_output(test_file_path, output_file_path, user_choice):

    with open(test_file_path) as file:
        test_data = json.load(file)

    test_cases = test_data[user_choice]

    if user_choice == UserChoice.ENTITIES.value:
        expected_output = create_entities_expected_output(test_cases)

    elif user_choice == UserChoice.ATTRIBUTES.value:
        expected_output = create_attributes_expected_output(test_cases)
    
    elif user_choice == UserChoice.RELATIONSHIPS.value:
        expected_output = create_relationships_expected_output(test_cases)
    
    elif user_choice == UserChoice.RELATIONSHIPS2.value:
        expected_output = create_relationships2_expected_output(test_cases)

    else:
        raise ValueError(f"Unexpected user choice: \"{user_choice}\".")
    
    with open(output_file_path, 'w') as file:
        for output in expected_output:
            file.write(f"{output}\n")


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
def test_relationships(llm_assistant, test_data_json, domain_description, actual_output_file_path, user_choice):
    test_data = test_data_json[UserChoice.RELATIONSHIPS.value]

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

            if user_choice == UserChoice.RELATIONSHIPS2.value:
                is_relationship_already_tested = (source_entity, target_entity) in tested_relationships
                if is_relationship_already_tested:
                    continue
                else:
                    tested_relationships.append((source_entity, target_entity))

            elif user_choice == UserChoice.RELATIONSHIPS.value:
                target_entity = ""
                is_relationship_already_tested = source_entity in tested_relationships
                if is_relationship_already_tested:
                    continue
                else:
                    tested_relationships.append(source_entity)            

            iterations_count += 1

            file.write(f"Entities: ({source_entity}, {target_entity})\n")

            iterator = llm_assistant.suggest(source_entity, target_entity, user_choice, ITEMS_COUNT, conceptual_model=[], domain_description=domain_description)

            for index, suggested_item in enumerate(iterator):
                suggested_item = json.loads(suggested_item)
                write_to_file(file, index, suggested_item)
                file.write("\n")


def create_entities_actual_output(llm_assistant, test_cases, user_choice, domain_description):

    expected_entities = []
    for test_case in test_cases:
        expected_entities.append(test_case["entity"])
    
    matched_entities = 0
    total_expected_entities = len(test_cases)

    iterator = llm_assistant.suggest(source_entity="", target_entity="", user_choice=user_choice, domain_description=domain_description)
    result = []

    for index, suggested_item in enumerate(iterator):
        suggested_item = json.loads(suggested_item)

        entity_name = suggested_item[Field.NAME.value]
        result.append(f"Entity: {entity_name}")

        if Field.ORIGINAL_TEXT.value in suggested_item:
            original_text = suggested_item[Field.ORIGINAL_TEXT.value]
            result.append(f"Original text: {original_text}\n\n")
        else:
            result.append("\n")
        
        if entity_name in expected_entities:
            matched_entities += 1
    
    print(f"Found {matched_entities} / {total_expected_entities} entities\n")

    return result


def create_attributes_actual_output(llm_assistant, test_cases, user_choice, domain_description):

    result = []
    for test_case in test_cases[:3]:
        source_entity = test_case["entity"]
        result.append(f"Entity: {source_entity}")
        iterator = llm_assistant.suggest(source_entity=source_entity, target_entity="", user_choice=user_choice, domain_description=domain_description)

        for index, suggested_item in enumerate(iterator):
            suggested_item = json.loads(suggested_item)

            name = suggested_item[Field.NAME.value]
            original_text = suggested_item[Field.ORIGINAL_TEXT.value]

            result.append(f"{index + 1}) {name}\n- {FieldUI.ORIGINAL_TEXT.value}: {original_text}\n\n")

    return result


def create_relationships_actual_output(llm_assistant, test_cases, user_choice, domain_description):

    result = []
    for test_case in test_cases:
        source_entity = test_case["entity"]
        result.append(f"Entity: {source_entity}")
        iterator = llm_assistant.suggest(source_entity=source_entity, target_entity="", user_choice=user_choice, domain_description=domain_description)

        for index, suggested_item in enumerate(iterator):
            suggested_item = json.loads(suggested_item)

            name = suggested_item[Field.NAME.value]
            original_text = suggested_item[Field.ORIGINAL_TEXT.value]
            source_entity = suggested_item[Field.SOURCE_ENTITY.value]
            target_entity = suggested_item[Field.TARGET_ENTITY.value]

            result.append(f"{index + 1}) {name}\n- {FieldUI.ORIGINAL_TEXT.value}: {original_text}\n- {FieldUI.SOURCE_ENTITY.value}: {source_entity}\n- {FieldUI.TARGET_ENTITY.value}: {target_entity}\n\n")

    return result


def create_relationships2_actual_output(llm_assistant, test_cases, user_choice, domain_description):

    result = []
    for test_case in test_cases[:3]:
        source_entity = test_case[Field.SOURCE_ENTITY.value]
        target_entity = test_case[Field.TARGET_ENTITY.value]

        result.append(f"Source entity: {source_entity}, Target entity: {target_entity}")
        iterator = llm_assistant.suggest(source_entity=source_entity, target_entity=target_entity, user_choice=user_choice, domain_description=domain_description)

        for index, suggested_item in enumerate(iterator):
            suggested_item = json.loads(suggested_item)

            name = suggested_item[Field.NAME.value]
            original_text = suggested_item[Field.ORIGINAL_TEXT.value]

            result.append(f"{index + 1}) {name}\n- {FieldUI.ORIGINAL_TEXT.value}: {original_text}\n\n")

    return result


def generate_actual_output(llm_assistant, domain_description, test_file_path, actual_output_file_path, user_choice):

    with open(test_file_path) as file:
        test_data = json.load(file)

    test_cases = test_data[user_choice]

    if user_choice == UserChoice.ENTITIES.value:
        results = create_entities_actual_output(llm_assistant, test_cases, user_choice, domain_description)

    elif user_choice == UserChoice.ATTRIBUTES.value:
        results = create_attributes_actual_output(llm_assistant, test_cases, user_choice, domain_description)
    
    elif user_choice == UserChoice.RELATIONSHIPS.value:
        results = create_relationships_actual_output(llm_assistant, test_cases, user_choice, domain_description)
    
    elif user_choice == UserChoice.RELATIONSHIPS2.value:
        results = create_relationships2_actual_output(llm_assistant, test_cases, user_choice, domain_description)

    else:
        raise ValueError(f"Unexpected user choice: \"{user_choice}\".")
    
    with open(actual_output_file_path, 'w') as file:
        for result in results:
            file.write(f"{result}\n")


def main():

    parser = argparse.ArgumentParser(description = "Suggestions generator")
    parser.add_argument("--user_choice", choices = [UserChoice.ENTITIES.value, UserChoice.ATTRIBUTES.value, UserChoice.RELATIONSHIPS.value, UserChoice.RELATIONSHIPS2.value], type=str, default=UserChoice.ENTITIES.value, help = "Choose elements to generate")
    parser.add_argument("--generate_expected_output_only", action = "store_true", default=False, help = "")
    args = parser.parse_args()

    user_choice = args.user_choice
    is_generate_expected_output = args.generate_expected_output_only

    if not is_generate_expected_output:
        llm_assistant = LLMAssistant()

    
    for index, domain_model in enumerate(domain_models):
        for i in range(DOMAIN_DESCRIPTIONS_COUNT[index]):

            test_file_name = f"{user_choice}-expected-suggestions-0{i + 1}.json"
            test_file_path = os.path.join(DIRECTORY_PATH, domain_model, test_file_name)
            expected_output_file_path = os.path.join(DIRECTORY_PATH, domain_model, f"{user_choice}-{EXPECTED_OUTPUT}-0{i + 1}.txt")

            if not os.path.isfile(test_file_path):
                raise ValueError(f"Test file not found: {test_file_path}")
 
            if is_generate_expected_output:
                generate_expected_output(test_file_path, expected_output_file_path, user_choice)
                continue
            
            actual_output_file_path = os.path.join(DIRECTORY_PATH, domain_model, f"{TIMESTAMP_PREFIX}-{user_choice}-{ACTUAL_OUTPUT}-0{i + 1}.txt")
            domain_description_file_name = f"domain-description-0{i + 1}.txt"
            domain_description_path = os.path.join(DIRECTORY_PATH, domain_model, domain_description_file_name)

            if not os.path.isfile(domain_description_path):
                raise ValueError(f"Domain description not found: {domain_description_path}")

            with open(domain_description_path, 'r') as file:
                domain_description = file.read()
            
            generate_actual_output(llm_assistant, domain_description, test_file_path, actual_output_file_path, user_choice)


if __name__ == "__main__":
    main()
