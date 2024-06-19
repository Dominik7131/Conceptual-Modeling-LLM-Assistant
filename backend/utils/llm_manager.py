import json
import logging
import openai

from definitions.logging import LOGGER_NAME, LOGGING_LEVEL
from definitions.utility import DEFINED_DATA_TYPES, Field, UserChoice
from utils.convention_convertor import ConventionConvertor

PORT = 8080
LLM_BACKEND_URL = f"http://localhost:{PORT}/v1"

TEMPERATURE = 0
MODEL_ID = ""


class LLMManager:

    def __init__(self):

        self.client = openai.OpenAI(base_url=LLM_BACKEND_URL, api_key="sk-no-key-required")
        self.logger = logging.getLogger(LOGGER_NAME)
        self.logger.setLevel(LOGGING_LEVEL)

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
        self.conceptual_model = {}

    def _reset(self, messages, user_choice="", source_class="", target_class="", field_name="", conceptual_model=None):

        self.user_choice = user_choice
        self.source_class = source_class.lower()
        self.messages = messages
        self.target_class = target_class.lower()
        self.field_name = field_name

        if conceptual_model == None:
            conceptual_model = {}

        self.conceptual_model = conceptual_model

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

    def generate_stream(self, messages, user_choice, source_class, target_class="", field_name="", conceptual_model=None):
        """
        Sends given messages to LLM and returns generator object containing all successfully parsed objects.
        :param messages list: messages to send to the LLM.
        :param user_choice UserChoice: what type of items should LLM generate.
        :param source_class string: name of the source class.
        :param target_class string: name of the target class.
        :param field_class string: name of the field to generate.
        :param conceptual_model dictionary: user's conceptual model.
        :rtype: Generator[tuple[dict[str, bool]
        """

        self._reset(messages, user_choice, source_class, target_class, field_name, conceptual_model)

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
    
    def _parse_classes(self, item):

        if self._does_class_already_exist(item):
            return item, False

        return item, True

    def _parse_attribute(self, item):

        if self._does_attribute_already_exist(item):
            return item, False

        item = self._parse_data_type(item)

        return item, True
    
    def _parse_data_type(self, item):

        if not Field.DATA_TYPE.value in item:
            return item
        
        is_unknown_data_type = item[Field.DATA_TYPE.value] not in DEFINED_DATA_TYPES
        if is_unknown_data_type:
            self.logger.info("Converting unknown data type to string")
            item[Field.DATA_TYPE.value] = "string"
        
        return item

    def _parse_associations1(self, completed_item):

        is_no_source_class = not Field.SOURCE_CLASS.value in completed_item or not completed_item[Field.SOURCE_CLASS.value]
        if is_no_source_class:
            self.logger.info(f"No source class: {completed_item}")
            return completed_item, False

        is_no_target_class = not Field.TARGET_CLASS.value in completed_item or not completed_item[Field.TARGET_CLASS.value]
        if is_no_target_class:
            self.logger.info(f"No target class: {completed_item}")
            return completed_item, False

        # Replace "s" for "z" to solve differences between British and American English
        # E.g.:
        # - input: motoriSed vehicle with S
        # - LLM output: motoriZed vehicle with Z
        source_class_generated = completed_item[Field.SOURCE_CLASS.value].lower().replace("s", "z")
        target_class_generated = completed_item[Field.TARGET_CLASS.value].lower().replace("s", "z")

        source_class_replaced = self.source_class.replace("s", "z")
        target_class_replaced = self.source_class.replace("s", "z")

        is_source_or_target_included = source_class_replaced == source_class_generated or target_class_replaced == target_class_generated
        is_none = (source_class_generated == "none") or (
            target_class_generated == "none")

        if not is_source_or_target_included or is_none:

            if not is_source_or_target_included:
                self.logger.info(
                    f"{self.source_class} != {source_class_generated} and {self.target_class} != {target_class_generated}")

            self.logger.info(f"Inputed class is not source or target class: {completed_item}")
            return completed_item, False

        if self._does_association_already_exist(completed_item):
            return completed_item, False

        return completed_item, True

    def _parse_associations2(self, completed_item):

        if self._does_association_already_exist(completed_item):
            return completed_item, False

        is_item_ok = True

        if Field.SOURCE_CLASS.value in completed_item and Field.TARGET_CLASS.value in completed_item:
            source_class_generated = completed_item["source"].lower().replace("s", "z")
            target_class_generated = completed_item["target"].lower().replace("s", "z")

            source_class = self.source_class.lower().replace("s", "z")
            target_class = self.target_class.lower().replace("s", "z")

            is_match = (source_class == source_class_generated and target_class == target_class_generated) or (
                target_class == source_class_generated and source_class == target_class_generated)
            is_none = (source_class_generated == "none") or (target_class_generated == "none")

            if not is_match:
                self.logger.info(
                    f"Not matched:\n- given classes: {source_class}, {target_class}\n- generated classes: {source_class_generated}, {target_class_generated}\n")

            if not is_match or is_none:
                completed_item[Field.NAME.value] = f"Deleted: Inputed classes are not contained in source and target classes: {completed_item['name']}"
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
    
    def _does_class_already_exist(self, completed_item):

        if UserChoice.CLASSES.value not in self.conceptual_model:
            return False
        
        classes = self.conceptual_model[UserChoice.CLASSES.value]

        for clss in classes:

            is_class_present = completed_item[Field.NAME.value] == clss["title"].lower()
            if is_class_present:
                self.logger.info(f"Class is already present: {completed_item}")
                return True
        
        return False
    
    def _does_attribute_already_exist(self, completed_item):

        if UserChoice.ATTRIBUTES.value not in self.conceptual_model:
            return False
        
        attributes = self.conceptual_model[UserChoice.ATTRIBUTES.value]

        for attribute in attributes:

            is_name_same = completed_item[Field.NAME.value] == attribute["iri"].replace("-", " ")
            is_source_class_same = self.source_class == attribute["domain"].replace("-", " ")

            is_attribute_present = is_name_same and is_source_class_same
            if is_attribute_present:
                self.logger.info(f"Attribute is already present: {completed_item}")
                return True
        
        return False

    def _does_association_already_exist(self, completed_item):

        associations_string = "relationships"
        if associations_string not in self.conceptual_model:
            return False
        
        associations = self.conceptual_model[associations_string]

        for association in associations:

            is_name_same = completed_item[Field.NAME.value] == association[Field.IRI.value].replace("-", " ")
            domain_association = association[Field.DOMAIN.value].replace("-", " ")
            range_association = association[Field.RANGE.value].replace("-", " ")

            is_source_class_same = self.source_class == domain_association
            is_target_class_same = self.target_class == range_association

            is_target_class_not_specified = self.target_class == ""
            if is_target_class_not_specified:
                is_source_class_same = is_source_class_same or self.source_class == range_association
                is_target_class_same = True

            is_association_present = is_name_same and is_source_class_same and is_target_class_same
            if is_association_present:
                self.logger.info(f"Association is already present: {completed_item}")
                return True
        
        return False

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

        self.logger.debug(f"Completed item: {completed_item['name']}")

        for key in completed_item:
            if key == Field.NAME.value:
                continue

            self.logger.debug(f"- {key}: {completed_item[key]}")

        self.logger.debug("\n")

    def _parse_item_streamed_output(self):
        """
        Yields a tuple containing parsed item and True if parsing of this item was successful otherwise False.
        """

        try:
            # Replace invalid JSON characters
            self.item = self.item.replace("\_", " ")
            self.item = self.item.replace("\n", " ")

            completed_item = json.loads(self.item)

        except ValueError:
            self.logger.error(f"Cannot decode JSON: {self.item}\n")
            completed_item = {Field.NAME.value: f"Error: {self.item}"}
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

        if Field.NAME.value not in completed_item or not completed_item[Field.NAME.value] or completed_item[Field.NAME.value] == "none":
            self.logger.info(f"No name: {completed_item}")
            is_item_ok = False
            yield completed_item, is_item_ok
            return

        completed_item, is_item_ok = self._convert_names_into_standard_convention(completed_item)

        if not is_item_ok:
            yield completed_item, is_item_ok
            return
        
        if self.user_choice == UserChoice.CLASSES.value:
            completed_item, is_item_ok = self._parse_classes(completed_item)

        if self.user_choice == UserChoice.ATTRIBUTES.value:
            completed_item, is_item_ok = self._parse_attribute(completed_item)

        elif self.user_choice == UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value:
            completed_item, is_item_ok = self._parse_associations1(completed_item)

        elif self.user_choice == UserChoice.ASSOCIATIONS_TWO_KNOWN_CLASSES.value:
            completed_item, is_item_ok = self._parse_associations2(completed_item)

        self._log_debug_info(completed_item)

        yield completed_item, is_item_ok
