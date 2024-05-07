import csv
import json
import os

from text_utility import UserChoice


INPUT_DIRECTORY_PATH = os.path.join("domain-modeling-benchmark", "evaluation domain models")
domain_models = ["aircraft manufacturing 48982a787d8d25", "conference papers 56cd5f7cf40f52", "farming 97627e23829afb", "college 1dc8e791-1d0e-477c-b5c2-24e376e3f6f1", "zoological gardens e95b5ea472deb8", "registry of road vehicles 60098f15-668b-4a39-8503-285e0b51d56d"]

OUTPUT_DIRECTORY_PATH = os.path.join("out", "evaluated-all", "actual-all")
domain_models_name = ["aircraft-manufacturing", "conference-papers", "farming", "college", "zoological-gardens", "registry-of-road-vehicles"]
DOMAIN_DESCRIPTIONS_COUNT = [3, 3, 3, 1, 1, 1]
DOMAIN_TEXTS_COUNT = 12

SEPARATOR = ','

# Indexes correspond to texts in domain models and last index corresponds to all texts together
recall_entities = [0] * (DOMAIN_TEXTS_COUNT + 1)
recall_attributes = [0] * (DOMAIN_TEXTS_COUNT + 1)
recall_relationships = [0] * (DOMAIN_TEXTS_COUNT + 1)

recall_entities_max = [0] * (DOMAIN_TEXTS_COUNT + 1)
recall_attributes_max = [0] * (DOMAIN_TEXTS_COUNT + 1)
recall_relationships_max = [0] * (DOMAIN_TEXTS_COUNT + 1)


# Only = only the corresponding element is matched
# Any = any element is matched
precision_entities_only = [0] * (DOMAIN_TEXTS_COUNT + 1)
precision_attributes_only = [0] * (DOMAIN_TEXTS_COUNT + 1)
precision_relationships_only = [0] * (DOMAIN_TEXTS_COUNT + 1)

precision_entities_any = [0] * (DOMAIN_TEXTS_COUNT + 1)
precision_attributes_any = [0] * (DOMAIN_TEXTS_COUNT + 1)
precision_relationships_any = [0] * (DOMAIN_TEXTS_COUNT + 1)

precision_entities_only_max = [0] * (DOMAIN_TEXTS_COUNT + 1)
precision_attributes_only_max = [0] * (DOMAIN_TEXTS_COUNT + 1)
precision_relationships_only_max = [0] * (DOMAIN_TEXTS_COUNT + 1)

precision_entities_max = [0] * (DOMAIN_TEXTS_COUNT + 1)
precision_attributes_max = [0] * (DOMAIN_TEXTS_COUNT + 1)
precision_relationships_max = [0] * (DOMAIN_TEXTS_COUNT + 1)


def get_domain_model_index(text_index):

    domain_model_index = 0
    for count in DOMAIN_DESCRIPTIONS_COUNT:
        text_index -= count

        if (text_index < 0):
            return domain_model_index
        
        domain_model_index += 1

    
def evaluate_entities(test_data_path, evaluated_path, text_index):

    global recall_entities
    global recall_entities_max
    global precision_entities_only
    global precision_entities_any
    global precision_entities_max

    with open(test_data_path) as file:
        test_data = json.load(file)

    expected_entities = []
    test_cases = test_data["entities"]

    for test_case in test_cases:
        expected_entities.append(test_case["entity"].replace(' ', '-').lower())

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

            precision_entities_max[-1] += 1
            precision_entities_max[text_index] += 1

            if matched_class == "" and matched_attribute == "" and matched_relationship == "":
                continue

            precision_entities_any[-1] += 1
            precision_entities_any[text_index] += 1

            if matched_class == "":
                continue

            precision_entities_only[-1] += 1
            precision_entities_only[text_index] += 1

            if matched_class == "*" or matched_attribute == "*" or matched_relationship == "*":
                continue
            
            is_match_found = False
            for i, expected_entity in enumerate(expected_entities):
                if expected_entity == matched_class.replace(' ', '-').lower():
                    checked_entities[i] = True
                    is_match_found = True
                    break
            
            if is_match_found:
                continue
            
            if matched_class[0] != '+' and matched_class[0] != '-':
                print(f"Warning: matched entity was not found: {matched_class}\nfile: {evaluated_path}\n")

            
            multi_matched_entities = matched_class[1:].split(sep=';')

            for multi_match in multi_matched_entities:
                is_match_found = False
                for i, expected_entity in enumerate(expected_entities):
                    multi_match_identificator = multi_match.strip().replace(' ', '-').lower()
                    if expected_entity == multi_match_identificator:
                        # TODO: Make a scenario where this counts
                        # checked_entities[i] = True
                        is_match_found = True
                        break
                
                if not is_match_found and multi_match != '*':
                    print(f"Warning: multi-matched entity was not found: {multi_match}\nfile: {evaluated_path}\n")


    
    for checked_entity in checked_entities:
        if checked_entity:
            recall_entities[-1] += 1
            recall_entities[text_index] += 1

        recall_entities_max[-1] += 1
        recall_entities_max[text_index] += 1


