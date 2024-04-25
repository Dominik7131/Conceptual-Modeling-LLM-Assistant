import json
import re
import os
import sys
sys.path.append('.')
from text_utility import TextUtility


DIRECTORY_PATH = os.path.join("domain-modeling-benchmark", "domain-models")

domain_models = ["aircraft manufacturing 48982a787d8d25", "conference papers 56cd5f7cf40f52", "farming 97627e23829afb"]
DOMAIN_DESCRIPTIONS_COUNT = 3


def get_entities(model_file_path):
    
    entities = []

    with open(model_file_path) as file:
        lines = file.readlines()

    for line in lines:
        entity_symbol = "owl:Class"
        if entity_symbol in line:
            entity = re.findall(r'<([^>]+)>', line)[0]
            entities.append(entity)
    
    return entities


def convert_to_relevant_texts(dictionary, text):

    result = []
    for key, value in dictionary.items():

        relevant_texts = []
        index = 0
        while index < len(value):
            sub_text = text[value[index] : value[index + 1]]
            relevant_text = re.sub(r'<[^>]+>', '', sub_text)

            sentences = TextUtility.split_into_sentences(relevant_text)
            
            for sentence in sentences:
                relevant_texts.append(sentence)

            index += 2
        
        new_key = key.replace('-', ' ')
        result.append({"entity": new_key, "relevant_texts": relevant_texts})
    
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


            entities = get_entities(model_file_path)

            with open(file_path) as file:
                text = file.read()

            tags = re.findall(r'<([^>]+)>', text)
            tags = list(filter(lambda x: x[0] != '/', tags)) # Remove closed tags
            tags = list(filter(lambda x: x in entities, tags)) # Keep only entities


            tags_indexes = get_tags_indexes(tags, text)

            relevant_texts_dictionary = convert_to_relevant_texts(tags_indexes, text)

            test_cases = { "test_cases": relevant_texts_dictionary }

            with open(output_file_path, 'w') as file:
                json.dump(test_cases, file)


if __name__ == "__main__":
    main()