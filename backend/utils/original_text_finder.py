from difflib import SequenceMatcher
from definitions.utility import UserChoice


class OriginalTextFinder:

    @staticmethod
    def split(original_text):

        # Split original text if it contains more parts:
        # E.g.: "The insurance contract shall always contain... the limit of the insurance benefit"
        # Result: ["The insurance contract shall always contain", "the limit of the insurance benefit"]
        original_text_parts = original_text.split(sep="...")
        original_text_parts = list(filter(None, original_text_parts))  # Remove empty strings

        return original_text_parts

    @staticmethod
    def find_in_domain_description(original_text, domain_description, user_choice):

        # Convert all text to lowercase as LLM sometimes does not generate case-sensitive original text
        domain_description = domain_description.lower()

        result = []

        original_text_parts = OriginalTextFinder.split(original_text)

        original_text_parts_total = len(original_text_parts)
        original_text_parts_found = 0
        index = 0

        for original_text_part in original_text_parts:
            original_text_part = original_text_part.lower().strip()
            is_original_text_found = False

            while index < len(domain_description):

                # Append all occurencies of the `original text_part` in the `domain_description`
                if domain_description[index:].startswith(original_text_part):
                    is_original_text_found = True
                    result.append(index)
                    result.append(index + len(original_text_part))

                index += 1

            if is_original_text_found:
                original_text_parts_found += 1

            elif not user_choice == UserChoice.CLASSES.value:

                new_result = OriginalTextFinder.find_substrings(original_text_part, domain_description)
                if new_result:
                    is_original_text_found = True
                    for original_text_index in new_result:
                        result.append(original_text_index)
                else:
                    print(f"Warning: original text not found: {original_text_part}")

        # If we get a lot of original text indexes there is probably some bug in our recovery strategy
        # In that case reset the original text indexes
        is_reset_result = not user_choice == UserChoice.CLASSES.value and len(result) > 10
        if is_reset_result:
            result = []

        result = OriginalTextFinder.sort_original_text_indexes(result)

        return result, original_text_parts_found, original_text_parts_total

    @staticmethod
    def sort_original_text_indexes(numbers):

        tuples = OriginalTextFinder.pair_consecutive_elements(numbers)

        if len(tuples) > 2:
            tuples = sorted(tuples, key=lambda x: (x[0], x[1]))
            numbers = OriginalTextFinder.tuples_to_list(tuples)

        numbers = OriginalTextFinder.remove_redundancy(numbers)

        return numbers

    @staticmethod
    def remove_redundancy(numbers):

        # E.g. [(10, 20), (10, 30)] -> [(10, 30)]
        for index, number in enumerate(numbers):

            if index + 3 >= len(numbers):
                continue

            x1 = number
            y1, y2 = numbers[index + 2], numbers[index + 3]

            if x1 == y1:
                numbers.pop(index + 2)
                numbers.pop(index + 2)
                numbers[index + 1] = y2

        return numbers

    @staticmethod
    def pair_consecutive_elements(numbers):

        # Ensure the list has an even number of elements
        if len(numbers) % 2 != 0:
            raise ValueError("List must contain an even number of elements")

        # Use zip and list slicing to create pairs
        return [(numbers[i], numbers[i + 1]) for i in range(0, len(numbers), 2)]

    @staticmethod
    def tuples_to_list(tuples):

        # Use list comprehension to flatten the list of tuples into a single list
        return [item for tup in tuples for item in tup]

    @staticmethod
    def get_longest_substring(s1, s2):

        seq_match = SequenceMatcher(None, s1, s2)

        match = seq_match.find_longest_match(0, len(s1), 0, len(s2))

        if match.size != 0:
            return s1[match.a: match.a + match.size]

        return ""

    @staticmethod
    def find_original_text_indexes(original_text_parts, domain_description):

        result = []
        for part in original_text_parts:
            part = part.lower().strip()

            last_result_index = 0
            append_only_first_occurence = False

            # Skip immediately to the previous detected original text as the next original text part should not be before the previous one
            # We cannot skip immediately to the index at result[-1] if there are more original texts found
            # for the previous original text part
            if result:
                last_result_index = result[1]
                append_only_first_occurence = True

            for i in range(last_result_index, len(domain_description)):

                # Append all occurencies of the `original_text_part` in the `domain_description`
                if domain_description[i:].startswith(part):
                    result.append(i)
                    result.append(i + len(part))

                    if append_only_first_occurence:
                        break

        is_everything_found = len(result) > 2
        return result, is_everything_found

    @staticmethod
    def find_substrings(original_text, domain_description):

        longest_substring = OriginalTextFinder.get_longest_substring(
            domain_description, original_text)

        if not longest_substring:
            return []

        if original_text.startswith(longest_substring):
            original_text_parts = [original_text[0:len(
                longest_substring)], original_text[len(longest_substring):]]
            result, is_everything_found = OriginalTextFinder.find_original_text_indexes(
                original_text_parts, domain_description)

            # Try to detect one typo by dividing original text into two parts and skipping the character at which it failed
            if not is_everything_found:
                original_text_parts = [original_text[0:len(
                    longest_substring)], original_text[len(longest_substring) + 1:]]
                result, is_everything_found = OriginalTextFinder.find_original_text_indexes(
                    original_text_parts, domain_description)

            return result

        if original_text.endswith(longest_substring):

            # Symmetrically do the same thing as before
            split = len(original_text) - len(longest_substring)
            original_text_parts = [
                original_text[:split], original_text[split:]]
            result, is_everything_found = OriginalTextFinder.find_original_text_indexes(
                original_text_parts, domain_description)

            if not is_everything_found:
                original_text_parts = [original_text[0:len(
                    longest_substring)], original_text[len(longest_substring) + 1:]]
                result, is_everything_found = OriginalTextFinder.find_original_text_indexes(
                    original_text_parts, domain_description)

            return result

        # Longest substring detected in the middle of the original text

        # Get start index and end index of the middle part of the original text
        for i in range(len(original_text)):
            if original_text[i:].startswith(longest_substring):
                start_index = i
                end_index = i + len(longest_substring)
                break

        original_text_parts = [original_text[:start_index], original_text[start_index: end_index], original_text[end_index:]]

        result, is_everything_found = OriginalTextFinder.find_original_text_indexes(original_text_parts, domain_description)

        return result

    @staticmethod
    def show_in_domain_description(original_text_indexes, domain_description):

        from termcolor import cprint

        start_at_index = 0

        for i in range(0, len(original_text_indexes), 2):
            original_text_index_start = original_text_indexes[i]
            original_text_index_end = original_text_indexes[i + 1]
            print(domain_description[start_at_index: original_text_index_start], end="")
            cprint(domain_description[original_text_index_start: original_text_index_end], "green", "on_black", end="")
            start_at_index = original_text_index_end

        print(domain_description[start_at_index:])
        print("\n\n")
