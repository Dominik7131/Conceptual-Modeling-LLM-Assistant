import json
import re
import os
import requests
import sys

sys.path.append(".")

from utils.text_splitter import TextSplitter
from definitions.utility import Field, UserChoice
from definitions.domain_modelling import DOMAIN_DESCRIPTIONS_COUNT, DOMAIN_MODELING_DIRECTORY_PATH, DOMAIN_MODELS


BASE_URL = "https://backend.dataspecer.com/simplified-semantic-model?iri="
TAG_REGEX = r"<([^>]+)>"

IS_PRINT_TOTAL_ELEMENTS_COUNT = False

DOMAIN_DESCRIPTIONS_TEXTS = len(DOMAIN_DESCRIPTIONS_COUNT)
classes_count = [0] * DOMAIN_DESCRIPTIONS_TEXTS
attributes_count = [0] * DOMAIN_DESCRIPTIONS_TEXTS
associations_count = [0] * DOMAIN_DESCRIPTIONS_TEXTS


def get_text_from_indexes(indexes, text):

    relevant_texts = []
    index = 0
    while index < len(indexes):
        sub_text = text[indexes[index]: indexes[index + 1]]
        relevant_text_raw = re.sub(r"<[^>]+>", "", sub_text)

        sentences = TextSplitter.split_into_sentences(relevant_text_raw)

        for sentence in sentences:
            relevant_texts.append(sentence)

        index += 2

    return relevant_texts


def load_model(model_file_path):

    with open(model_file_path, encoding="utf-8") as file:
        model = json.load(file)

    model_id = model["modelDescriptors"][0]["modelId"]

    url = BASE_URL + model_id
    model_text = requests.get(url=url, timeout=10).text
    model = json.loads(model_text)
    return model


def create_suggestions_two_known_classes(dictionary, model, text):

    associations = model["relationships"]
    generalizations = model["generalizations"]

    result_two_known_classes = []
    associations2_out_suggestions = []

    for association in associations:
        association_name = association["title"].lower()
        source_class = association["domain"].lower().replace("-", " ")
        target_class = association["range"].lower().replace("-", " ")

        if association_name not in dictionary:
            continue

        indexes = dictionary[association_name]
        relevant_texts = get_text_from_indexes(indexes, text)

        result_two_known_classes.append({Field.NAME.value: association_name, Field.SOURCE_CLASS.value: source_class,
                                        Field.TARGET_CLASS.value: target_class, "relevant_texts": relevant_texts})
        associations2_out_suggestions.append({Field.NAME.value: association_name, Field.SOURCE_CLASS.value: source_class,
                                             Field.TARGET_CLASS.value: target_class, Field.ORIGINAL_TEXT.value: " ".join(relevant_texts)})

    generalizations2_out_suggestions = []
    for generalization in generalizations:
        source_class = generalization["generalClass"].lower().replace("-", " ")
        target_class = generalization["specialClass"].lower().replace("-", " ")

        generalizations2_out_suggestions.append({"generalClass": source_class, "specialClass": target_class})

    return associations2_out_suggestions, generalizations2_out_suggestions


