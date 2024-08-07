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

# In prompt for classes output examples
# We use this list to check if the LLM is leaking the example into the actual output
CLASSES_IN_EXAMPLE = ["employee", "department", "manager"]

# Settings
CSV_SEPARATOR = ","
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
        clss = f"Class: {test_case['class']}"
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
        clss = f"Class: {test_case['class']}"
        result.append(clss)

        expected_output = test_case["expected_output"]

        for index, output in enumerate(expected_output):
            name = output[Field.NAME.value]
            original_text = output[Field.ORIGINAL_TEXT.value]
            source_class = output[Field.SOURCE_CLASS.value]
            target_class = output[Field.TARGET_CLASS.value]

            entry = f"{index + 1}) {name}\n- {FieldUI.ORIGINAL_TEXT.value}: {original_text}\n- {FieldUI.SOURCE_CLASS.value}: {source_class}\n- {FieldUI.TARGET_CLASS.value}: {target_class}\n\n"
            result.append(entry)

    return result


def generate_expected_output(test_file_path, output_file_path, user_choice):

    with open(test_file_path, encoding="utf-8") as file:
        test_data = json.load(file)

    test_cases = test_data[user_choice]

    if user_choice == UserChoice.CLASSES.value:
        expected_output = create_classes_expected_output(test_cases)

    elif user_choice == UserChoice.ATTRIBUTES.value:
        expected_output = create_attributes_expected_output(test_cases)

    elif user_choice == UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value:
        expected_output = create_associations1_expected_output(test_cases)

    else:
        raise ValueError(f"Unexpected user choice: \"{user_choice}\".")

    with open(output_file_path, "w", encoding="utf-8") as file:
        for output in expected_output:
            file.write(f"{output}\n")


def write_outputs_to_file(file, outputs):
    for index, output in enumerate(outputs):
        write_to_file(file, index, output)


def write_to_file(file, index, output):
    file.write(f"{index + 1}) {output['name']}\n")

    for key in output:
        # We already outputed the name
        if key in ("name", "inference_indexes"):
            continue

        file.write((f"- {key}: {output[key]}\n"))

    file.write("\n")


def create_classes_actual_output(llm_assistant, test_cases, user_choice, domain_description, is_csv_output):

    expected_classes = []
    for test_case in test_cases:
        expected_classes.append(test_case["class"])

    matched_classes = 0
    total_expected_classes = len(test_cases)

    iterator = llm_assistant.suggest_items(source_class="", target_class="", user_choice=user_choice,
                                           domain_description=domain_description)
    result = []

    if is_csv_output:
        result.append(f"Generated class{CSV_SEPARATOR}{CSV_HEADER}")

    for suggested_item in iterator:
        suggested_item = json.loads(suggested_item)

        class_name = suggested_item[Field.NAME.value]

        # Warn about examples being leaked into actual output
        if class_name in CLASSES_IN_EXAMPLE:
            print(f"Warning: {class_name}")

        is_expected_class_name = class_name in expected_classes

        if is_csv_output:

            if is_expected_class_name:
                # Automatically fill the "matches class" column if the generated class is some expected class
                result.append(f"\"{class_name}\"{CSV_SEPARATOR}\"{class_name}\"{CSV_SEPARATOR}{CSV_SEPARATOR}")
            else:
                result.append(f"\"{class_name}\"{CSV_SEPARATOR}{CSV_SEPARATOR}{CSV_SEPARATOR}")
        else:
            result.append(f"Class: {class_name}")

        if is_expected_class_name:
            matched_classes += 1

    print(f"Found {matched_classes} / {total_expected_classes} classes\n")

    return result


def create_attributes_actual_output(llm_assistant, test_cases, user_choice, domain_description, text_filtering_variation, is_csv_output):

    result = []

    if is_csv_output:
        result.append(f"Generated attribute{CSV_SEPARATOR}Source class{CSV_SEPARATOR}Generated original text{CSV_SEPARATOR}{CSV_HEADER}")

    for test_case in test_cases:
        source_class = test_case["class"]

        print(f"Generating attributes for: {source_class}")

        if not is_csv_output:
            result.append(f"Class: {source_class}")

        iterator = llm_assistant.suggest_items(
            source_class=source_class, target_class="", user_choice=user_choice, domain_description=domain_description, text_filtering_variation=text_filtering_variation)

        for index, suggested_item in enumerate(iterator):
            suggested_item = json.loads(suggested_item)

            name = suggested_item[Field.NAME.value]
            original_text = suggested_item[Field.ORIGINAL_TEXT.value]

            if is_csv_output:
                original_text = original_text.replace('"', "'")
                result.append(
                    f"\"{name}\"{CSV_SEPARATOR}\"{source_class}\"{CSV_SEPARATOR}\"{original_text}\"{CSV_SEPARATOR}{CSV_SEPARATOR}{CSV_SEPARATOR}")
            else:
                result.append(
                    f"{index + 1}) {name}\n- {FieldUI.ORIGINAL_TEXT.value}: {original_text}\n\n")

    return result


