import os
import json
import sys

sys.path.append('.')
sys.path.append('utils/')
sys.path.append('backend/utils/')
from text_utility import Field, FieldUI, UserChoice


DIRECTORY_PATH = os.path.join("domain-modeling-benchmark", "prompting domain models")
MODEL_NAME = "company employees 4ffd4466-50ec-4d98-b2c1-c3fdba90a65c"
FILE_NAME = "domain-description-01-annotated.txt"

CLASSES_IN_FILE_PATH = os.path.join(DIRECTORY_PATH, MODEL_NAME, "classes-expected-suggestions-01.json")
ATTRIBUTES_IN_FILE_PATH = os.path.join(DIRECTORY_PATH, MODEL_NAME, "attributes-expected-suggestions-01.json")
ASSOCIATIONS1_IN_FILE_PATH = os.path.join(DIRECTORY_PATH, MODEL_NAME, "associations1-expected-suggestions-01.json")
ASSOCIATIONS2_IN_FILE_PATH = os.path.join(DIRECTORY_PATH, MODEL_NAME, "associations2-expected-suggestions-01.json")

CLASSES_OUTPUT_FILE_PATH = os.path.join(DIRECTORY_PATH, MODEL_NAME, "classes-prompt-example.txt")
ATTRIBUTES_OUTPUT_FILE_PATH = os.path.join(DIRECTORY_PATH, MODEL_NAME, "attributes-prompt-example.txt")
ASSOCIATIONS1_OUTPUT_FILE_PATH = os.path.join(DIRECTORY_PATH, MODEL_NAME, "associations1-prompt-example.txt")
ASSOCIATIONS2_OUTPUT_FILE_PATH = os.path.join(DIRECTORY_PATH, MODEL_NAME, "associations2-prompt-example.txt")


def get_classes_examples(expected_suggestions):

    result = []

    classes = expected_suggestions[UserChoice.CLASSES.value]

    for clss in classes:
        class_name = clss["class"]
        original_text = clss[Field.ORIGINAL_TEXT.value]
        result.append(f"{FieldUI.NAME.value}: {class_name}")
        result.append(f"{FieldUI.ORIGINAL_TEXT.value}: {original_text}")

        # We cannot use dictionary and `json.dumps(dictionary)` because we want to specify the ordering of the elements
        # dictionary = { Field.NAME.value: class_name, Field.ORIGINAL_TEXT.value: original_text }
        # print(json.dumps(dictionary))

        JSON_object = f"\"{Field.NAME.value}\": \"{class_name}\", \"{Field.ORIGINAL_TEXT.value}\": \"{original_text}\""
        result.append("JSON object: {" + JSON_object + "}\n")

    return result


def get_attributes_examples(expected_suggestions):

    result = []

    expected_suggestions = expected_suggestions[UserChoice.ATTRIBUTES.value]

    for suggestion in expected_suggestions:
        source_class = suggestion["class"]
        expected_output = suggestion["expected_output"]
        result.append(f"---- Example for class: {source_class} ----")

        for output in expected_output:
            name = output[Field.NAME.value]
            original_text = output[Field.ORIGINAL_TEXT.value]

            result.append(f"context: {original_text}")
            result.append(f"name: {name}")

            JSON_object = f"\"{Field.ORIGINAL_TEXT.value}\": \"{original_text}\", \"{Field.NAME.value}\": \"{name}\""
            result.append("JSON object: {" + JSON_object + "}\n")
        
        result.append("")

    return result


def get_associations1_examples(expected_suggestions):

    result = []
    expected_suggestions = expected_suggestions[UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value]

    for suggestion in expected_suggestions:
        source_class = suggestion["class"]
        expected_output = suggestion["expected_output"]
        result.append(f"---- Example for class: {source_class} ----")

        for output in expected_output:
            name = output[Field.NAME.value]
            original_text = output[Field.ORIGINAL_TEXT.value]
            source_class = output[Field.SOURCE_CLASS.value]
            target_class = output[Field.TARGET_CLASS.value]

            result.append(f"context: {original_text}")
            result.append(f"name: {name}")
            result.append(f"source class: {source_class}")
            result.append(f"target class: {target_class}")

            JSON_object = f"\"{Field.ORIGINAL_TEXT.value}\": \"{original_text}\", \"{Field.NAME.value}\": \"{name}\", \"{Field.SOURCE_CLASS.value}\": \"{source_class}\", \"{Field.TARGET_CLASS.value}\": \"{target_class}\""
            result.append("JSON object: {" + JSON_object + "}\n")

        result.append("")

    return result


def get_associations2_examples(expected_suggestions):

    result = []
    expected_suggestions = expected_suggestions[UserChoice.ASSOCIATIONS_TWO_KNOWN_CLASSES.value]

    for suggestion in expected_suggestions:

        name = suggestion[Field.NAME.value]
        original_text = suggestion[Field.ORIGINAL_TEXT.value]
        source_class = suggestion[Field.SOURCE_CLASS.value]
        target_class = suggestion[Field.TARGET_CLASS.value]

        result.append(f"context: {original_text}")
        result.append(f"name: {name}")
        result.append(f"source class: {source_class}")
        result.append(f"target class: {target_class}")

        JSON_object = f"\"{Field.ORIGINAL_TEXT.value}\": \"{original_text}\", \"{Field.NAME.value}\": \"{name}\", \"{Field.SOURCE_CLASS.value}\": \"{source_class}\", \"{Field.TARGET_CLASS.value}\": \"{target_class}\""
        result.append("JSON object: {" + JSON_object + "}\n")

    return result


def load_expected_suggestions_from_file(input_file_path):
    with open(input_file_path, 'r') as file:
        examples = json.load(file)

    return examples


def write_examples_to_file(output_file_path, examples):
    with open(output_file_path, 'w') as file:
        for example in examples:
            file.write(f"{example}\n")

    return


def main():

    classes_expected = load_expected_suggestions_from_file(CLASSES_IN_FILE_PATH)
    attributes_expected = load_expected_suggestions_from_file(ATTRIBUTES_IN_FILE_PATH)
    associations1_expected = load_expected_suggestions_from_file(ASSOCIATIONS1_IN_FILE_PATH)
    associations2_expected = load_expected_suggestions_from_file(ASSOCIATIONS2_IN_FILE_PATH)
    
    classes_examples = get_classes_examples(classes_expected)
    attributes_examples = get_attributes_examples(attributes_expected)
    associations1_examples = get_associations1_examples(associations1_expected)
    associations2_examples = get_associations2_examples(associations2_expected)

    write_examples_to_file(CLASSES_OUTPUT_FILE_PATH, classes_examples)
    write_examples_to_file(ATTRIBUTES_OUTPUT_FILE_PATH, attributes_examples)
    write_examples_to_file(ASSOCIATIONS1_OUTPUT_FILE_PATH, associations1_examples)
    write_examples_to_file(ASSOCIATIONS2_OUTPUT_FILE_PATH, associations2_examples)

if __name__ == "__main__":
    main()