def get_relevant_texts(dictionary, text, model, file_path):

    classes = model["classes"]
    attributes = model["attributes"]
    associations = model["relationships"]

    result_one_known_class = []
    result_two_known_classes = []

    classes_suggestions = []
    attributes_suggestions = []
    associations1_suggestions = []

    for clss in classes:
        class_name = clss["title"].lower().replace("-", " ")

        if class_name not in dictionary:
            print(f"Warning: Class \"{class_name}\" not in annotated text: {file_path}")
            continue

        indexes = dictionary[class_name]
        relevant_texts_classes = get_text_from_indexes(indexes, text)

        classes_suggestions.append({"class": class_name, Field.ORIGINAL_TEXT.value: " ".join(relevant_texts_classes)})

        attributes_out = []
        attributes_out_suggestions = []
        for attribute in attributes:
            attribute_name = attribute["title"].lower().replace("-", " ")
            source_class = attribute["domain"].lower().replace("-", " ")

            if attribute_name not in dictionary:
                print(f"Warning: Attribute \"{attribute_name}\" not in annotated text: {file_path}")
                continue

            if source_class == class_name:
                indexes = dictionary[attribute_name]
                relevant_texts_attributes = get_text_from_indexes(indexes, text)
                attributes_out.append({"name": attribute_name, "relevant_texts": relevant_texts_attributes})
                attributes_out_suggestions.append(
                    {"name": attribute_name, Field.ORIGINAL_TEXT.value: " ".join(relevant_texts_attributes)})

        associations_out = []
        associations_out_suggestions = []

        for association in associations:
            association_name = association["title"].lower().replace("-", " ")
            source_class = association["domain"].lower().replace("-", " ")
            target_class = association["range"].lower().replace("-", " ")

            # Typo in expected model
            if association_name == "is staff member of academic commumity":
                association_name = "is staff member of academic community"

            if association_name not in dictionary:
                print(f"Warning: Association \"{association_name}\" not in annotated text: {file_path}")
                continue

            is_source = target_class == class_name
            indexes = dictionary[association_name]
            relevant_texts_associations = get_text_from_indexes(indexes, text)

            if source_class == class_name or target_class == class_name:
                associations_out.append({"name": association_name, "is_source": is_source, "relevant_texts": relevant_texts_associations})
                associations_out_suggestions.append({"name": association_name, Field.SOURCE_CLASS.value: source_class,
                                                    Field.TARGET_CLASS.value: target_class, Field.ORIGINAL_TEXT.value: " ".join(relevant_texts_associations)})

        result_one_known_class.append({"class": class_name, "relevant_texts": relevant_texts_classes, "attributes": attributes_out,
                                       "associations": associations_out})

        if len(attributes_out_suggestions) > 0:
            attributes_suggestions.append({"class": class_name, "expected_output": attributes_out_suggestions})

        if len(associations_out_suggestions) > 0:
            associations1_suggestions.append({"class": class_name, "expected_output": associations_out_suggestions})

    return result_one_known_class, result_two_known_classes, classes_suggestions, attributes_suggestions, associations1_suggestions


def print_result(tags_indexes, text):

    for key, value in tags_indexes.items():
        print(f"{key}: {value}")
        index = 0
        while index < len(value):
            print(text[value[index]: value[index + 1]])
            print()
            index += 2
    print()


def find_end_index(tag, text, text_index):

    end_enclosed_tag = "</" + tag + ">"
    while text_index < len(text):
        if text[text_index:].startswith(end_enclosed_tag):
            return text_index

        else:
            text_index += 1

    raise ValueError(f"End tag not found in the text: {end_enclosed_tag}")


def get_tags_indexes(tags, text):

    dictionary = {}
    text_index = 0

    for tag in tags:
        enclosed_tag = "<" + tag + ">"

        while text_index < len(text):
            if text[text_index:].startswith(enclosed_tag):
                start_index = text_index + len(enclosed_tag)
                end_index = find_end_index(
                    tag, text, text_index + len(enclosed_tag))

                parsed_tag = tag.replace("-", " ")
                if parsed_tag not in dictionary:
                    dictionary[parsed_tag] = [start_index, end_index]
                else:
                    dictionary[parsed_tag].append(start_index)
                    dictionary[parsed_tag].append(end_index)

                text_index += len(enclosed_tag)
                break

            text_index += 1

    return dictionary


def write_json_to_file(output_file_path, content_to_write):

    with open(output_file_path, "w", encoding="utf-8") as file:
        json.dump(content_to_write, file)


def count_conceptual_model_elements(model, index):

    classes = model["classes"]
    attributes = model["attributes"]
    associations = model["relationships"]

    classes_count[index] = len(classes)
    attributes_count[index] = len(attributes)
    associations_count[index] = len(associations)


def print_conceptual_model_total_elements_csv():

    header = "text_name,classes_total,attributes_total,associations_total"
    print(header)

    for i in range(DOMAIN_DESCRIPTIONS_TEXTS):
        row = f"{DOMAIN_MODELS[i]},{classes_count[i]},{attributes_count[i]},{associations_count[i]}"
        print(row)


