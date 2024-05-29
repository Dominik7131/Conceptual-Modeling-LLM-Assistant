import time
import json
import os
import argparse
import sys

TEXT_FILTERING_DIRECTORY_NAME = "text-filtering"

sys.path.append("utils")
sys.path.append(os.path.join(TEXT_FILTERING_DIRECTORY_NAME, "syntactic"))
sys.path.append(os.path.join(TEXT_FILTERING_DIRECTORY_NAME, "semantic"))

from domain_modeling import DOMAIN_DESCRIPTIONS_COUNT, DOMAIN_MODELING_DIRECTORY_PATH, DOMAIN_MODELS, DOMAIN_MODELS_NAME
from llm_assistant import LLMAssistant
from text_utility import Field, FieldUI, UserChoice

ACTUAL_OUTPUT = "actual"
EXPECTED_OUTPUT = "expected"
TIMESTAMP_PREFIX = time.strftime('%Y-%m-%d-%H-%M-%S')

OUTPUT_DIRECTORY = "out"
OUTPUT_EXPECTED_DIRECTORY = os.path.join(OUTPUT_DIRECTORY, "expected")
OUTPUT_ACTUAL_DIRECTORY = os.path.join(OUTPUT_DIRECTORY, "actual")

# In prompt for classes output examples
# We use this list to check if the LLM is leaking the example into the actual output
CLASSES_IN_EXAMPLE = ["employee", "department", "manager"]

# Settings
CSV_SEPARATOR = ','
CSV_HEADER = f"Matches class{CSV_SEPARATOR}Matches attribute{CSV_SEPARATOR}Matches association"


def create_classes_expected_output(test_cases):

    result = []
    for test_case in test_cases:
        class_name = test_case["class"]
        original_text = test_case[Field.ORIGINAL_TEXT.value]
        
        clss = f"Class: {class_name}\n- {FieldUI.ORIGINAL_TEXT.value}: {original_text}\n\n"
        result.append(clss)

    return result


def create_attributes_expected_output(test_cases):

    result = []
    for test_case in test_cases:
        clss = f"Class: {test_case["class"]}"
        result.append(clss)

        expected_output = test_case["expected_output"]

        for index, output in enumerate(expected_output):
            name = output[Field.NAME.value]
            original_text = output[Field.ORIGINAL_TEXT.value]
            entry = f"{index + 1}) {name}\n- {FieldUI.ORIGINAL_TEXT.value}: {original_text}\n\n"
            result.append(entry)

    return result


def create_associations1_expected_output(test_cases):

    result = []
    for test_case in test_cases:
        clss = f"Class: {test_case["class"]}"
        result.append(clss)

        expected_output = test_case['expected_output']

        for index, output in enumerate(expected_output):
            name = output[Field.NAME.value]
            original_text = output[Field.ORIGINAL_TEXT.value]
            source_class = output[Field.SOURCE_CLASS.value]
            target_class = output[Field.TARGET_CLASS.value]

            entry = f"{index + 1}) {name}\n- {FieldUI.ORIGINAL_TEXT.value}: {original_text}\n- {FieldUI.SOURCE_CLASS.value}: {source_class}\n- {FieldUI.TARGET_CLASS.value}: {target_class}\n\n"
            result.append(entry)

    return result


def create_associations1_expected_output(test_cases):

    result = []
    for test_case in test_cases:
        name = test_case[Field.NAME.value]
        original_text = test_case[Field.ORIGINAL_TEXT.value]
        source_class = test_case[Field.SOURCE_CLASS.value]
        target_class = test_case[Field.TARGET_CLASS.value]


        entry = f"{name}\n- {Field.ORIGINAL_TEXT.value}: {original_text}\n- {FieldUI.SOURCE_CLASS.value}: {source_class}\n- {FieldUI.TARGET_CLASS.value}: {target_class}\n\n"
        result.append(entry)

    return result


def generate_expected_output(test_file_path, output_file_path, user_choice):

    with open(test_file_path) as file:
        test_data = json.load(file)

    test_cases = test_data[user_choice]

    if user_choice == UserChoice.CLASSES.value:
        expected_output = create_classes_expected_output(test_cases)

    elif user_choice == UserChoice.ATTRIBUTES.value:
        expected_output = create_attributes_expected_output(test_cases)
    
    elif user_choice == UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value:
        expected_output = create_associations1_expected_output(test_cases)
    
    elif user_choice == UserChoice.ASSOCIATIONS_TWO_KNOWN_CLASSES.value:
        expected_output = create_associations1_expected_output(test_cases)

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


