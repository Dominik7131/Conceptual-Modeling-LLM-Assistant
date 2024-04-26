import json
import re
import os
import sys
sys.path.append('.')
from text_utility import TextUtility


DIRECTORY_PATH = os.path.join("domain-modeling-benchmark", "domain-models")

domain_models = ["aircraft manufacturing 48982a787d8d25", "conference papers 56cd5f7cf40f52", "farming 97627e23829afb"]
DOMAIN_DESCRIPTIONS_COUNT = 3

ENTITY_SYMBOL = "owl:Class"
ATTRIBUTE_SYMBOL = "owl:DatatypeProperty"
RELATIONSHIP_SYMBOL = "owl:ObjectProperty"

TAG_REGEX = r"<([^>]+)>"


def get_items(model_file_path):
    
    entities = []
    attributes = {}
    relationships = {}
    generalizations = {}

    # with open(model_file_path) as file:
    #     # lines = file.readlines()
    #     model = json.load(file)
    
    # model_descriptor = model["modelDescriptors"][0]["entities"]
    # print()

    # for key, value in model_descriptor.items():
    #     if "class" in value["type"]:
    #         entities.append(value["iri"].replace('-', ' '))
    #     elif "relationship" in value["type"]:
    #         ends = value["ends"]
    #         source_iri = ends[0]["iri"]
    #         target_iri = ends[1]["iri"]
    #         print()
    
    # print()

    with open(model_file_path) as file:
        lines = file.readlines()

    for i in range(len(lines)):

        if ENTITY_SYMBOL in lines[i]:
            entity = re.findall(TAG_REGEX, lines[i])[0].replace('-', ' ')
            entities.append(entity)

            # TODO: Parse generalization
            # Probably add the subclass into "entities" if it exists
            # if i + 3 < len(lines):
            #     subclass = re.findall(TAG_REGEX, lines[i + 3])[0].replace('-', ' ')

        elif ATTRIBUTE_SYMBOL in lines[i]:
            attribute = re.findall(TAG_REGEX, lines[i])[0].replace('-', ' ')
            source_entity = re.findall(TAG_REGEX, lines[i + 1])[0].replace('-', ' ')
            attributes[attribute] = source_entity
        
        elif RELATIONSHIP_SYMBOL in lines[i]:

            # Relationships in this model are broken for now: they don't have domain and range class
            if model_file_path.endswith("farming 97627e23829afb\\domain-model.ttl"):
                continue

            relationship = re.findall(TAG_REGEX, lines[i])[0].replace('-', ' ')
            source_entity = re.findall(TAG_REGEX, lines[i + 1])[0].replace('-', ' ')
            target_entity = re.findall(TAG_REGEX, lines[i + 2])[0].replace('-', ' ')
            relationships[relationship] = (source_entity, target_entity)

    
    return entities, attributes, relationships, generalizations


def convert_to_relevant_texts(dictionary, text, model_file_path):

    entities, attributes, relationships, generalizations = get_items(model_file_path)
    attribute_keys = attributes.keys()
    relationships_keys = relationships.keys()

    attributes_dictionary = {}
    relationships_dictionary = {}
    result = []

    for key, value in dictionary.items():

        relevant_texts = []
        index = 0
        while index < len(value):
            sub_text = text[value[index] : value[index + 1]]
            relevant_text_raw = re.sub(r'<[^>]+>', '', sub_text)

            sentences = TextUtility.split_into_sentences(relevant_text_raw)
            
            for sentence in sentences:
                relevant_texts.append(sentence)

            index += 2
        
        new_key = key.replace('-', ' ')


        if new_key in entities:
            result.append({"entity": new_key, "relevant_texts": relevant_texts})

        elif new_key in attribute_keys:
            attribute_name = new_key
            source_entity = attributes[new_key]

            if not source_entity in attributes_dictionary:
                attributes_dictionary[source_entity] = []

            attributes_dictionary[source_entity].append({"name": attribute_name, "relevant_texts": relevant_texts })

        elif new_key in relationships_keys:
            relationship_name = new_key
            source_entity = relationships[new_key][0]
            target_entity = relationships[new_key][1]

            if not source_entity in relationships_dictionary:
                relationships_dictionary[source_entity] = []
            
            if not target_entity in relationships_dictionary:
                relationships_dictionary[target_entity] = []

            relationships_dictionary[source_entity].append({"name": relationship_name, "is_source": True, "relevant_texts": relevant_texts })
            relationships_dictionary[target_entity].append({"name": relationship_name, "is_source": False, "relevant_texts": relevant_texts })


    for i in range(len(result)):
        entity = result[i]["entity"]

        if entity in attributes_dictionary:
            attribute_object = attributes_dictionary[entity]
            result[i] = { "entity": entity, "relevant_texts": result[i]["relevant_texts"], "attributes": attribute_object}
        
        if entity in relationships_dictionary:
            relationship_object = relationships_dictionary[entity]
            result[i] = { "entity": entity, "relevant_texts": result[i]["relevant_texts"], "relationships": relationship_object}


    return result


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

                if tag not in dictionary:
                    dictionary[tag] = [start_index, end_index]
                else:
                    dictionary[tag].append(start_index)
                    dictionary[tag].append(end_index)
                
                text_index += len(enclosed_tag)
                break
            else:
                text_index += 1
    
    return dictionary


def main():

    for domain_model in domain_models:
        for i in range(DOMAIN_DESCRIPTIONS_COUNT):

            file_name = f"domain-description-0{i + 1}-annotated.txt"
            model_file_name = f"domain-model.ttl"
            output_file_name = f"relevant-texts-0{i + 1}.json"

            file_path = os.path.join(DIRECTORY_PATH, domain_model, file_name)
            model_file_path = os.path.join(DIRECTORY_PATH, domain_model, model_file_name)
            output_file_path = os.path.join(DIRECTORY_PATH, domain_model, output_file_name)

            if not os.path.isfile(file_path):
                raise ValueError(f"Annotated domain description not found: {file_path}")
            
            if not os.path.isfile(model_file_path):
                raise ValueError(f"Model file not found: {file_path}")


            with open(file_path) as file:
                text = file.read()

            tags = re.findall(r'<([^>]+)>', text)
            tags = list(filter(lambda x: x[0] != '/', tags)) # Remove closed tags

            tags_indexes = get_tags_indexes(tags, text)

            relevant_texts_dictionary = convert_to_relevant_texts(tags_indexes, text, model_file_path)

            test_cases = { "test_cases": relevant_texts_dictionary }

            with open(output_file_path, 'w') as file:
                json.dump(test_cases, file)


if __name__ == "__main__":
    main()