def main():

    for index, domain_model in enumerate(DOMAIN_MODELS):
        for i in range(DOMAIN_DESCRIPTIONS_COUNT[index]):

            file_index = i + 1
            file_name = f"domain-description-0{file_index}-annotated.txt"
            model_file_name = "domain-model.json"
            one_known_class_output_file_name = f"relevant-texts-one-known_class-0{file_index}.json"
            two_known_classes_output_file_name = f"relevant-texts-two-known-classes-0{file_index}.json"

            classes_suggestions_output_file_name = f"classes-expected-suggestions-0{file_index}.json"
            attributes_suggestions_output_file_name = f"attributes-expected-suggestions-0{file_index}.json"
            associations1_suggestions_output_file_name = f"{UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value}-expected-suggestions-0{file_index}.json"
            associations2_suggestions_output_file_name = f"{UserChoice.ASSOCIATIONS_TWO_KNOWN_CLASSES.value}-expected-suggestions-0{file_index}.json"

            file_path = os.path.join(DOMAIN_MODELING_DIRECTORY_PATH, domain_model, file_name)
            model_file_path = os.path.join(DOMAIN_MODELING_DIRECTORY_PATH, domain_model, model_file_name)
            one_known_class_output_file_path = os.path.join(
                DOMAIN_MODELING_DIRECTORY_PATH, domain_model, one_known_class_output_file_name)
            two_known_classes_output_file_path = os.path.join(
                DOMAIN_MODELING_DIRECTORY_PATH, domain_model, two_known_classes_output_file_name)

            classes_suggestions_output_file_path = os.path.join(
                DOMAIN_MODELING_DIRECTORY_PATH, domain_model, classes_suggestions_output_file_name)
            attributes_suggestions_output_file_path = os.path.join(
                DOMAIN_MODELING_DIRECTORY_PATH, domain_model, attributes_suggestions_output_file_name)
            associations1_suggestions_output_file_path = os.path.join(
                DOMAIN_MODELING_DIRECTORY_PATH, domain_model, associations1_suggestions_output_file_name)
            associations2_suggestions_output_file_path = os.path.join(
                DOMAIN_MODELING_DIRECTORY_PATH, domain_model, associations2_suggestions_output_file_name)

            if not os.path.isfile(file_path):
                raise ValueError(f"Annotated domain description not found: {file_path}")

            if not os.path.isfile(model_file_path):
                raise ValueError(f"Model file not found: {file_path}")

            with open(file_path, encoding="utf-8") as file:
                text = file.read()

            tags = re.findall(r"<([^>]+)>", text)
            tags = list(filter(lambda x: x[0] != "/", tags))  # Remove closed tags

            tags_indexes = get_tags_indexes(tags, text)

            model = load_model(model_file_path)

            if i == 0:
                count_conceptual_model_elements(model, index)

            relevant_texts1, relevant_texts2, classes_suggestions, attributes_suggestions, associations_suggestions = get_relevant_texts(
                tags_indexes, text, model, file_path)
            associations2_suggestions, _ = create_suggestions_two_known_classes(tags_indexes, model, text)

            relevant_text_test_cases_1 = {"test_cases": relevant_texts1}
            relevant_text_test_cases_2 = {"test_cases": relevant_texts2}

            classes_expected_suggestions = {UserChoice.CLASSES.value: classes_suggestions}
            attributes_expected_suggestions = {UserChoice.ATTRIBUTES.value: attributes_suggestions}
            associations1_expected_suggestions = {UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value: associations_suggestions}
            associations2_expected_suggestions = {UserChoice.ASSOCIATIONS_TWO_KNOWN_CLASSES.value: associations2_suggestions}

            write_json_to_file(one_known_class_output_file_path, relevant_text_test_cases_1)
            write_json_to_file(two_known_classes_output_file_path, relevant_text_test_cases_2)
            write_json_to_file(classes_suggestions_output_file_path, classes_expected_suggestions)
            write_json_to_file(attributes_suggestions_output_file_path, attributes_expected_suggestions)
            write_json_to_file(associations1_suggestions_output_file_path, associations1_expected_suggestions)
            write_json_to_file(associations2_suggestions_output_file_path, associations2_expected_suggestions)

    if IS_PRINT_TOTAL_ELEMENTS_COUNT:
        print_conceptual_model_total_elements_csv()


if __name__ == "__main__":
    main()