def create_associations1_actual_output(llm_assistant, test_cases, user_choice, domain_description, text_filtering_variation, is_csv_output):

    result = []

    if is_csv_output:
        result.append(
            f"Generated association{CSV_SEPARATOR}Inputed class{CSV_SEPARATOR}Source class{CSV_SEPARATOR}Target class{CSV_SEPARATOR}Generated original text{CSV_SEPARATOR}{CSV_HEADER}")

    for test_case in test_cases:
        inputed_class = test_case["class"]

        print(f"Generating associations for: {inputed_class}")

        if not is_csv_output:
            result.append(f"Class: {source_class}")

        iterator = llm_assistant.suggest_items(source_class=inputed_class, target_class="", user_choice=user_choice,
                                               domain_description=domain_description, text_filtering_variation=text_filtering_variation)

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
                result.append(
                    f"\"{name}\"{CSV_SEPARATOR}\"{inputed_class}\"{CSV_SEPARATOR}\"{source_class}\"{CSV_SEPARATOR}\"{target_class}\"{CSV_SEPARATOR}\"{original_text}\"{CSV_SEPARATOR}{CSV_SEPARATOR}{CSV_SEPARATOR}")
            else:
                result.append(
                    f"{index + 1}) {name}\n- {FieldUI.ORIGINAL_TEXT.value}: {original_text}\n- {FieldUI.SOURCE_CLASS.value}: {source_class}\n- {FieldUI.TARGET_CLASS.value}: {target_class}\n\n")

    return result


def generate_actual_output(llm_assistant, domain_description, test_file_path, actual_output_file_path, user_choice, text_filtering_variation, is_csv_output):

    with open(test_file_path, encoding="utf-8") as file:
        test_data = json.load(file)

    test_cases = test_data[user_choice]

    if user_choice == UserChoice.CLASSES.value:
        results = create_classes_actual_output(llm_assistant, test_cases, user_choice, domain_description, is_csv_output)

    elif user_choice == UserChoice.ATTRIBUTES.value:
        results = create_attributes_actual_output(llm_assistant, test_cases, user_choice,
                                                  domain_description, text_filtering_variation, is_csv_output)

    elif user_choice == UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value:
        results = create_associations1_actual_output(llm_assistant, test_cases, user_choice,
                                                     domain_description, text_filtering_variation, is_csv_output)

    else:
        raise ValueError(f"Unexpected user choice: \"{user_choice}\".")

    with open(actual_output_file_path, "w", encoding="utf-8") as file:
        for result in results:
            file.write(f"{result}\n")


def main():

    parser = argparse.ArgumentParser(description="Suggestions generator")
    parser.add_argument("--user_choice", choices=[UserChoice.CLASSES.value, UserChoice.ATTRIBUTES.value,
                        UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value], type=str, default=UserChoice.CLASSES.value, help="Elements to generate")
    parser.add_argument("--output_format", choices=["txt", "csv"], type=str, default="csv", help="Output file format")
    parser.add_argument("--filtering", choices=[TextFilteringVariation.NONE.value, TextFilteringVariation.SYNTACTIC.value,
                        TextFilteringVariation.SEMANTIC.value], type=str, default=TextFilteringVariation.SYNTACTIC.value, help="Text filtering variation")
    parser.add_argument("--generate_expected_output_only", action="store_true", default=False, help="Generate only expected output")

    args = parser.parse_args()

    user_choice = args.user_choice
    is_generate_expected_output = args.generate_expected_output_only
    text_filtering_variation = args.filtering
    is_csv_output = args.output_format == "csv"

    if not is_generate_expected_output:
        llm_assistant = LLMAssistant()

    for index, domain_model in enumerate(DOMAIN_MODELS):
        for i in range(DOMAIN_DESCRIPTIONS_COUNT[index]):

            file_index = i + 1
            test_file_name = f"{user_choice}-expected-suggestions-0{file_index}.json"
            test_file_path = os.path.join(DOMAIN_MODELING_DIRECTORY_PATH, domain_model, test_file_name)
            expected_output_file_path = os.path.join(
                OUTPUT_EXPECTED_DIRECTORY, f"{domain_model}-{user_choice}-{EXPECTED_OUTPUT}-0{file_index}.txt")

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

            if user_choice == UserChoice.CLASSES.value:
                text_filtering_name = "-"
            else:
                text_filtering_name = f"-{text_filtering_variation}-"

            actual_output_file_path = os.path.join(
                OUTPUT_ACTUAL_DIRECTORY, f"{domain_model}-{user_choice}{text_filtering_name}{ACTUAL_OUTPUT}-0{file_index}{output_file_extension}")
            domain_description_file_name = f"domain-description-0{file_index}.txt"
            domain_description_path = os.path.join(DOMAIN_MODELING_DIRECTORY_PATH, domain_model, domain_description_file_name)

            if not os.path.isfile(domain_description_path):
                raise ValueError(f"Domain description not found: {domain_description_path}")

            with open(domain_description_path, "r", encoding="utf-8") as file:
                domain_description = file.read()

            generate_actual_output(llm_assistant, domain_description, test_file_path, actual_output_file_path,
                                   user_choice, text_filtering_variation, is_csv_output)


if __name__ == "__main__":
    main()
