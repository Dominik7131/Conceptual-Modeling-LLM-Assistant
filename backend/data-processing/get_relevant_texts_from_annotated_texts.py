import json
import re
import os
import sys
import requests
sys.path.append('.')
from text_utility import Field, TextUtility


DIRECTORY_PATH = os.path.join("domain-modeling-benchmark", "evaluation domain models")

domain_models = ["aircraft manufacturing 48982a787d8d25", "conference papers 56cd5f7cf40f52", "farming 97627e23829afb", "college 1dc8e791-1d0e-477c-b5c2-24e376e3f6f1", "zoological gardens e95b5ea472deb8", "registry of road vehicles 60098f15-668b-4a39-8503-285e0b51d56d"]

DOMAIN_DESCRIPTIONS_COUNT = [3, 3, 3, 1, 1, 1]

ENTITY_SYMBOL = "owl:Class"
ATTRIBUTE_SYMBOL = "owl:DatatypeProperty"
RELATIONSHIP_SYMBOL = "owl:ObjectProperty"

TAG_REGEX = r"<([^>]+)>"

BASE_URL = "https://backend.dataspecer.com/simplified-semantic-model?iri="


def get_items(model_file_path):
    
    entities_out = []
    attributes_out = {}
    relationships_out = {}
    generalizations_out = {}

    with open(model_file_path) as file:
        # lines = file.readlines()
        model = json.load(file)
    
    model_descriptor = model["modelDescriptors"][0]["entities"]

    model_ID = model["modelDescriptors"][0]["modelId"]

    url = BASE_URL + model_ID
    model = requests.get(url=url).text
    model = json.loads(model)


    entities = model["classes"]
    attributes = model["attributes"]
    relationships = model["relationships"]
    generalizations = model["generalizations"]


    for entity in entities:
        entities_out.append(entity["name"])

    for attribute in attributes:
        attributes_out[attribute["name"]] = attribute["domain"]

    
    return entities_out, attributes_out, relationships_out, generalizations_out


def get_text_from_indexes(indexes, text):

    relevant_texts = []
    index = 0
    while index < len(indexes):
        sub_text = text[indexes[index] : indexes[index + 1]]
        relevant_text_raw = re.sub(r'<[^>]+>', '', sub_text)

        sentences = TextUtility.split_into_sentences(relevant_text_raw)
        
        for sentence in sentences:
            relevant_texts.append(sentence)

        index += 2
    
    return relevant_texts


def load_model(model_file_path):

    with open(model_file_path) as file:
        model = json.load(file)

    model_ID = model["modelDescriptors"][0]["modelId"]

    url = BASE_URL + model_ID
    model_text = requests.get(url=url).text
    model = json.loads(model_text)
    return model


def create_suggestions_two_known_entities(dictionary, model, text):

    relationships = model["relationships"]
    generalizations = model["generalizations"]

    result_two_known_entities = []
    relationships2_out_suggestions = []

    for relationship in relationships:
        relationship_name = relationship["title"].lower()
        source_entity = relationship["domain"].lower().replace('-', ' ')
        target_entity = relationship["range"].lower().replace('-', ' ')

        if relationship_name not in dictionary:
            continue

        indexes = dictionary[relationship_name]
        relevant_texts = get_text_from_indexes(indexes, text)

        result_two_known_entities.append({ Field.NAME.value: relationship_name, Field.SOURCE_CLASS.value: source_entity, Field.TARGET_CLASS.value: target_entity, "relevant_texts": relevant_texts })
        relationships2_out_suggestions.append({ Field.NAME.value: relationship_name, Field.SOURCE_CLASS.value: source_entity, Field.TARGET_CLASS.value: target_entity, Field.ORIGINAL_TEXT.value: ' '.join(relevant_texts) })


    generalizations2_out_suggestions = []
    for generalization in generalizations:
        # generalization_name = "is-a"
        source_entity = generalization["generalClass"].lower().replace('-', ' ')
        target_entity = generalization["specialClass"].lower().replace('-', ' ')

        generalizations2_out_suggestions.append( {"generalClass": source_entity, "specialClass": target_entity } )


    return relationships2_out_suggestions, generalizations2_out_suggestions