def evaluate_attributes(test_data_path, evaluated_path, text_index):

    global recall_attributes
    global recall_attributes_max
    global precision_attributes_only
    global precision_attributes_any
    global precision_attributes_max

    with open(test_data_path) as file:
        test_data = json.load(file)

    expected_attributes = []
    test_cases = test_data["attributes"]

    for test_case in test_cases:

        expected_output = test_case["expected_output"]
        source_entity = test_case["entity"]

        for output in expected_output:
            attribute_identificator = f"{output['name']}-{source_entity}".replace(' ', '-').lower()
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

            precision_attributes_max[text_index] += 1
            precision_attributes_max[-1] += 1

            if matched_class == "" and matched_attribute == "" and matched_relationship == "":
                continue

            precision_attributes_any[text_index] += 1
            precision_attributes_any[-1] += 1

            if matched_attribute == "":
                continue

            precision_attributes_only[text_index] += 1
            precision_attributes_only[-1] += 1

            if matched_class == "*" or matched_attribute == "*" or matched_relationship == "*":
                continue

            matched_attribute_identificator = f"{matched_attribute}-{source_class}".replace(' ', '-').lower()

            is_match_found = False
            for i, expected_attribute_identificator in enumerate(expected_attributes):
                if expected_attribute_identificator == matched_attribute_identificator:
                    checked_attributes[i] = True
                    is_match_found = True
                    break

            if is_match_found:
                continue
            
            if matched_attribute[0] != '+' and matched_attribute[0] != '-':
                print(f"Warning: matched attribute was not found: {matched_attribute}\nentity: {source_class}\nfile: {evaluated_path}\n")

            
            multi_matched_attributes = matched_attribute[1:].split(sep=';')

            for multi_match in multi_matched_attributes:
                is_match_found = False
                for i, expected_attribute_identificator in enumerate(expected_attributes):
                    multi_match_identificator = f"{multi_match}-{source_class}".strip().replace(' ', '-').lower()
                    if expected_attribute_identificator == multi_match_identificator:
                        # TODO: Make a scenario where this counts
                        # checked_attributes[i] = True
                        is_match_found = True
                        break
                
                if not is_match_found and multi_match != '*':
                    print(f"Warning: matched multi-attribute was not found: {multi_match}\nentity: {source_class}\nfile: {evaluated_path}\n")


    for checked_attribute in checked_attributes:
        if checked_attribute:
            recall_attributes[-1] += 1
            recall_attributes[text_index] += 1

        recall_attributes_max[-1] += 1
        recall_attributes_max[text_index] += 1


def evaluate_relationships(test_data_path, evaluated_path, text_index):

    global recall_relationships
    global recall_relationships_max
    global precision_relationships_only
    global precision_relationships_any
    global precision_relationships_max

    with open(test_data_path) as file:
        test_data = json.load(file)

    expected_relationships = []
    test_cases = test_data["relationships"]

    for test_case in test_cases:

        expected_output = test_case["expected_output"]
        inputed_entity = test_case["entity"]

        for output in expected_output:
            
            expected_relationships.append(f"{output['name']}-{inputed_entity}".replace(' ', '-').lower())

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

            precision_relationships_max[-1] += 1
            precision_relationships_max[text_index] += 1

            if matched_class == "" and matched_attribute == "" and matched_relationship == "":
                continue

            precision_relationships_any[-1] += 1
            precision_relationships_any[text_index] += 1

            if matched_relationship == "":
                continue

            precision_relationships_only[-1] += 1
            precision_relationships_only[text_index] += 1

            if matched_class == "*" or matched_attribute == "*" or matched_relationship == "*":
                continue


            is_match_found = False
            for i, expected_relationship in enumerate(expected_relationships):
                matched_relationship_identificator = f"{matched_relationship}-{inputed_entity}".replace(' ', '-').lower()
                if expected_relationship == matched_relationship_identificator:
                    checked_relationships[i] = True
                    is_match_found = True
                    break
            
            if is_match_found:
                continue
            
            if matched_relationship[0] != '+' and matched_relationship[0] != '-':
                print(f"Warning: matched relationship was not found: {matched_relationship}\nentity: {inputed_entity}\nfile: {evaluated_path}\n")

            
            multi_matched_relationships = matched_relationship[1:].split(sep=';')

            for multi_match in multi_matched_relationships:
                is_match_found = False
                for i, expected_relationship in enumerate(expected_relationships):
                    multi_match_identificator = f"{multi_match}-{inputed_entity}".strip().replace(' ', '-').lower()
                    if expected_relationship == multi_match_identificator:
                        # TODO: Make a scenario where this counts
                        # checked_relationships[i] = True
                        is_match_found = True
                        break
                
                if not is_match_found and multi_match != '*':
                    print(f"Warning: multi-matched relationship was not found: {multi_match}\nentity: {inputed_entity}\nfile: {evaluated_path}\n")


    for checked_relationship in checked_relationships:
        if checked_relationship:
            recall_relationships[-1] += 1
            recall_relationships[text_index] += 1

        recall_relationships_max[-1] += 1
        recall_relationships_max[text_index] += 1


