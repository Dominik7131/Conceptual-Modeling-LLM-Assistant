import csv
import json
import os

from text_utility import UserChoice


INPUT_DIRECTORY_PATH = os.path.join("domain-modeling-benchmark", "evaluation domain models")
domain_models = ["aircraft manufacturing 48982a787d8d25", "conference papers 56cd5f7cf40f52", "farming 97627e23829afb", "college 1dc8e791-1d0e-477c-b5c2-24e376e3f6f1", "zoological gardens e95b5ea472deb8", "registry of road vehicles 60098f15-668b-4a39-8503-285e0b51d56d"]

OUTPUT_DIRECTORY_PATH = os.path.join("out", "evaluated")
domain_models_name = ["aircraft-manufacturing", "conference-papers", "farming", "college", "zoological-gardens", "registry-of-road-vehicles"]
DOMAIN_DESCRIPTIONS_COUNT = [3, 3, 3, 1, 1, 1]

SEPARATOR = ','

recall_entities, recall_attributes, recall_relationships = 0, 0, 0
recall_entities_max, recall_attributes_max, recall_relationships_max = 0, 0, 0

precision_entities, precision_attributes, precision_relationships = 0, 0, 0
precision_entities_max, precision_attributes_max, precision_relationships_max = 0, 0, 0


def evaluate_entities(test_data_path, evaluated_path):

    global recall_entities
    global recall_entities_max
    global precision_entities
    global precision_entities_max

    with open(test_data_path) as file:
        test_data = json.load(file)

    expected_entities = []
    test_cases = test_data["entities"]

    for test_case in test_cases:
        expected_entities.append(test_case["entity"])

    checked_entities = [False] * len(expected_entities)

    with open(evaluated_path, "r", newline="") as file:
        reader = csv.reader(file, delimiter=SEPARATOR)
        for index, row in enumerate(reader):
            if index == 0 or len(row) == 0:
                continue

            # TODO: Make enum to give each row a name
            matched_class = row[1]
            matched_attribute = row[2]
            matched_relationship = row[3]

            precision_entities_max += 1

            if matched_class == "" and matched_attribute == "" and matched_relationship == "":
                continue

            precision_entities += 1
            
            for i, entity in enumerate(expected_entities):
                if entity == matched_class:
                    checked_entities[i] = True
                    break
    
    for checked_entity in checked_entities:
        if checked_entity:
            recall_entities += 1
        recall_entities_max += 1


def evaluate_attributes(test_data_path, evaluated_path):

    global recall_attributes
    global recall_attributes_max
    global precision_attributes
    global precision_attributes_max

    with open(test_data_path) as file:
        test_data = json.load(file)

    expected_attributes = []
    test_cases = test_data["attributes"]

    for test_case in test_cases:

        expected_output = test_case["expected_output"]
        source_entity = test_case["entity"]

        for output in expected_output:
            attribute_identificator = f"{output['name']}-{source_entity}"
            expected_attributes.append(attribute_identificator)

        checked_attributes = [False] * len(expected_attributes)


    with open(evaluated_path, "r", newline="") as file:
        reader = csv.reader(file, delimiter=SEPARATOR)
        for index, row in enumerate(reader):
            if index == 0 or len(row) == 0:
                continue

            source_class = row[1]
            matched_class = row[3]
            matched_attribute = row[4]
            matched_relationship = row[5]

            precision_attributes_max += 1

            if matched_class == "" and matched_attribute == "" and matched_relationship == "":
                continue

            precision_attributes += 1
            matched_attribute_identificator = f"{matched_attribute}-{source_class}"

            for i, expected_attribute_identificator in enumerate(expected_attributes):
                if expected_attribute_identificator == matched_attribute_identificator:
                    checked_attributes[i] = True
                    break

    for checked_attribute in checked_attributes:
        if checked_attribute:
            recall_attributes += 1
        recall_attributes_max += 1


