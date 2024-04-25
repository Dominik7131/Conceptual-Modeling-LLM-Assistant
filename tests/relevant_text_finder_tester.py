import sys
sys.path.append('.')
import json
import os
from text_utility import DomainDescriptionFilteringVariation, TextUtility
from syntactic_text_filterer import SyntacitTextFilterer


PATH_TO_DATA_DIRECTORY = os.path.join("data", "56-2001-extract-llm-assistant-test-case")
TEST_DATA_FILE_PATH = os.path.join(PATH_TO_DATA_DIRECTORY, "relevant_texts.json")
INPUT_DOMAIN_DESCRIPTION_FILE_PATH = os.path.join(PATH_TO_DATA_DIRECTORY, "56-2001-extract-llm-assistant-test-case.txt")


DIRECTORY_PATH = os.path.join("domain-modeling-benchmark", "domain-models")

domain_models = ["aircraft manufacturing 48982a787d8d25", "conference papers 56cd5f7cf40f52", "farming 97627e23829afb"]
DOMAIN_DESCRIPTIONS_COUNT = 3


class RAGTester:

    def compare_texts(expected_relevant_texts, actual_relevant_texts, domain_description_path, name):
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
                print(f"Test failed:\n- file: {domain_description_path}\n- name: {name}\n- relevant text not found: {expected_text}\n")
                # print(f"Actual relevant texts:\n{actual_relevant_texts}\n")
            else:
                successful_tests += 1
        
        return total_tests, successful_tests


    def get_actual_relevant_texts(filtering_variation, domain_description, source_entity, text_finder=None):

        if filtering_variation == DomainDescriptionFilteringVariation.NO_FILTERING:
            actual_relevant_texts = TextUtility.split_into_sentences(domain_description)
        else:
            actual_relevant_texts = text_finder.get(source_entity, domain_description)
        
        return actual_relevant_texts


    def test_filtering(filtering_variation):

        if filtering_variation == DomainDescriptionFilteringVariation.SYNTACTIC:
            text_finder = SyntacitTextFilterer()
        
        elif filtering_variation == DomainDescriptionFilteringVariation.SEMANTIC:
            from semantic_text_filterer import SemanticTextFilterer
            text_finder = SemanticTextFilterer()

        else:
            text_finder = None

        total_tests = 0
        successful_tests = 0
        total_texts = 0

        for domain_model in domain_models:
            for i in range(DOMAIN_DESCRIPTIONS_COUNT):

                domain_description_file_name = f"domain-description-0{i + 1}.txt"
                test_file_name = f"relevant-texts-0{i + 1}.json"

                domain_description_path = os.path.join(DIRECTORY_PATH, domain_model, domain_description_file_name)
                test_file_path = os.path.join(DIRECTORY_PATH, domain_model, test_file_name)

                if not os.path.isfile(domain_description_path):
                    raise ValueError(f"Domain description not found: {domain_description_path}")

                if not os.path.isfile(test_file_path):
                    raise ValueError(f"Test file not found: {test_file_path}")

                
                with open(test_file_path) as file:
                    test_cases = json.load(file)["test_cases"]
                
                with open(domain_description_path) as file:
                    domain_description = file.read()


                for test_case in test_cases:
                    entity = test_case["entity"]
                    expected_relevant_texts = test_case["relevant_texts"]

                    actual_relevant_texts = RAGTester.get_actual_relevant_texts(filtering_variation, domain_description, entity, text_finder)

                    current_total, current_successfull_tests = RAGTester.compare_texts(expected_relevant_texts, actual_relevant_texts, domain_description_path, entity)

                    total_tests += current_total
                    successful_tests += current_successfull_tests
                    total_texts += len(actual_relevant_texts)

                    if "attributes" in test_case:
                        attributes_tests = test_case['attributes']

                        for attributes_test in attributes_tests:
                            name = attributes_test["name"] + "--" + entity

                            expected_relevant_texts = attributes_test["relevant_texts"]

                            actual_relevant_texts = RAGTester.get_actual_relevant_texts(filtering_variation, domain_description, entity, text_finder)

                            current_total, current_successfull_tests = RAGTester.compare_texts(expected_relevant_texts, actual_relevant_texts, domain_description_path, name)

                            total_tests += current_total
                            successful_tests += current_successfull_tests
                            total_texts += len(actual_relevant_texts)


        print(f"Successful tests / total tests: {successful_tests} / {total_tests}")
        recall = (successful_tests / total_tests) * 100
        print("Recall: " + "{:.2f}".format(recall) + "%")

        precision = (successful_tests / total_texts) * 100
        print("Precision: " + "{:.2f}".format(precision) + "%")


    def output_relevant_text_for_given_entities(filtering_variation, domain_description_path):
        # entities = ["vehicle type", "motorised vehicle", "structural component", "manufacturer", "vehicle system", "owner", "operator", "natural person", "business natural person", "address", "legal person", "registration", "registration application", "third party insurance", "insurance contract", "policy holder", "insurer", "green card", "technical inspection", "technical inspection report", "defect"]
        entities = ["cultivated variety"]
        
        if filtering_variation == DomainDescriptionFilteringVariation.SYNTACTIC:
            relevant_text_finder = SyntacitTextFilterer()

        elif filtering_variation == DomainDescriptionFilteringVariation.SEMANTIC:
            from semantic_text_filterer import SemanticTextFilterer
            relevant_text_finder = SemanticTextFilterer()

        with open(domain_description_path, 'r') as file:
            domain_description = file.read()

        for entity in entities:

            if filtering_variation == DomainDescriptionFilteringVariation.NO_FILTERING:
                relevant_texts = TextUtility.split_into_sentences(domain_description)
            else:
                relevant_texts = relevant_text_finder.get(entity, domain_description)

            print(f"Entity: {entity}")
            for text in relevant_texts:
                print(text)

            print("\n\n")


def main():

    filtering_variation = DomainDescriptionFilteringVariation.NO_FILTERING
    print(f"Selected filtering variation: {filtering_variation}")

    RAGTester.test_filtering(filtering_variation)

    # domain_description_path = "domain-modeling-benchmark\\domain-models\\farming 97627e23829afb\\domain-description-03.txt"
    # RAGTester.output_relevant_text_for_given_entities(filtering_variation, domain_description_path)


if __name__ == "__main__":
    main()