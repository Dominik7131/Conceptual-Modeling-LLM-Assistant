import os
import sys

sys.path.append(".")
sys.path.append("utils")
sys.path.append(os.path.join("backend", "utils"))
from text_utility import TextUtility, UserChoice

are_all_tests_passing = True


def test(test_name, original_text, domain_description, expected_original_text_indexes):

    global are_all_tests_passing

    actual_original_text_indexes, _, _ = TextUtility.find_text_in_domain_description(original_text, domain_description, user_choice=UserChoice.ATTRIBUTES.value)
    is_test_fail = actual_original_text_indexes != expected_original_text_indexes

    if is_test_fail:
        are_all_tests_passing = False
        print(f"Test failed:\n- name: {test_name}\n- domain description: {domain_description}\n- original text: {original_text}\n- expected original text indexes: {expected_original_text_indexes}\n- actual original text indexes: {actual_original_text_indexes}\n")
        TextUtility.show_original_text_in_domain_description(actual_original_text_indexes, domain_description)


def basic_tests():

    test_name = "simple 1:1 match at the start"
    domain_description = "This is the first sentence. This is the second sentence."
    original_text = "the first sentence"
    expected_original_text_indexes = [8, 26]
    test(test_name, original_text, domain_description, expected_original_text_indexes)

    test_name= "simple 1:1 match at the end"
    original_text = "the second sentence"
    expected_original_text_indexes = [36, 55]
    test(test_name, original_text, domain_description, expected_original_text_indexes)

    test_name = "case sensitive"
    original_text = "THE first SENTENCE"
    expected_original_text_indexes = [8, 26]
    test(test_name, original_text, domain_description, expected_original_text_indexes)

    test_name = "multiple occurencies"
    original_text = "sentence"
    expected_original_text_indexes = [18, 26, 47, 55]
    test(test_name, original_text, domain_description, expected_original_text_indexes)

    test_name = "one typo"
    domain_description = "This is the start of the first sentence and the second sentence."
    original_text = "This is the start of the first Zentence"
    expected_original_text_indexes = [0, 30, 32, 39]
    test(test_name, original_text, domain_description, expected_original_text_indexes)

    test_name = "the longest substring in the start"
    domain_description = "This is the start of the first sentence and the second sentence."
    original_text = "This is the start of the second sentence"
    expected_original_text_indexes = [0, 24, 48, 63]
    test(test_name, original_text, domain_description, expected_original_text_indexes)

    test_name = "the longest substring in the end"
    domain_description = "This is the first sentence and the second sentence."
    original_text = "This is the second sentence."
    expected_original_text_indexes = [0, 7, 31, 51]
    test(test_name, original_text, domain_description, expected_original_text_indexes)


    # If we want to continue to be able to recover from even more mistakes
    # the next step is to deal with the longest substring in the middle of the original text as shown in the next test
    # However, as the LLMs are getting better they should make fewer mistakes so we necessarily don't need to work
    # on further recovery techniques

    # test_name = "the longest substring in the middle"
    # domain_description = "This is the first sentence and the third sentence."
    # original_text = "This is sentence and the sentence"
    # expected_original_text_indexes = [0, 7, 18, 34, 41, 49]
    # test(test_name, original_text, domain_description, expected_original_text_indexes)


def main():

    basic_tests()

    if (are_all_tests_passing):
        print("All tests are passing")

    return


if __name__ == '__main__':
    main()