def evaluate_relationships(test_data_path, evaluated_path):

    global recall_relationships
    global recall_relationships_max
    global precision_relationships
    global precision_relationships_max

    with open(test_data_path) as file:
        test_data = json.load(file)

    expected_relationships = []
    test_cases = test_data["relationships"]

    for test_case in test_cases:

        expected_output = test_case["expected_output"]
        inputed_entity = test_case["entity"]

        for output in expected_output:
            
            expected_relationships.append(f"{output['name']}-{inputed_entity}")

        checked_relationships = [False] * len(expected_relationships)


    with open(evaluated_path, "r", newline="") as file:
        reader = csv.reader(file, delimiter=SEPARATOR)
        for index, row in enumerate(reader):
            if index == 0 or len(row) == 0:
                continue

            inputed_entity = row[1]
            matched_class = row[5]
            matched_attribute = row[6]
            matched_relationship = row[7]

            precision_relationships_max += 1

            if matched_class == "" and matched_attribute == "" and matched_relationship == "":
                continue

            precision_relationships += 1

            for i, expected_relationship in enumerate(expected_relationships):
                if expected_relationship == f"{matched_relationship}-{inputed_entity}":
                    checked_relationships[i] = True
                    break

    for checked_relationship in checked_relationships:
        if checked_relationship:
            recall_relationships += 1
        recall_relationships_max += 1


def check_file(path, user_choice):

    if not os.path.isfile(path):
        print(f"Stopping: {user_choice.capitalize()} evaluated file not found: {path}\n")
        return False
    return True
    

def print_evaluation():
    recall_entities_percentage = (recall_entities / recall_entities_max) * 100
    precision_entities_percentage = (precision_entities / precision_entities_max) * 100
    print(f"Entities recall: {recall_entities}/{recall_entities_max} - " + "{:.2f}".format(recall_entities_percentage) + "%")
    print(f"Entities precision: {precision_entities}/{precision_entities_max} - " + "{:.2f}".format(precision_entities_percentage) + "%\n")
    
    recall_attributes_percentage = (recall_attributes / recall_attributes_max) * 100
    precision_attributes_percentage = (precision_attributes / precision_attributes_max) * 100
    print(f"Attributes recall: {recall_attributes}/{recall_attributes_max} - " + "{:.2f}".format(recall_attributes_percentage) + "%")
    print(f"Attributes precision: {precision_attributes}/{precision_attributes_max} - " + "{:.2f}".format(precision_attributes_percentage) + "%\n")
    
    recall_relationships_percentage = (recall_relationships / recall_relationships_max) * 100
    precision_relationships_percentage = (precision_relationships / precision_relationships_max) * 100
    print(f"Relationships recall: {recall_relationships}/{recall_relationships_max} - " + "{:.2f}".format(recall_relationships_percentage) + "%")
    print(f"Relationships precision: {precision_relationships}/{precision_relationships_max} - " + "{:.2f}".format(precision_relationships_percentage) + "%")


def main():
    
    for index, domain_model in enumerate(domain_models):
        for i in range(DOMAIN_DESCRIPTIONS_COUNT[index]):

            entities_expected_suggestions_path = os.path.join(INPUT_DIRECTORY_PATH, domain_model, f"{UserChoice.ENTITIES.value}-expected-suggestions-0{i + 1}.json")
            attributes_expected_suggestions_path = os.path.join(INPUT_DIRECTORY_PATH, domain_model, f"{UserChoice.ATTRIBUTES.value}-expected-suggestions-0{i + 1}.json")
            relationships_expected_suggestions_path = os.path.join(INPUT_DIRECTORY_PATH, domain_model, f"{UserChoice.RELATIONSHIPS.value}-expected-suggestions-0{i + 1}.json")

            entities_evaluated_path = os.path.join(OUTPUT_DIRECTORY_PATH, f"{domain_models_name[index]}-{UserChoice.ENTITIES.value}-actual-0{i + 1}.csv")
            attributes_evaluated_path = os.path.join(OUTPUT_DIRECTORY_PATH, f"{domain_models_name[index]}-{UserChoice.ATTRIBUTES.value}-actual-0{i + 1}.csv")
            relationships_evaluated_path = os.path.join(OUTPUT_DIRECTORY_PATH, f"{domain_models_name[index]}-{UserChoice.RELATIONSHIPS.value}-actual-0{i + 1}.csv")

            is_file = check_file(entities_evaluated_path, UserChoice.ENTITIES.value)
            is_file = is_file and check_file(attributes_evaluated_path, UserChoice.ATTRIBUTES.value)
            is_file = is_file and check_file(relationships_evaluated_path, UserChoice.RELATIONSHIPS.value)

            if not is_file:
                print_evaluation()
                exit(0)

            evaluate_entities(entities_expected_suggestions_path, entities_evaluated_path)
            evaluate_attributes(attributes_expected_suggestions_path, attributes_evaluated_path)
            evaluate_relationships(relationships_expected_suggestions_path, relationships_evaluated_path)

    print_evaluation()

    


if __name__ == "__main__":
    main()