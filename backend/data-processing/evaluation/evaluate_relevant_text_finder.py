import os
import sys

TEXT_FILTERING_DIRECTORY_NAME = "text-filtering"

sys.path.append(".")
sys.path.append("utils")
sys.path.append("definitions")
sys.path.append(os.path.join(TEXT_FILTERING_DIRECTORY_NAME, "syntactic"))
sys.path.append(os.path.join(TEXT_FILTERING_DIRECTORY_NAME, "semantic"))

import argparse
import json
from text_splitter import TextSplitter
from definitions.utility import TextFilteringVariation, UserChoice
from syntactic_text_filterer import SyntacticTextFilterer
from definitions.domain_modelling import DOMAIN_MODELING_DIRECTORY_PATH, DOMAIN_DESCRIPTIONS_COUNT, DOMAIN_MODELS, DOMAIN_MODELS_NAME, DOMAIN_TEXTS_COUNT


# Indexes correspond to texts in domain models and last index corresponds to all texts together
recall_classes = [0] * (DOMAIN_TEXTS_COUNT + 1)
recall_attributes = [0] * (DOMAIN_TEXTS_COUNT + 1)
recall_associations = [0] * (DOMAIN_TEXTS_COUNT + 1)

recall_classes_max = [0] * (DOMAIN_TEXTS_COUNT + 1)
recall_attributes_max = [0] * (DOMAIN_TEXTS_COUNT + 1)
recall_associations_max = [0] * (DOMAIN_TEXTS_COUNT + 1)

precision = [0] * (DOMAIN_TEXTS_COUNT + 1)
precision_max = [0] * (DOMAIN_TEXTS_COUNT + 1)


def compare_texts(expected_relevant_texts, actual_relevant_texts, domain_description_path, user_choice, name, source_class="", target_class="", is_print_failed_tests=False):

    total_tests = 0
    successful_tests = 0

    for expected_text in expected_relevant_texts:
        total_tests += 1
        is_relevant_text_found = False
        for actual_relevant_text in actual_relevant_texts:
            if expected_text in actual_relevant_text:
                is_relevant_text_found = True
                break

        if not is_relevant_text_found:

            if is_print_failed_tests:
                print("Test failed:")
                print(f"- file: {domain_description_path}")

                # Name in uppercase represents the class used for filtering
                if user_choice == UserChoice.CLASSES.value:
                    print(f"- CLASS: {name}")

                elif user_choice == UserChoice.ATTRIBUTES.value:
                    print(f"- SOURCE CLASS: {source_class}")
                    print(f"- attribute name: {name}")

                elif user_choice == UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value:
                    if source_class != "":
                        print(f"- SOURCE CLASS: {source_class}")
                    else:
                        print(f"- TARGET CLASS: {target_class}")

                    print(f"- association name: {name}")

                elif user_choice == UserChoice.ASSOCIATIONS_TWO_KNOWN_CLASSES.value:
                    print(f"- SOURCE CLASS: {source_class}")
                    print(f"- TARGET CLASS: {target_class}")
                    print(f"- association name: {name}")

                print(f"- relevant text not found: {expected_text}\n")
        else:
            successful_tests += 1
    
    return total_tests, successful_tests


def get_actual_relevant_texts(filtering_variation, domain_description, source_class, text_finder=None):

    if filtering_variation == TextFilteringVariation.NONE.value:
        actual_relevant_texts = TextSplitter.split_into_sentences(domain_description)
    else:
        actual_relevant_texts = text_finder.get(source_class, domain_description)
    
    return actual_relevant_texts


def process_test_casses_attributes(test_case, actual_relevant_texts, all_expected_relevant_texts, domain_description_path, text_index, clss, is_print_failed_tests):

    test_name = UserChoice.ATTRIBUTES.value

    if not test_name in test_case:
        raise ValueError(f"Unknown test name: {test_name}")

    attributes_tests = test_case[UserChoice.ATTRIBUTES.value]

    for attributes_test in attributes_tests:
        name = attributes_test["name"]

        expected_relevant_texts = attributes_test["relevant_texts"]

        for text in expected_relevant_texts:
            if text not in all_expected_relevant_texts:
                all_expected_relevant_texts.append(text)

        current_total, current_successfull_tests = compare_texts(expected_relevant_texts, actual_relevant_texts, domain_description_path, name=name, user_choice=UserChoice.ATTRIBUTES.value, source_class=clss, is_print_failed_tests=is_print_failed_tests)

        recall_attributes[text_index] += current_successfull_tests
        recall_attributes[-1] += current_successfull_tests
        recall_attributes_max[text_index] += current_total
        recall_attributes_max[-1] += current_total


def process_test_casses_associations(test_case, actual_relevant_texts, all_expected_relevant_texts, domain_description_path, text_index, clss, is_print_failed_tests):

    test_name = "associations"

    if not test_name in test_case:
        raise ValueError(f"Unknown test name: {test_name}")

    associations_tests = test_case[test_name]

    for test in associations_tests:
        name = test["name"]

        expected_relevant_texts = test["relevant_texts"]
        for text in expected_relevant_texts:
            if text not in all_expected_relevant_texts:
                all_expected_relevant_texts.append(text)

        source_class = ""
        target_class = ""

        if test["is_source"]:
            source_class = clss
        else:
            target_class = clss

        current_total, current_successfull_tests = compare_texts(expected_relevant_texts, actual_relevant_texts, domain_description_path, name=name, user_choice=UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value, source_class=source_class, target_class=target_class, is_print_failed_tests=is_print_failed_tests)

        recall_associations[text_index] += current_successfull_tests
        recall_associations[-1] += current_successfull_tests
        recall_associations_max[text_index] += current_total
        recall_associations_max[-1] += current_total