def convert_to_relevant_texts(dictionary, text, model, file_path):

    entities = model["classes"]
    attributes = model["attributes"]
    relationships = model["relationships"]

    result_one_known_entity = []
    result_two_known_entities = []

    entities_suggestions = []
    attributes_suggestions = []
    relationships1_suggestions = []


    for entity in entities:
        entity_name = entity["title"].lower().replace('-', ' ')

        if entity_name not in dictionary:
            print(f"Warning: Entity \"{entity_name}\" not in annotated text: {file_path}")
            continue

        indexes = dictionary[entity_name]
        relevant_texts_entities = get_text_from_indexes(indexes, text)

        entities_suggestions.append({"entity": entity_name, Field.ORIGINAL_TEXT.value: ' '.join(relevant_texts_entities)})

        attributes_out = []
        attributes_out_suggestions = []
        for attribute in attributes:
            attribute_name = attribute["title"].lower().replace('-', ' ')
            source_entity = attribute["domain"].lower().replace('-', ' ')

            if attribute_name not in dictionary:
                print(f"Warning: Attribute \"{attribute_name}\" not in annotated text: {file_path}")
                continue

            if source_entity == entity_name:
                indexes = dictionary[attribute_name]
                relevant_texts_attributes = get_text_from_indexes(indexes, text)
                attributes_out.append({ "name": attribute_name, "relevant_texts": relevant_texts_attributes })

                attributes_out_suggestions.append({"name": attribute_name, Field.ORIGINAL_TEXT.value: ' '.join(relevant_texts_attributes)})


        relationships_out = []
        relationships_out_suggestions = []
        for relationship in relationships:
            relationship_name = relationship["title"].lower().replace('-', ' ')
            source_entity = relationship["domain"].lower().replace('-', ' ')
            target_entity = relationship["range"].lower().replace('-', ' ')

            # TODO: Fix typo in expected model
            if relationship_name == "is staff member of academic commumity":
                relationship_name = "is staff member of academic community"

            if relationship_name not in dictionary:
                print(f"Warning: Relationship \"{relationship_name}\" not in annotated text: {file_path}")
                continue

            is_source = target_entity == entity_name
            indexes = dictionary[relationship_name]
            relevant_texts_relationships = get_text_from_indexes(indexes, text)

            if source_entity == entity_name or target_entity == entity_name:
                relationships_out.append({ "name": relationship_name, "is_source": is_source, "relevant_texts": relevant_texts_relationships })
                relationships_out_suggestions.append({"name": relationship_name, Field.SOURCE_CLASS.value: source_entity, Field.TARGET_CLASS.value: target_entity, Field.ORIGINAL_TEXT.value: ' '.join(relevant_texts_relationships)})


        result_one_known_entity.append({"entity": entity_name, "relevant_texts": relevant_texts_entities, "attributes": attributes_out,
                       "relationships": relationships_out})

        if len(attributes_out_suggestions) > 0:
            attributes_suggestions.append({"entity": entity_name, "expected_output": attributes_out_suggestions })
        
        if len(relationships_out_suggestions) > 0:
            relationships1_suggestions.append({"entity": entity_name, "expected_output": relationships_out_suggestions })

    return result_one_known_entity, result_two_known_entities, entities_suggestions, attributes_suggestions, relationships1_suggestions


def print_result(tags_indexes, text):

    for key, value in tags_indexes.items():
        print(f"{key}: {value}")
        index = 0
        while index < len(value):
            print(text[value[index] : value[index + 1]])
            print()
            index += 2
    print()


def find_end_index(tag, text, text_index):

    end_enclosed_tag = "</" + tag + '>'
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
        enclosed_tag = '<' + tag + '>'

        while text_index < len(text):
            if text[text_index:].startswith(enclosed_tag):
                start_index = text_index + len(enclosed_tag)
                end_index = find_end_index(tag, text, text_index + len(enclosed_tag))

                parsed_tag = tag.replace('-', ' ')
                if parsed_tag not in dictionary:
                    dictionary[parsed_tag] = [start_index, end_index]
                else:
                    dictionary[parsed_tag].append(start_index)
                    dictionary[parsed_tag].append(end_index)
                
                text_index += len(enclosed_tag)
                break
            else:
                text_index += 1
    
    return dictionary


def write_json_to_file(output_file_path, content_to_write):

    with open(output_file_path, 'w') as file:
        json.dump(content_to_write, file)