def create_classes_actual_output(llm_assistant, test_cases, user_choice, domain_description, is_csv_output):

    expected_classes = []
    for test_case in test_cases:
        expected_classes.append(test_case["class"])
    
    matched_classes = 0
    total_expected_classes = len(test_cases)

    iterator = llm_assistant.suggest_items(source_class="", target_class="", user_choice=user_choice, domain_description=domain_description)
    result = []

    if is_csv_output:
        result.append(f"Generated class{CSV_SEPARATOR}{CSV_HEADER}")

    for index, suggested_item in enumerate(iterator):
        suggested_item = json.loads(suggested_item)

        class_name = suggested_item[Field.NAME.value]

        # Warn about examples being leaked into actual output
        if class_name in CLASSES_IN_EXAMPLE:
            print(f"Warning: {class_name}")

        if is_csv_output:
            result.append(f"\"{class_name}\"")
        else:
            result.append(f"Class: {class_name}")

        if Field.ORIGINAL_TEXT.value in suggested_item:
            original_text = suggested_item[Field.ORIGINAL_TEXT.value]
            result.append(f"Original text: {original_text}\n\n")
        else:
            if not is_csv_output:
                result.append("\n")
        
        if class_name in expected_classes:
            matched_classes += 1
    
    print(f"Found {matched_classes} / {total_expected_classes} classes\n")

    return result


def create_attributes_actual_output(llm_assistant, test_cases, user_choice, domain_description, is_csv_output):

    result = []

    if is_csv_output:
        result.append(f"Generated attribute{CSV_SEPARATOR}Source class{CSV_SEPARATOR}Generated original text{CSV_SEPARATOR}{CSV_HEADER}")

    for test_case in test_cases:
        source_class = test_case["class"]

        print(f"Generating attributes for: {source_class}")

        if not is_csv_output:
            result.append(f"Class: {source_class}")

        iterator = llm_assistant.suggest_items(source_class=source_class, target_class="", user_choice=user_choice, domain_description=domain_description)

        for index, suggested_item in enumerate(iterator):
            suggested_item = json.loads(suggested_item)

            name = suggested_item[Field.NAME.value]
            original_text = suggested_item[Field.ORIGINAL_TEXT.value]

            if is_csv_output:
                original_text = original_text.replace('"', "'")
                result.append(f"\"{name}\"{CSV_SEPARATOR}\"{source_class}\"{CSV_SEPARATOR}\"{original_text}\"")
            else:
                result.append(f"{index + 1}) {name}\n- {FieldUI.ORIGINAL_TEXT.value}: {original_text}\n\n")

    return result


def create_associations1_actual_output(llm_assistant, test_cases, user_choice, domain_description, is_csv_output):

    result = []

    if is_csv_output:
        result.append(f"Generated association{CSV_SEPARATOR}Inputed class{CSV_SEPARATOR}Source class{CSV_SEPARATOR}Target class{CSV_SEPARATOR}Generated original text{CSV_SEPARATOR}{CSV_HEADER}")

    for test_case in test_cases:
        inputed_class = test_case["class"]

        print(f"Generating associations for: {inputed_class}")

        if not is_csv_output:
            result.append(f"Class: {source_class}")

        iterator = llm_assistant.suggest_items(source_class=inputed_class, target_class="", user_choice=user_choice, domain_description=domain_description)

        for index, suggested_item in enumerate(iterator):
            suggested_item = json.loads(suggested_item)

            name = suggested_item[Field.NAME.value]

            if Field.ORIGINAL_TEXT.value in suggested_item:
                original_text = suggested_item[Field.ORIGINAL_TEXT.value]
            else:
                original_text = ""

            source_class = suggested_item[Field.SOURCE_CLASS.value].lower()
            target_class = suggested_item[Field.TARGET_CLASS.value].lower()

            if is_csv_output:
                original_text = original_text.replace('"', "'")
                result.append(f"\"{name}\"{CSV_SEPARATOR}\"{inputed_class}\"{CSV_SEPARATOR}\"{source_class}\"{CSV_SEPARATOR}\"{target_class}\"{CSV_SEPARATOR}\"{original_text}\"")
            else:
                result.append(f"{index + 1}) {name}\n- {FieldUI.ORIGINAL_TEXT.value}: {original_text}\n- {FieldUI.SOURCE_CLASS.value}: {source_class}\n- {FieldUI.TARGET_CLASS.value}: {target_class}\n\n")

    return result


