import string


class ConventionConvertor:

    @staticmethod
    def is_camel_case(text):

        if not text:
            return False

        if " " in text:
            return False

        if text.isspace():
            return False

        return True

    @staticmethod
    def from_snake_case_to_standard_convention(text):

        result = ""
        name_parts = text.split("_")

        for name_part in name_parts:
            result += name_part + " "

        result = result.rstrip()  # Remove trailing space
        return result

    @staticmethod
    def from_camel_case_to_standard_convention(text):

        result = ""

        for index, char in enumerate(text):
            if index == 0:
                result += char
                continue

            is_add_space = char.isupper() or char.isdigit()
            if is_add_space:
                result += " "
                # If the next word is all in uppercase then make one space and skip it
                # E.g. indexURL -> index URL
                if (index + 1 < len(text) and text[index + 1].isupper()):
                    result += text[index:]
                    break

                result += char.lower()

            else:
                result += char

        return result

    @staticmethod
    def convert_string_to_standard_convention(text):
        """
        Convert text from any convention to a lowercased text in standard convention
        where each word is delimited with a space

        :param text: text to be converted into standard convention
        :type text: str

        :return: lowercased text in standard convention
        :rtype: str
        """

        if not text:
            return ""

        # Convert fully uppercase text into lower case
        is_all_uppercase = all((char.isupper() or char in string.punctuation) for char in text)
        if is_all_uppercase:
            text = text.lower()

        is_snake_case = text[0].islower() and "_" in text
        if is_snake_case:
            result = ConventionConvertor.from_snake_case_to_standard_convention(text)
            return result.lower()

        if ConventionConvertor.is_camel_case(text):
            result = ConventionConvertor.from_camel_case_to_standard_convention(text)
            return result.lower()

        return text.lower()