def calculate_precision(text_index, expected_relevant_texts, actual_relevant_texts):

    for expected_text in expected_relevant_texts:
        for actual_text in actual_relevant_texts:
            if expected_text in actual_text:
                precision[text_index] += 1
                precision[-1] += 1
                break
    
    precision_max[text_index] += len(actual_relevant_texts)
    precision_max[-1] += len(actual_relevant_texts)


def process_test_cases(test_cases, text_index, filtering_variation, text_finder, domain_description, domain_description_path, is_print_failed_tests):

    for test_case in test_cases:
        clss = test_case["class"]
        expected_relevant_texts = test_case["relevant_texts"]

        actual_relevant_texts = get_actual_relevant_texts(filtering_variation, domain_description, clss, text_finder)

        current_total, current_successfull_tests = compare_texts(expected_relevant_texts, actual_relevant_texts, domain_description_path, name=clss, user_choice=UserChoice.CLASSES.value, is_print_failed_tests=is_print_failed_tests)

        recall_classes[text_index] += current_successfull_tests
        recall_classes[-1] += current_successfull_tests
        recall_classes_max[text_index] += current_total
        recall_classes_max[-1] += current_total
        
        process_test_casses_attributes(test_case, actual_relevant_texts, expected_relevant_texts, domain_description_path, text_index, clss, is_print_failed_tests)
        process_test_casses_associations(test_case, actual_relevant_texts, expected_relevant_texts, domain_description_path, text_index, clss, is_print_failed_tests)
        calculate_precision(text_index, expected_relevant_texts, actual_relevant_texts)


def run_test(filtering_variation, is_print_failed_tests):

    if filtering_variation == TextFilteringVariation.SYNTACTIC.value:
        text_finder = SyntacticTextFilterer()
    
    elif filtering_variation == TextFilteringVariation.SEMANTIC.value:
        from semantic_text_filterer import SemanticTextFilterer
        text_finder = SemanticTextFilterer()

    else:
        text_finder = None


    text_index = 0
    for index, domain_model in enumerate(DOMAIN_MODELS):
        for i in range(DOMAIN_DESCRIPTIONS_COUNT[index]):

            domain_description_file_name = f"domain-description-0{i + 1}.txt"
            test_file_name = f"relevant-texts-one-known_class-0{i + 1}.json"

            domain_description_path = os.path.join(DOMAIN_MODELING_DIRECTORY_PATH, domain_model, domain_description_file_name)
            test_file_path = os.path.join(DOMAIN_MODELING_DIRECTORY_PATH, domain_model, test_file_name)

            if not os.path.isfile(domain_description_path):
                raise ValueError(f"Domain description not found: {domain_description_path}")

            if not os.path.isfile(test_file_path):
                raise ValueError(f"Test file not found: {test_file_path}")

            with open(test_file_path) as file:
                test_cases = json.load(file)["test_cases"]
            
            with open(domain_description_path) as file:
                domain_description = file.read()

            process_test_cases(test_cases, text_index, filtering_variation, text_finder, domain_description, domain_description_path, is_print_failed_tests)

            text_index += 1
    
    print_evaluation()


def print_recall(index):

    recall_classes_percentage = (recall_classes[index] / recall_classes_max[index]) * 100
    recall_attributes_percentage = (recall_attributes[index] / recall_attributes_max[index]) * 100
    recall_associations_percentage = (recall_associations[index] / recall_associations_max[index]) * 100

    print("Recall")
    print(f"- classes: {recall_classes[index]}/{recall_classes_max[index]} - " + "{:.2f}".format(recall_classes_percentage) + "%")
    print(f"- attributes: {recall_attributes[index]}/{recall_attributes_max[index]} - " + "{:.2f}".format(recall_attributes_percentage) + "%")
    print(f"- associations: {recall_associations[index]}/{recall_associations_max[index]} - " + "{:.2f}".format(recall_associations_percentage) + "%\n")


def print_precision(index):

    precision_percentage = (precision[index] / precision_max[index]) * 100

    print("Precision")
    print(f"- {precision[index]}/{precision_max[index]} - " + "{:.2f}".format(precision_percentage) + "%\n\n")


def print_evaluation():

    text_index = 0
    for index, _ in enumerate(DOMAIN_MODELS):
        for i in range(DOMAIN_DESCRIPTIONS_COUNT[index]):

            print(f"---- {DOMAIN_MODELS_NAME[index]}-0{i + 1} ---- ")
            print_recall(text_index)
            print_precision(text_index)
            text_index += 1

    print(f"---- Results for all texts ---- ")
    print_recall(text_index)
    print_precision(text_index)


def main():

    parser = argparse.ArgumentParser(description = "Relevant texts tester")
    parser.add_argument("--filtering", choices = [TextFilteringVariation.NONE.value, TextFilteringVariation.SYNTACTIC.value, TextFilteringVariation.SEMANTIC.value], type=str, default=TextFilteringVariation.SYNTACTIC.value, help = "Choose variation for domain description filtering")
    parser.add_argument("--print_failed_tests", action = "store_true", default=False, help = "")

    args = parser.parse_args()
    is_print_failed_tests = args.print_failed_tests

    run_test(args.filtering, is_print_failed_tests)


if __name__ == "__main__":
    main()