def check_file(path, user_choice):

    if not os.path.isfile(path):
        print(f"Stopping: {user_choice.capitalize()} evaluated file not found: {path}\n")
        return False
    return True


def print_recall(index):

    recall_entities_percentage = (recall_entities[index] / recall_entities_max[index]) * 100
    recall_attributes_percentage = (recall_attributes[index] / recall_attributes_max[index]) * 100
    recall_relationships_percentage = (recall_relationships[index] / recall_relationships_max[index]) * 100

    print("Recall")
    print(f"- entities: {recall_entities[index]}/{recall_entities_max[index]} - " + "{:.2f}".format(recall_entities_percentage) + "%")
    print(f"- attributes: {recall_attributes[index]}/{recall_attributes_max[index]} - " + "{:.2f}".format(recall_attributes_percentage) + "%")
    print(f"- relationships: {recall_relationships[index]}/{recall_relationships_max[index]} - " + "{:.2f}".format(recall_relationships_percentage) + "%\n")


def print_precision(index):

    precision_entities_only_percentage = (precision_entities_only[index] / precision_entities_max[index]) * 100
    precision_entities_any_percentage = (precision_entities_any[index] / precision_entities_max[index]) * 100
    precision_attributes_only_percentage = (precision_attributes_only[index] / precision_attributes_max[index]) * 100
    precision_attributes_any_percentage = (precision_attributes_any[index] / precision_attributes_max[index]) * 100
    precision_relationships_only_percentage = (precision_relationships_only[index] / precision_relationships_max[index]) * 100
    precision_relationships_any_percentage = (precision_relationships_any[index] / precision_relationships_max[index]) * 100

    print("Precision: matches only corresponding element")
    print(f"- entities: {precision_entities_only[index]}/{precision_entities_max[index]} - " + "{:.2f}".format(precision_entities_only_percentage) + "%")
    print(f"- attributes: {precision_attributes_only[index]}/{precision_attributes_max[index]} - " + "{:.2f}".format(precision_attributes_only_percentage) + "%")
    print(f"- relationships: {precision_relationships_only[index]}/{precision_relationships_max[index]} - " + "{:.2f}".format(precision_relationships_only_percentage) + "%")
    print()

    print("Precision: matches any element")
    print(f"- entities: {precision_entities_any[index]}/{precision_entities_max[index]} - " + "{:.2f}".format(precision_entities_any_percentage) + "%")
    print(f"- attributes: {precision_attributes_any[index]}/{precision_attributes_max[index]} - " + "{:.2f}".format(precision_attributes_any_percentage) + "%")
    print(f"- relationships: {precision_relationships_any[index]}/{precision_relationships_max[index]} - " + "{:.2f}".format(precision_relationships_any_percentage) + "%\n\n")


def print_evaluation():

    text_index = 0
    for index, _ in enumerate(domain_models):
        for i in range(DOMAIN_DESCRIPTIONS_COUNT[index]):

            print(f"---- Results for {domain_models_name[index]}-0{i + 1} ---- ")
            print_recall(text_index)
            print_precision(text_index)
            text_index += 1

    print(f"---- Results for all texts ---- ")
    print_recall(text_index)
    print_precision(text_index)


def main():
    
    text_index = 0
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

            evaluate_entities(entities_expected_suggestions_path, entities_evaluated_path, text_index)
            evaluate_attributes(attributes_expected_suggestions_path, attributes_evaluated_path, text_index)
            evaluate_relationships(relationships_expected_suggestions_path, relationships_evaluated_path, text_index)
            text_index += 1

    print_evaluation()

    


if __name__ == "__main__":
    main()