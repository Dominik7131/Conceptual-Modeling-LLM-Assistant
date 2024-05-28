import os
import sys

sys.path.append(".")
sys.path.append("utils")
sys.path.append(os.path.join("backend", "utils"))
from text_utility import TextUtility, UserChoice


def test(original_text, domain_description, expected_original_text_indexes):

    actual_original_text_indexes, _, _ = TextUtility.find_text_in_domain_description(original_text, domain_description, user_choice=UserChoice.ATTRIBUTES.value)
    if not actual_original_text_indexes == expected_original_text_indexes:
        print(f"Test failed:\n- domain description: {domain_description}\n- original text: {original_text}\n- expected original text indexes: {expected_original_text_indexes}\n- actual original text indexes: {actual_original_text_indexes}\n")
        TextUtility.show_original_text_in_domain_description(actual_original_text_indexes, domain_description)


def basic_tests():

    # Simple test, 1:1 match
    domain_description = "This is the first sentence. This is the second sentence."
    original_text = "the first sentence"
    expected_original_text_indexes = [8, 26]
    test(original_text, domain_description, expected_original_text_indexes)

    # Simple test, 1:1 match
    original_text = "the second sentence"
    expected_original_text_indexes = [36, 55]
    test(original_text, domain_description, expected_original_text_indexes)

    # Case sensitive
    original_text = "THE first SENTENCE"
    expected_original_text_indexes = [8, 26]
    test(original_text, domain_description, expected_original_text_indexes)

    # Multiple occurencies
    original_text = "sentence"
    expected_original_text_indexes = [18, 26, 47, 55]
    test(original_text, domain_description, expected_original_text_indexes)

    # One typo
    domain_description = "This is the start of the first sentence and the second sentence."
    original_text = "This is the start of the first Zentence"
    expected_original_text_indexes = [0, 30, 32, 39]
    test(original_text, domain_description, expected_original_text_indexes)

    # The longest substring in the start
    domain_description = "This is the start of the first sentence and the second sentence."
    original_text = "This is the start of the second sentence"
    expected_original_text_indexes = [0, 24, 48, 63]
    test(original_text, domain_description, expected_original_text_indexes)

    # The longest substring in the end
    domain_description = "This is the first sentence and the second sentence."
    original_text = "This is the second sentence."
    expected_original_text_indexes = [0, 7, 31, 51]
    test(original_text, domain_description, expected_original_text_indexes)

    # The longest substring can in the middle
    domain_description = "This is the first sentence and the third sentence."
    original_text = "This is sentence and the sentence"
    expected_original_text_indexes = [0, 7, 18, 34, 41, 49]
    test(original_text, domain_description, expected_original_text_indexes)

    # Random test
    domain_description = "A farmer is an individual engaged in agriculture, growing and harvesting crops, and is identified uniquely by a name that is used to refer"
    original_text = "A farmer is identified uniquely by a name"
    expected_original_text_indexes = [0, 8, 84, 116]
    test(original_text, domain_description, expected_original_text_indexes)


def main():

    basic_tests()
    return


if __name__ == '__main__':
    main()