def create_associations2_actual_output(llm_assistant, test_cases, user_choice, domain_description):

    result = []
    for test_case in test_cases:
        source_class = test_case[Field.SOURCE_CLASS.value]
        target_class = test_case[Field.TARGET_CLASS.value]

        result.append(f"Source class: {source_class}, Target class: {target_class}")
        iterator = llm_assistant.suggest_items(source_class=source_class, target_class=target_class, user_choice=user_choice, domain_description=domain_description)

        for index, suggested_item in enumerate(iterator):
            suggested_item = json.loads(suggested_item)

            name = suggested_item[Field.NAME.value]
            original_text = suggested_item[Field.ORIGINAL_TEXT.value]

            result.append(f"{index + 1}) {name}\n- {FieldUI.ORIGINAL_TEXT.value}: {original_text}\n\n")

    return result


def generate_actual_output(llm_assistant, domain_description, test_file_path, actual_output_file_path, user_choice, is_csv_output):

    with open(test_file_path) as file:
        test_data = json.load(file)

    test_cases = test_data[user_choice]

    if user_choice == UserChoice.CLASSES.value:
        results = create_classes_actual_output(llm_assistant, test_cases, user_choice, domain_description, is_csv_output)

    elif user_choice == UserChoice.ATTRIBUTES.value:
        results = create_attributes_actual_output(llm_assistant, test_cases, user_choice, domain_description, is_csv_output)
    
    elif user_choice == UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value:
        results = create_associations1_actual_output(llm_assistant, test_cases, user_choice, domain_description, is_csv_output)
    
    elif user_choice == UserChoice.ASSOCIATIONS_TWO_KNOWN_CLASSES.value:
        results = create_associations2_actual_output(llm_assistant, test_cases, user_choice, domain_description)

    else:
        raise ValueError(f"Unexpected user choice: \"{user_choice}\".")
    
    with open(actual_output_file_path, 'w') as file:
        for result in results:
            file.write(f"{result}\n")


def main():

    parser = argparse.ArgumentParser(description = "Suggestions generator")
    parser.add_argument("--user_choice", choices = [UserChoice.CLASSES.value, UserChoice.ATTRIBUTES.value, UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value, UserChoice.ASSOCIATIONS_TWO_KNOWN_CLASSES.value], type=str, default=UserChoice.CLASSES.value, help = "Choose elements to generate")
    parser.add_argument("--output_format", choices = ["txt", "csv"], type=str, default="csv", help = "Choose output file format")
    parser.add_argument("--generate_expected_output_only", action = "store_true", default=False, help = "")
    args = parser.parse_args()

    user_choice = args.user_choice
    is_generate_expected_output = args.generate_expected_output_only
    is_csv_output = args.output_format == "csv"

    if not is_generate_expected_output:
        llm_assistant = LLMAssistant()

    
    for index, domain_model in enumerate(DOMAIN_MODELS):
        for i in range(DOMAIN_DESCRIPTIONS_COUNT[index]):

            test_file_name = f"{user_choice}-expected-suggestions-0{i + 1}.json"
            test_file_path = os.path.join(DOMAIN_MODELING_DIRECTORY_PATH, domain_model, test_file_name)
            expected_output_file_path = os.path.join(OUTPUT_EXPECTED_DIRECTORY, f"{DOMAIN_MODELS_NAME[index]}-{user_choice}-{EXPECTED_OUTPUT}-0{i + 1}.txt")

            if not os.path.isfile(test_file_path):
                raise ValueError(f"Test file not found: {test_file_path}")
 
            if is_generate_expected_output:

                if not os.path.exists(OUTPUT_EXPECTED_DIRECTORY):
                    os.makedirs(OUTPUT_EXPECTED_DIRECTORY)

                generate_expected_output(test_file_path, expected_output_file_path, user_choice)
                continue
            
            if not os.path.exists(OUTPUT_ACTUAL_DIRECTORY):
                os.makedirs(OUTPUT_ACTUAL_DIRECTORY)

            output_file_extension = ".csv" if is_csv_output else ".txt"
            actual_output_file_path = os.path.join(OUTPUT_ACTUAL_DIRECTORY, f"{DOMAIN_MODELS_NAME[index]}-{user_choice}-{ACTUAL_OUTPUT}-0{i + 1}{output_file_extension}")
            domain_description_file_name = f"domain-description-0{i + 1}.txt"
            domain_description_path = os.path.join(DOMAIN_MODELING_DIRECTORY_PATH, domain_model, domain_description_file_name)

            if not os.path.isfile(domain_description_path):
                raise ValueError(f"Domain description not found: {domain_description_path}")

            with open(domain_description_path, 'r') as file:
                domain_description = file.read()
            
            generate_actual_output(llm_assistant, domain_description, test_file_path, actual_output_file_path, user_choice, is_csv_output)


if __name__ == "__main__":
    main()
