import json
import logging
import openai

from definitions.logging import LOGGER_NAME
from definitions.utility import DEFINED_DATA_TYPES, Field, UserChoice
from utils.convention_convertor import ConventionConvertor

PORT = 8080
LLM_BACKEND_URL = f"http://localhost:{PORT}/v1"

TEMPERATURE = 0
MODEL_ID = ""


class LLMManager:

    def __init__(self):

        self.client = openai.OpenAI(
            base_url=LLM_BACKEND_URL, api_key="sk-no-key-required")
        self.logger = logging.getLogger(LOGGER_NAME)

        self.item = ""
        self.new_lines_in_a_row = 0
        self.last_char = ""
        self.opened_curly_brackets_count = 0
        self.parsed_message = ""
        self.is_disable_json_nesting = True

        self.user_choice = ""
        self.messages = []
        self.source_class = ""
        self.target_class = ""
        self.field_name = ""

    def _reset(self, messages, user_choice="", source_class="", target_class="", field_name=""):

        self.user_choice = user_choice
        self.source_class = source_class.lower()
        self.messages = messages
        self.target_class = target_class.lower()
        self.field_name = field_name

        self.item = ""
        self.new_lines_in_a_row = 0
        self.last_char = ""
        self.opened_curly_brackets_count = 0
        self.parsed_message = ""

    def _log_full_message(self):

        self.logger.info(f"\nFull message: {self.parsed_message}")

    def _log_remove_item(self, completed_item):

        self.logger.info(f"Removing: {completed_item}")

    def process_character(self, char):

        if char == "{":
            if self.opened_curly_brackets_count == 1 and self.is_disable_json_nesting:
                self.item = ""
            else:
                self.opened_curly_brackets_count += 1

        if char == "\n" and self.last_char == "\n":
            self.new_lines_in_a_row += 1
        else:
            self.new_lines_in_a_row = 0

        # Return when LLM gets stuck in printing only new lines
        if self.new_lines_in_a_row > 3:
            self.logger.warning("Too many new lines")
            self._log_full_message()
            return True

        if self.opened_curly_brackets_count > 0:
            self.item += char

        if char == "}":
            self.opened_curly_brackets_count -= 1

        return False

    def generate_stream(self, messages, user_choice, source_class, target_class="", field_name=""):
        """
        Sends given messages to LLM and returns generator object containing all successfully parsed objects.
        :param messages list: messages to send to the LLM.
        :param user_choice UserChoice: what type of items should LLM generate.
        :param source_class string: name of the source class.
        :param target_class string: name of the target class.
        :param field_class string: name of the field to generate.
        :rtype: Generator[tuple[dict[str, bool]
        """

        self._reset(messages, user_choice, source_class,
                    target_class, field_name)

        output = self.client.chat.completions.create(
            messages=self.messages, model=MODEL_ID, stream=True, temperature=TEMPERATURE)

        # E.g.: "classNames": {[{ "name": "customer"}, {...}]}
        # To parse only the inner item {"name": "customer"}, we need to reset parsing when we encounter the "{" symbol
        self.is_disable_json_nesting = self.user_choice != UserChoice.SUMMARY_DESCRIPTIONS.value

        for text in output:

            if text.choices[0].delta.content is None:
                continue

            text = text.choices[0].delta.content
            self.parsed_message += text

            for char in text:

                is_return = self.process_character(char)

                if is_return:
                    return

                is_item_detected = self.opened_curly_brackets_count == 0 and self.item != ""
                if is_item_detected:
                    parsed_item_iterator = self._parse_item_streamed_output()

                    for completed_item, is_item_ok in parsed_item_iterator:

                        if is_item_ok:
                            yield completed_item
                        else:
                            self._log_remove_item(completed_item)

                    self.item = ""

                self.last_char = char

        # If the JSON object is not properly finished then insert the needed amount of closed curly brackets
        if self.opened_curly_brackets_count > 0:
            self.logger.info(
                f"JSON object is not properly finished: {self.item}")
            self.item += "}" * self.opened_curly_brackets_count

            parsed_item_iterator = self._parse_item_streamed_output()

            for completed_item, is_item_ok in parsed_item_iterator:

                if is_item_ok:
                    yield completed_item
                else:
                    self._log_remove_item(completed_item)

        self._log_full_message()
        return

    def _parse_attribute(self, item):

        is_item_ok = True

        item = self._parse_data_type(item)

        return item, is_item_ok
    
    def _parse_data_type(self, item):

        if not Field.DATA_TYPE.value in item:
            return item
        
        is_unknown_data_type = item[Field.DATA_TYPE.value] not in DEFINED_DATA_TYPES
        if is_unknown_data_type:
            self.logger.info("Converting unknown data type to string")
            item[Field.DATA_TYPE.value] = "string"
        
        return item

    def _parse_associations1(self, completed_item):

        is_item_ok = True

        if not Field.SOURCE_CLASS.value in completed_item or not completed_item[Field.SOURCE_CLASS.value]:
            completed_item[Field.NAME.value] = "Error: no source class"
            is_item_ok = False

        if not Field.TARGET_CLASS.value in completed_item or not completed_item[Field.TARGET_CLASS.value]:
            completed_item[Field.NAME.value] = "Error: no target class"
            is_item_ok = False

        if not is_item_ok:
            return completed_item, is_item_ok

        # Replace "s" for "z" to solve differences between British and American English
        # E.g.:
        # - input: motoriSed vehicle with S
        # - LLM output: motoriZed vehicle with Z
        source_class_generated = completed_item[Field.SOURCE_CLASS.value].lower(
        ).replace("s", "z")
        target_class_generated = completed_item[Field.TARGET_CLASS.value].lower(
        ).replace("s", "z")

        source_class_replaced = self.source_class.replace("s", "z")
        target_class_replaced = self.source_class.replace("s", "z")

        is_source_or_target_included = source_class_replaced == source_class_generated or target_class_replaced == target_class_generated
        is_none = (source_class_generated == "none") or (
            target_class_generated == "none")

        if not is_source_or_target_included or is_none:

            if not is_source_or_target_included:
                self.logger.info(
                    f"{self.source_class} != {source_class_generated} and {self.target_class} != {target_class_generated}")

            completed_item["name"] = "(Deleted: Inputed class is not source/target class) " + \
                completed_item["name"]
            is_item_ok = False

        return completed_item, is_item_ok

    def _parse_associations2(self, completed_item):

        is_item_ok = True

        if Field.SOURCE_CLASS.value in completed_item and Field.TARGET_CLASS.value in completed_item:
            source_class_generated = completed_item["source"].lower().replace(
                "s", "z")
            target_class_generated = completed_item["target"].lower().replace(
                "s", "z")

            source_class = self.source_class.lower().replace("s", "z")
            target_class = self.target_class.lower().replace("s", "z")

            is_match = (source_class == source_class_generated and target_class == target_class_generated) or (
                target_class == source_class_generated and source_class == target_class_generated)
            is_none = (source_class_generated == "none") or (
                target_class_generated == "none")

            if not is_match:
                self.logger.info(
                    f"Not matched:\n- given classes: {source_class}, {target_class}\n- generated classes: {source_class_generated}, {target_class_generated}\n")

            if not is_match or is_none:
                completed_item[
                    "name"] = f"Deleted: Inputed classes are not contained in source and target classes: {completed_item['name']}"
                is_item_ok = False

        return completed_item, is_item_ok

    def _check_summary_plain_text(self, completed_item):

        is_item_ok = "summary" in completed_item

        if not is_item_ok:
            self.logger.error("No summary in the item")

        return is_item_ok

    def _parse_single_field(self, item):

        is_item_ok = self.field_name in item

        if not is_item_ok:
            self.logger.error(f"No {self.field_name} in the item")

        # If we generated the field "name" then convert the name into a standard convention
        is_field_name = self.field_name == Field.NAME.value
        if is_field_name:
            item[Field.NAME.value] = ConventionConvertor.convert_string_to_standard_convention(item[Field.NAME.value])

        item = self._parse_data_type(item)

        return item, is_item_ok

    def _convert_names_into_standard_convention(self, completed_item):

        is_item_ok = True
        completed_item[Field.NAME.value] = ConventionConvertor.convert_string_to_standard_convention(
            completed_item[Field.NAME.value])

        if Field.SOURCE_CLASS.value in completed_item:
            completed_item[Field.SOURCE_CLASS.value] = ConventionConvertor.convert_string_to_standard_convention(
                completed_item[Field.SOURCE_CLASS.value])

        if Field.TARGET_CLASS.value in completed_item:
            completed_item[Field.TARGET_CLASS.value] = ConventionConvertor.convert_string_to_standard_convention(
                completed_item[Field.TARGET_CLASS.value])

        return completed_item, is_item_ok

    def _log_debug_info(self, completed_item):

        self.logger.info(f"Completed item: {completed_item['name']}")

        for key in completed_item:
            if key == "name":
                continue

            self.logger.info(f"- {key}: {completed_item[key]}")

        self.logger.info("\n")

    def _parse_item_streamed_output(self):
        """
        Yields a tuple containing parsed item and True if parsing of this item was successful otherwise False.
        """

        try:
            # Replace invalid JSON characters
            self.item = self.item.replace("\_", " ")
            self.item = self.item.replace("\n", " ")

            completed_item = json.loads(self.item)
            self.logger.warn(f"Checking: {completed_item}")

        except ValueError:
            self.logger.error(f"Cannot decode JSON: {self.item}\n")
            completed_item = {"name": f"Error: {self.item}"}
            yield completed_item, False
            return

        is_item_ok = True

        is_single_field_item = self.field_name != ""
        if is_single_field_item:
            completed_item, is_item_ok = self._parse_single_field(completed_item)
            yield completed_item, is_item_ok
            return

        if self.user_choice == UserChoice.SUMMARY_PLAIN_TEXT.value:
            is_item_ok = self._check_summary_plain_text(completed_item)
            yield completed_item, is_item_ok

        elif self.user_choice == UserChoice.SUMMARY_DESCRIPTIONS.value:
            yield completed_item, is_item_ok
            return

        if "name" not in completed_item or not completed_item["name"] or completed_item["name"] == "none":
            completed_item["name"] = "error: no name"
            is_item_ok = False
            yield completed_item, is_item_ok
            return

        completed_item, is_item_ok = self._convert_names_into_standard_convention(completed_item)

        if not is_item_ok:
            yield completed_item, is_item_ok
            return

        if self.user_choice == UserChoice.ATTRIBUTES.value:
            completed_item, is_item_ok = self._parse_attribute(completed_item)

        elif self.user_choice == UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value:
            completed_item, is_item_ok = self._parse_associations1(completed_item)

        elif self.user_choice == UserChoice.ASSOCIATIONS_TWO_KNOWN_CLASSES.value:
            completed_item, is_item_ok = self._parse_associations2(completed_item)

        self._log_debug_info(completed_item)

        yield completed_item, is_item_ok
