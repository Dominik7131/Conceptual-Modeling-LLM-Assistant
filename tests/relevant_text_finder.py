import sys
sys.path.append('.')
import argparse
import json
import os
from text_utility import TextFilteringVariation, TextUtility
from syntactic_text_filterer import SyntacticTextFilterer


DIRECTORY_PATH = os.path.join("domain-modeling-benchmark", "evaluation domain models")
domain_models = ["aircraft manufacturing 48982a787d8d25", "conference papers 56cd5f7cf40f52", "farming 97627e23829afb", "college 1dc8e791-1d0e-477c-b5c2-24e376e3f6f1", "zoological gardens e95b5ea472deb8", "registry of road vehicles 60098f15-668b-4a39-8503-285e0b51d56d"]
DOMAIN_DESCRIPTIONS_COUNT = [3, 3, 3, 1, 1, 1]


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

        if filtering_variation == TextFilteringVariation.NONE.value:
            actual_relevant_texts = TextUtility.split_into_sentences(domain_description)
        else:
            actual_relevant_texts = text_finder.get(source_entity, domain_description)
        
        return actual_relevant_texts


    def test_filtering(filtering_variation):

        if filtering_variation == TextFilteringVariation.SYNTACTIC.value:
            text_finder = SyntacticTextFilterer()
        
        elif filtering_variation == TextFilteringVariation.SEMANTIC.value:
            from semantic_text_filterer import SemanticTextFilterer
            text_finder = SemanticTextFilterer()

        else:
            text_finder = None

        total_tests_entities = 0
        total_tests_attributes = 0
        total_tests_relationships = 0
        successful_tests_entities = 0
        successful_tests_attributes = 0
        successful_tests_relationships = 0
        used_texts_count = 0
        total_texts = 0

        for index, domain_model in enumerate(domain_models):
            for i in range(DOMAIN_DESCRIPTIONS_COUNT[index]):

                domain_description_file_name = f"domain-description-0{i + 1}.txt"
                test_file_name = f"relevant-texts-one-known_entity-0{i + 1}.json"

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
                    all_expected_relevant_texts = expected_relevant_texts

                    actual_relevant_texts = RAGTester.get_actual_relevant_texts(filtering_variation, domain_description, entity, text_finder)

                    current_total, current_successfull_tests = RAGTester.compare_texts(expected_relevant_texts, actual_relevant_texts, domain_description_path, entity)

                    total_tests_entities += current_total
                    successful_tests_entities += current_successfull_tests

                    if "attributes" in test_case:
                        attributes_tests = test_case['attributes']

                        for attributes_test in attributes_tests:
                            name = attributes_test["name"] + "--" + entity

                            expected_relevant_texts = attributes_test["relevant_texts"]

                            for text in expected_relevant_texts:
                                if text not in all_expected_relevant_texts:
                                    all_expected_relevant_texts.append(text)

                            current_total, current_successfull_tests = RAGTester.compare_texts(expected_relevant_texts, actual_relevant_texts, domain_description_path, name)

                            total_tests_attributes += current_total
                            successful_tests_attributes += current_successfull_tests
                    
                    if "relationships" in test_case:
                        relationships_tests = test_case['relationships']

                        for relationship_test in relationships_tests:
                            name = relationship_test["name"] + "--" + entity + "--" + f"source: {relationship_test['is_source']}"

                            expected_relevant_texts = relationship_test["relevant_texts"]
                            for text in expected_relevant_texts:
                                if text not in all_expected_relevant_texts:
                                    all_expected_relevant_texts.append(text)

                            current_total, current_successfull_tests = RAGTester.compare_texts(expected_relevant_texts, actual_relevant_texts, domain_description_path, name)

                            total_tests_relationships += current_total
                            successful_tests_relationships += current_successfull_tests

                    # Calculate precision for this test case:
                    for expected_text in all_expected_relevant_texts:
                        for actual_text in actual_relevant_texts:
                            if expected_text in actual_text:
                                used_texts_count += 1
                                break
                    
                    total_texts += len(actual_relevant_texts)


        print(f"Entities successful tests / entities total tests: {successful_tests_entities} / {total_tests_entities}")
        recall = (successful_tests_entities / total_tests_entities) * 100
        print("Recall: " + "{:.2f}".format(recall) + "%")

        print(f"Attributes successful tests / attributes total tests: {successful_tests_attributes} / {total_tests_attributes}")
        recall = (successful_tests_attributes / total_tests_attributes) * 100
        print("Recall: " + "{:.2f}".format(recall) + "%")

        print(f"Relationships successful tests / relationships total tests: {successful_tests_relationships} / {total_tests_relationships}")
        recall = (successful_tests_relationships / total_tests_relationships) * 100
        print("Recall: " + "{:.2f}".format(recall) + "%")

        print(f"Used sentences / total output sentences: {used_texts_count} / {total_texts}")
        precision = (used_texts_count / total_texts) * 100
        print("Precision: " + "{:.2f}".format(precision) + "%")


    def output_relevant_text_for_given_entities(filtering_variation, domain_description_path):
        # entities = ["vehicle type", "motorised vehicle", "structural component", "manufacturer", "vehicle system", "owner", "operator", "natural person", "business natural person", "address", "legal person", "registration", "registration application", "third party insurance", "insurance contract", "policy holder", "insurer", "green card", "technical inspection", "technical inspection report", "defect"]
        entities = ["cultivated variety"]
        
        if filtering_variation == TextFilteringVariation.SYNTACTIC.value:
            relevant_text_finder = SyntacticTextFilterer()

        elif filtering_variation == TextFilteringVariation.SEMANTIC.value:
            from semantic_text_filterer import SemanticTextFilterer
            relevant_text_finder = SemanticTextFilterer()

        with open(domain_description_path, 'r') as file:
            domain_description = file.read()

        for entity in entities:

            if filtering_variation == TextFilteringVariation.NONE.value:
                relevant_texts = TextUtility.split_into_sentences(domain_description)
            else:
                relevant_texts = relevant_text_finder.get(entity, domain_description)

            print(f"Entity: {entity}")
            for text in relevant_texts:
                print(text)

            print("\n\n")


def main():

    parser = argparse.ArgumentParser(description = "Relevant texts tester")
    parser.add_argument("--filtering", choices = [TextFilteringVariation.NONE.value, TextFilteringVariation.SYNTACTIC.value, TextFilteringVariation.SEMANTIC.value], type=str, default=TextFilteringVariation.NONE.value, help = "Choose variation for domain description filtering")
    args = parser.parse_args()

    RAGTester.test_filtering(args.filtering)

    # domain_description_path = "domain-modeling-benchmark\\domain-models\\farming 97627e23829afb\\domain-description-03.txt"
    # RAGTester.output_relevant_text_for_given_entities(filtering_variation, domain_description_path)


if __name__ == "__main__":
    main()