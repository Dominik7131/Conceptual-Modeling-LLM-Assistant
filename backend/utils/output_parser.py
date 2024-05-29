import json
import logging
import openai

from backend.definitions.utility import DEFINED_DATA_TYPES, LOGGER_NAME, Field, UserChoice
from convention_convertor import ConventionConvertor


LLM_BACKEND_URL = "http://localhost:8080/v1"

TEMPERATURE = 0
MODEL_ID = ""


class OutputParser:

    def __init__(self, user_choice, source_class, target_class="", field_name=""):
        self.client = openai.OpenAI(base_url=LLM_BACKEND_URL, api_key="sk-no-key-required")

        self.logger = logging.getLogger(LOGGER_NAME)

        self.user_choice = user_choice
        self.source_class = source_class.lower()
        self.target_class = target_class.lower()
        self.field_name = field_name

        self.debug_info = self.DebugInfo()

        self.item = ""
        self.new_lines_in_a_row = 0
        self.last_char = ""
        self.opened_curly_brackets_count = 0


    class DebugInfo:
        def __init__(self):
            self.parsed_message = ""
            self.deleted_items = [] 


    def process_parsed_item(self, iterator):

        for completed_item, is_item_ok in iterator:
            if is_item_ok:
                yield completed_item
            else:
                self.debug_info.deleted_items.append(completed_item)
    

    def process_character(self, char):

        if char == "{":
            if self.opened_curly_brackets_count == 1 and self.is_disable_JSON_nesting:
                self.item = ""
            else:
                self.opened_curly_brackets_count += 1

        if char == "\n" and self.last_char == "\n":
            self.new_lines_in_a_row += 1
        else:
            self.new_lines_in_a_row = 0

        
        # Return when LLM gets stuck in printing only new lines
        if self.new_lines_in_a_row > 3:
            logging.warning("Too many new lines")
            return False
        
        if self.opened_curly_brackets_count > 0:
            self.item += char
        
        if char == "}":
            self.opened_curly_brackets_count -= 1


        is_item_detected = self.opened_curly_brackets_count == 0 and self.item != ""
        if is_item_detected:
            parsed_item_iterator = self.__parse_item_streamed_output(self.item)
            yield self.process_parsed_item(parsed_item_iterator)

            self.item = ""

        self.last_char = char
        return True
    

    def __log_full_message(self):

        self.logger.info(f"\nFull message: {self.debug_info.parsed_message}")



    def parse_streamed_output(self, messages):

        output = self.client.chat.completions.create(messages=messages, model=MODEL_ID, stream=True, temperature=TEMPERATURE)

        # E.g.: "classNames": {[{ "name": "customer"}, {...}]}
        # To parse only the inner item {"name": "customer"}, we need to reset parsing when we encounter the "{" symbol
        self.is_disable_JSON_nesting = self.user_choice != UserChoice.SUMMARY_DESCRIPTIONS.value

        for text in output:

            if text.choices[0].delta.content is None:
                continue

            text = text.choices[0].delta.content

            self.debug_info.parsed_message += text

            for char in text:
                is_continue = self.process_character(char)

                if not is_continue:
                    self.__log_full_message()
                    return
            

        # If the JSON object is not properly finished then insert the needed amount of closed curly brackets
        if self.opened_curly_brackets_count > 0:
            self.logger.info(f"JSON object is not properly finished: {self.item}")
            self.item += "}" * self.opened_curly_brackets_count

            parsed_item_iterator = self.__parse_item_streamed_output(self.item)
            yield self.process_parsed_item(parsed_item_iterator)


        self.__log_full_message()
        return


    def __parse_attribute(self, completed_item):

        is_item_ok = True

        if Field.DATA_TYPE.value in completed_item:

            is_unknown_data_type = not completed_item[Field.DATA_TYPE.value] in DEFINED_DATA_TYPES
            if is_unknown_data_type:
                self.logger.info(f"Converting unknown data type to string")
                completed_item[Field.DATA_TYPE.value] = "string"
        
        return completed_item, is_item_ok


    def __parse_associations1(self, completed_item):

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
        source_class_generated = completed_item[Field.SOURCE_CLASS.value].lower().replace("s", "z")
        target_class_generated = completed_item[Field.TARGET_CLASS.value].lower().replace("s", "z")

        source_class_replaced = self.source_class.replace("s", "z")
        target_class_replaced = self.source_class.replace("s", "z")

        is_source_or_target_included = source_class_replaced == source_class_generated or target_class_replaced == target_class_generated
        is_none = (source_class_generated == "none") or (target_class_generated == "none")
        
        if not is_source_or_target_included or is_none:

            if not is_source_or_target_included:
                self.logger.info(f"{self.source_class} != {source_class_generated} and {self.target_class} != {target_class_generated}")

            completed_item["name"] = "(Deleted: Inputed class is not source/target class) " + completed_item["name"]
            is_item_ok = False
        
        return completed_item, is_item_ok


    def __parse_associations2(self, completed_item):

        is_item_ok = True
        if Field.SOURCE_CLASS.value in completed_item and Field.TARGET_CLASS.value in completed_item:                
            source_class_generated = completed_item["source"].lower().replace("s", "z")
            target_class_generated = completed_item["target"].lower().replace("s", "z")

            source_class = source_class.lower().replace("s", "z")
            target_class = target_class.lower().replace("s", "z")

            is_match = (source_class == source_class_generated and target_class == target_class_generated) or (target_class == source_class_generated and source_class == target_class_generated)
            is_none = (source_class_generated == "none") or (target_class_generated == "none")

            if not is_match:
                self.logger.info(f"Not matched:\n- given classes: {source_class}, {target_class}\n- generated classes: {source_class_generated}, {target_class_generated}\n")

            if not is_match or is_none:
                completed_item["name"] = f"Deleted: Inputed classes are not contained in source and target classes: {completed_item['name']}"
                is_item_ok = False
        
        return completed_item, is_item_ok
    

    def __parse_summary_plain_text(self, completed_item):

        is_item_ok = "summary" in completed_item

        if not is_item_ok:
            self.logger.error("No summary in the item")

        return completed_item, is_item_ok


    def __parse_single_field(self, completed_item):

        is_item_ok = self.field_name in completed_item

        if not is_item_ok:
            self.logger.error(f"No {self.field_name} in the item")

        return completed_item, is_item_ok


    def __convert_names_into_standard_convention(completed_item):

        is_item_ok = True
        completed_item[Field.NAME.value] = ConventionConvertor.convert_string_to_standard_convention(completed_item[Field.NAME.value])

        if Field.SOURCE_CLASS.value in completed_item:
            completed_item[Field.SOURCE_CLASS.value] = ConventionConvertor.convert_string_to_standard_convention(completed_item[Field.SOURCE_CLASS.value])

        if Field.TARGET_CLASS.value in completed_item:
            completed_item[Field.TARGET_CLASS.value] = ConventionConvertor.convert_string_to_standard_convention(completed_item[Field.TARGET_CLASS.value])
        
        return completed_item, is_item_ok


    def __log_debug_info(self, completed_item):

        self.logger.info(f"Completed item: {completed_item['name']}")

        for key in completed_item:
            if key == "name":
                continue

            self.logger.info(f"- {key}: {completed_item[key]}")

        self.logger.info("\n")


    def __parse_item_streamed_output(self):
        # Returns (parsed_item, is_item_ok)
        # is_item_ok: False if there is any issue while parsing otherwise True

        try:
            # Replace invalid JSON characters
            self.item = self.item.replace("\_", " ")
            self.item = self.item.replace("\n", " ")

            completed_item = json.loads(self.item)

        except ValueError:
            self.logger.error(f"Cannot decode JSON: {self.item}\n")
            completed_item = { "name": f"Error: {self.item}"}
            yield completed_item, False
            return
        
        is_item_ok = True

        is_single_field_item = self.field_name != ""
        if is_single_field_item:
            return self.__parse_single_field(completed_item)

        if self.user_choice == UserChoice.SUMMARY_PLAIN_TEXT.value:
            return self.__parse_summary_plain_text(completed_item)

        elif self.user_choice == UserChoice.SUMMARY_DESCRIPTIONS.value:
            return completed_item, is_item_ok
            

        if "name" not in completed_item or not completed_item["name"] or completed_item["name"] == "none":
            completed_item["name"] = "error: no name"
            is_item_ok = False
            return completed_item, is_item_ok

        completed_item, is_item_ok = self.__convert_names_into_standard_convention(completed_item)

        if not is_item_ok:
            return completed_item, is_item_ok


        if self.user_choice == UserChoice.ATTRIBUTES.value:
            completed_item, is_item_ok = self.__parse_attribute(completed_item)

        elif self.user_choice == UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value:
            completed_item, is_item_ok = self.__parse_associations1(completed_item)

        elif self.user_choice == UserChoice.ASSOCIATIONS_TWO_KNOWN_CLASSES.value:
            completed_item, is_item_ok = self.__parse_associations2(completed_item)


        self.__log_debug_info(completed_item)

        yield completed_item, is_item_ok