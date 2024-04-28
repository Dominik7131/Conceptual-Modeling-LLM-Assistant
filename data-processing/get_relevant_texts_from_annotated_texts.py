import json
import re
import os
import sys
import requests
sys.path.append('.')
from text_utility import TextUtility


DIRECTORY_PATH = os.path.join("domain-modeling-benchmark", "domain-models")

domain_models = ["aircraft manufacturing 48982a787d8d25", "conference papers 56cd5f7cf40f52", "farming 97627e23829afb"]
DOMAIN_DESCRIPTIONS_COUNT = 3

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


def convert_to_relevant_texts(dictionary, text, model_file_path, file_path):

    with open(model_file_path) as file:
        model = json.load(file)

    model_ID = model["modelDescriptors"][0]["modelId"]

    url = BASE_URL + model_ID
    model_text = requests.get(url=url).text
    model = json.loads(model_text)

    entities = model["classes"]
    attributes = model["attributes"]
    relationships = model["relationships"]
    generalizations = model["generalizations"]

    result_one_known_entity = []
    result_two_known_entities = []

    for entity in entities:
        entity_name = entity["title"].lower()
        indexes = dictionary[entity_name]
        relevant_texts_entities = get_text_from_indexes(indexes, text)

        attributes_out = []
        for attribute in attributes:
            attribute_name = attribute["title"].lower()
            source_entity = attribute["domain"].lower()
            if source_entity == entity_name:

                if attribute_name not in dictionary:
                    print(f"Warning: Attribute {attribute_name} not in annotated text: {file_path}")
                    continue

                indexes = dictionary[attribute_name]
                relevant_texts_attributes = get_text_from_indexes(indexes, text)
                attributes_out.append({ "name": attribute_name, "relevant_texts": relevant_texts_attributes })

        relationships_out = []
        for relationship in relationships:
            relationship_name = relationship["title"].lower()
            source_entity = relationship["domain"].lower().replace('-', ' ')
            target_entity = relationship["range"].lower().replace('-', ' ')

            if relationship_name not in dictionary:
                print(f"Warning: Relationship {relationship_name} not in annotated text: {file_path}")
                continue

            is_source = True
            indexes = dictionary[relationship_name]
            relevant_texts_relationships = get_text_from_indexes(indexes, text)

            if target_entity == entity_name:
                source_entity = target_entity
                is_source = False

            if source_entity == entity_name:
                relationships_out.append({ "name": relationship_name, "is_source": is_source, "relevant_texts": relevant_texts_relationships })
            
            # Two known entities:
            result_two_known_entities.append( { "source_entity": source_entity, "target_entity": target_entity, "relevant_texts": relevant_texts_relationships})


        result_one_known_entity.append({"entity": entity_name, "relevant_texts": relevant_texts_entities, "attributes": attributes_out,
                       "relationships": relationships_out})

    return result_one_known_entity, result_two_known_entities


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


def main():

    for domain_model in domain_models:
        for i in range(DOMAIN_DESCRIPTIONS_COUNT):

            file_name = f"domain-description-0{i + 1}-annotated.txt"
            model_file_name = f"domain-model.json"
            output_file_name_one_known_entity = f"relevant-texts-one-known_entity-0{i + 1}.json"
            output_file_name_two_known_entities = f"relevant-texts-two-known-entities-0{i + 1}.json"

            file_path = os.path.join(DIRECTORY_PATH, domain_model, file_name)
            model_file_path = os.path.join(DIRECTORY_PATH, domain_model, model_file_name)
            output_file_path_one_known_entity = os.path.join(DIRECTORY_PATH, domain_model, output_file_name_one_known_entity)
            output_file_path_two_known_entities = os.path.join(DIRECTORY_PATH, domain_model, output_file_name_two_known_entities)

            if not os.path.isfile(file_path):
                raise ValueError(f"Annotated domain description not found: {file_path}")
            
            if not os.path.isfile(model_file_path):
                raise ValueError(f"Model file not found: {file_path}")


            with open(file_path) as file:
                text = file.read()

            tags = re.findall(r'<([^>]+)>', text)
            tags = list(filter(lambda x: x[0] != '/', tags)) # Remove closed tags

            tags_indexes = get_tags_indexes(tags, text)

            relevant_texts_one_known_entity, relevant_texts_two_known_entities = convert_to_relevant_texts(tags_indexes, text, model_file_path, file_path)

            test_cases_1 = { "test_cases": relevant_texts_one_known_entity }
            test_cases_2 = { "test_cases": relevant_texts_two_known_entities }

            with open(output_file_path_one_known_entity, 'w') as file:
                json.dump(test_cases_1, file)

            with open(output_file_path_two_known_entities, 'w') as file:
                json.dump(test_cases_2, file)


if __name__ == "__main__":
    main()