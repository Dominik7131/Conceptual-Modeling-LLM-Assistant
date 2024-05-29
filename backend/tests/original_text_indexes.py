import os
import sys


sys.path.append("utils")
sys.path.append(".")
sys.path.append(os.path.join("backend", "utils"))
from original_text_finder import OriginalTextFinder
from definitions.utility import UserChoice


def check_tests(tests):

    are_all_tests_passing = True

    for test in tests:
        name = test["name"]
        domain_description = test["domain_description"]
        original_text = test["original_text"]
        expected_original_text_indexes = test["expected_original_text_indexes"]

        actual_original_text_indexes, _, _ = OriginalTextFinder.find_in_domain_description(original_text, domain_description, user_choice=UserChoice.ATTRIBUTES.value)
        is_test_failed = actual_original_text_indexes != expected_original_text_indexes

        if is_test_failed:
            are_all_tests_passing = False
            print(f"Test failed:\n- name: {name}\n- domain description: {domain_description}\n- original text: {original_text}\n- expected original text indexes: {expected_original_text_indexes}\n- actual original text indexes: {actual_original_text_indexes}\n")
            OriginalTextFinder.show_in_domain_description(actual_original_text_indexes, domain_description)
    
    if are_all_tests_passing:
        print("All tests are passing")


def run_tests():

    tests = [
        {
            "name": "simple 1:1 match at the start",
            "domain_description": "This is the first sentence. This is the second sentence.",
            "original_text": "the first sentence",
            "expected_original_text_indexes": [8, 26],
        },
        {
            "name": "simple 1:1 match at the end",
            "domain_description": "This is the first sentence. This is the second sentence.",
            "original_text": "the second sentence",
            "expected_original_text_indexes": [36, 55],
        },
        {
            "name": "case sensitive",
            "domain_description": "This is the first sentence. This is the second sentence.",
            "original_text": "THE first SENTENCE",
            "expected_original_text_indexes": [8, 26],
        },
        {
            "name": "multiple occurencies",
            "domain_description": "This is the first sentence. This is the second sentence.",
            "original_text": "sentence",
            "expected_original_text_indexes": [18, 26, 47, 55],
        },
        {
            "name": "one typo",
            "domain_description": "This is the start of the first sentence and the second sentence.",
            "original_text": "This is the start of the first Zentence",
            "expected_original_text_indexes": [0, 30, 32, 39],
        },
        {
            "name": "the longest substring in the start",
            "domain_description": "This is the start of the first sentence and the second sentence.",
            "original_text": "This is the start of the second sentence",
            "expected_original_text_indexes": [0, 24, 48, 63],
        },
        {
            "name": "the longest substring in the end",
            "domain_description": "This is the first sentence and the second sentence.",
            "original_text": "This is the second sentence.",
            "expected_original_text_indexes": [0, 7, 31, 51],
        },
    ]

    # If we want to be able to recover from even more mistakes the next step is to deal
    # with the longest substring in the middle of the original text as shown in the next test
    # However, as the LLMs are getting better they should make fewer mistakes so we necessarily don't need to work
    # on further recovery techniques

    # Next possible test:
    # "name": "the longest substring in the middle",
    # "domain_description": "This is the first sentence and the third sentence.",
    # "original_text": "This is sentence and the sentence",
    # "expected_original_text_indexes": [0, 7, 18, 34, 41, 49],

    check_tests(tests)


def main():

    run_tests()


if __name__ == '__main__':
    main()