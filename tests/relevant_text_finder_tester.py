import sys
sys.path.append('.')
import json
import os
from text_utility import DomainDescriptionFilteringVariation, TextUtility
from syntactic_text_filterer import SyntacitTextFilterer
from semantic_text_filterer import SemanticTextFilterer

PATH_TO_DATA_DIRECTORY = os.path.join("data", "56-2001-extract-llm-assistant-test-case")
TEST_DATA_FILE_PATH = os.path.join(PATH_TO_DATA_DIRECTORY, "relevant_texts.json")
INPUT_DOMAIN_DESCRIPTION_FILE_PATH = os.path.join(PATH_TO_DATA_DIRECTORY, "56-2001-extract-llm-assistant-test-case.txt")


DIRECTORY_PATH = os.path.join("domain-modeling-benchmark", "domain-models")

domain_models = ["aircraft manufacturing 48982a787d8d25", "conference papers 56cd5f7cf40f52", "farming 97627e23829afb"]
DOMAIN_DESCRIPTIONS_COUNT = 3


class RAGTester:

    def test_filtering(filtering_variation):

        if filtering_variation == DomainDescriptionFilteringVariation.SYNTACTIC:
            syntactic_text_finder = SyntacitTextFilterer()
        
        if filtering_variation == DomainDescriptionFilteringVariation.SEMANTIC:
            semantic_text_finder = SemanticTextFilterer()

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

                are_all_tests_passing = True

                for test_case in test_cases:
                    entity = test_case['entity']
                    expected_relevant_texts = test_case['relevant_texts']

                    if filtering_variation == DomainDescriptionFilteringVariation.NO_FILTERING:
                        actual_relevant_texts = TextUtility.split_into_sentences(domain_description)

                    elif filtering_variation == DomainDescriptionFilteringVariation.SYNTACTIC:
                        actual_relevant_texts = syntactic_text_finder.get(entity, domain_description)

                    elif filtering_variation == DomainDescriptionFilteringVariation.SEMANTIC:
                        actual_relevant_texts = semantic_text_finder.get(entity, domain_description)

                    else:
                        raise ValueError(f"Unexpected filtering variation: {filtering_variation}")
                    

                    for expected_text in expected_relevant_texts:
                        total_tests += 1
                        is_relevant_text_found = False
                        for actual_relevant_text in actual_relevant_texts:
                            if expected_text in actual_relevant_text:
                                is_relevant_text_found = True
                                break

                        if not is_relevant_text_found:
                            are_all_tests_passing = False
                            print(f"Test failed:\n- file: {domain_description_path}\n- entity: {entity}\n- relevant text not found: {expected_text}\n")
                            # print(f"Actual relevant texts:\n{actual_relevant_texts}\n")
                        else:
                            successful_tests += 1
                    
                    total_texts += len(actual_relevant_texts)
                    
                if are_all_tests_passing:
                    print("All tests are passing")

        print(f"Successful tests / total tests: {successful_tests} / {total_tests}")
        recall = (successful_tests / total_tests) * 100
        print("Recall: " + "{:.2f}".format(recall) + "%")

        precision = (successful_tests / total_texts) * 100
        print("Precision: " + "{:.2f}".format(precision) + "%")


    def output_relevant_text_for_given_entities():
        # entities = ["vehicle type", "motorised vehicle", "structural component", "manufacturer", "vehicle system", "owner", "operator", "natural person", "business natural person", "address", "legal person", "registration", "registration application", "third party insurance", "insurance contract", "policy holder", "insurer", "green card", "technical inspection", "technical inspection report", "defect"]
        entities = ["motorised vehicle"]
        
        relevant_text_finder = SyntacitTextFilterer()

        with open(INPUT_DOMAIN_DESCRIPTION_FILE_PATH, 'r') as domain_description_file:
            domain_description = domain_description_file.read()

        for entity in entities:
            relevant_texts = relevant_text_finder.get(entity, domain_description)
            print(f"Entity: {entity}")
            for text in relevant_texts:
                print(text)
            print()
            print()
    

    def load_test_cases():
        with open(TEST_DATA_FILE_PATH, 'r') as file:
            test_data = json.load(file)

        test_cases = test_data['test_cases']
        return test_cases


def main():

    filtering_variation = DomainDescriptionFilteringVariation.SEMANTIC
    print(f"Selected filtering variation: {filtering_variation}")

    RAGTester.test_filtering(filtering_variation)

    # RAGTester.output_relevant_text_for_given_entities()


if __name__ == "__main__":
    main()