def main():

    for index, domain_model in enumerate(domain_models):
        for i in range(DOMAIN_DESCRIPTIONS_COUNT[index]):

            file_name = f"domain-description-0{i + 1}-annotated.txt"
            model_file_name = f"domain-model.json"
            one_known_entity_output_file_name = f"relevant-texts-one-known_entity-0{i + 1}.json"
            two_known_entities_output_file_name = f"relevant-texts-two-known-entities-0{i + 1}.json"

            entities_suggestions_output_file_name = f"entities-expected-suggestions-0{i + 1}.json"
            attributes_suggestions_output_file_name = f"attributes-expected-suggestions-0{i + 1}.json"
            relationships_suggestions_output_file_name = f"relationships-expected-suggestions-0{i + 1}.json"
            relationships2_suggestions_output_file_name = f"relationships2-expected-suggestions-0{i + 1}.json"
            # generalizations2_expected_suggestions_output_file_name = f"generalizations2-expected-suggestions-0{i + 1}.json"

            file_path = os.path.join(DIRECTORY_PATH, domain_model, file_name)
            model_file_path = os.path.join(DIRECTORY_PATH, domain_model, model_file_name)
            one_known_entity_output_file_path = os.path.join(DIRECTORY_PATH, domain_model, one_known_entity_output_file_name)
            two_known_entities_output_file_path = os.path.join(DIRECTORY_PATH, domain_model, two_known_entities_output_file_name)
            
            entities_suggestions_output_file_path = os.path.join(DIRECTORY_PATH, domain_model, entities_suggestions_output_file_name)
            attributes_suggestions_output_file_path = os.path.join(DIRECTORY_PATH, domain_model, attributes_suggestions_output_file_name)
            relationships_suggestions_output_file_path = os.path.join(DIRECTORY_PATH, domain_model, relationships_suggestions_output_file_name)
            relationships2_suggestions_output_file_path = os.path.join(DIRECTORY_PATH, domain_model, relationships2_suggestions_output_file_name)
            # generalizations2_suggestions_output_file_path = os.path.join(DIRECTORY_PATH, domain_model, generalizations2_expected_suggestions_output_file_name)

            if not os.path.isfile(file_path):
                raise ValueError(f"Annotated domain description not found: {file_path}")
            
            if not os.path.isfile(model_file_path):
                raise ValueError(f"Model file not found: {file_path}")


            with open(file_path) as file:
                text = file.read()

            tags = re.findall(r'<([^>]+)>', text)
            tags = list(filter(lambda x: x[0] != '/', tags)) # Remove closed tags

            tags_indexes = get_tags_indexes(tags, text)

            model = load_model(model_file_path)
            relevant_texts1, relevant_texts2, entities_suggestions, attributes_suggestions, relationships_suggestions = convert_to_relevant_texts(tags_indexes, text, model, file_path)
            relationships2_suggestions, generalizations2_suggestions = create_suggestions_two_known_entities(tags_indexes, model, text)

            relevant_text_test_cases_1 = { "test_cases": relevant_texts1 }
            relevant_text_test_cases_2 = { "test_cases": relevant_texts2 }

            entities_expected_suggestions = { "entities": entities_suggestions }
            attributes_expected_suggestions = { "attributes": attributes_suggestions }
            relationships1_expected_suggestions = { "relationships": relationships_suggestions }
            relationships2_expected_suggestions = { "relationships2": relationships2_suggestions }
            # generalizations2_expected_suggestions = { "generalizations2": generalizations2_suggestions }

            write_json_to_file(one_known_entity_output_file_path, relevant_text_test_cases_1)
            write_json_to_file(two_known_entities_output_file_path, relevant_text_test_cases_2)
            write_json_to_file(entities_suggestions_output_file_path, entities_expected_suggestions)
            write_json_to_file(attributes_suggestions_output_file_path, attributes_expected_suggestions)
            write_json_to_file(relationships_suggestions_output_file_path, relationships1_expected_suggestions)
            write_json_to_file(relationships2_suggestions_output_file_path, relationships2_expected_suggestions)
            # write_json_to_file(output_file_path_generalizations2_expected_suggestions, generalizations2_suggestions)


if __name__ == "__main__":
    main()