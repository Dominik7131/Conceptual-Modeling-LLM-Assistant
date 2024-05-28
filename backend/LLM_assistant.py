import os
import time
import logging
import json
import sys

TEXT_FILTERING_DIRECTORY_NAME = "text-filtering"

sys.path.append("utils")
sys.path.append(os.path.join(TEXT_FILTERING_DIRECTORY_NAME, "syntactic"))
sys.path.append(os.path.join(TEXT_FILTERING_DIRECTORY_NAME, "semantic"))

from output_parser import OutputParser
from prompt_manager import PromptManager
from text_utility import CLASSES_BLACK_LIST, LOGGER_NAME, Field, TextFilteringVariation, TextUtility, UserChoice, DataType
from syntactic_text_filterer import SyntacticTextFilterer
from semantic_text_filterer import SemanticTextFilterer


ITEMS_COUNT = 5
IS_SYSTEM_MSG = True

# TODO: Try to setup the logger somewhere else
logger = logging.getLogger(LOGGER_NAME)

TIMESTAMP = time.strftime("%Y-%m-%d-%H-%M-%S")
LOG_DIRECTORY = "logs"
LOG_FILE_PATH = os.path.join(LOG_DIRECTORY, f"{TIMESTAMP}-log.txt")
logging.basicConfig(level=logging.INFO, format="%(message)s", filename=LOG_FILE_PATH, filemode='w')


class LLMAssistant:
    def __init__(self):   

        self.syntactic_text_filterer = SyntacticTextFilterer()
        self.semantic_text_filterer = SemanticTextFilterer()

        self.prompt_manager = PromptManager()
        
        self.debug_info = self.DebugInfo()


    class DebugInfo:
        def __init__(self):
            self.prompt = ""
            self.assistant_message = ""
            self.deleted_items = []


    def __append_default_messages(self, user_choice, is_domain_description=False):

        if IS_SYSTEM_MSG:
            system_prompt = self.prompt_manager.create_system_prompt(user_choice, is_domain_description)
        else:
            system_prompt = ""

        self.messages.append({"role": "system", "content": system_prompt})
        self._are_default_messages_appended = True
        return
    

    def __get_text_filterer(self, text_filtering_variation):

        if text_filtering_variation == TextFilteringVariation.SYNTACTIC.value:
            return self.syntactic_text_filterer
        
        elif text_filtering_variation == TextFilteringVariation.SEMANTIC.value:
            return self.semantic_text_filterer

        else:
            return None


    def get_relevant_texts(self, source_class, domain_description, filtering_variation):

        if filtering_variation == TextFilteringVariation.NONE.value:
            return domain_description

        text_filterer = self.__get_text_filterer(filtering_variation)
        relevant_texts = text_filterer.get(source_class, domain_description)

        result = ""
        for text in relevant_texts:
            result += f"{text}\n"
        
        relevant_texts = result.rstrip() # Remove trailing new line
        
        return relevant_texts
    

    def __log_sending_prompt_message(messages):

        logging.info(f"\nSending this prompt to llm:\n{messages}\n")
    

    def __process_suggested_item(self, user_choice, items_iterator, domain_description):

        if user_choice == UserChoice.CLASSES.value:
            suggested_classes = []

        for item in items_iterator:

            self.is_some_item_generated = True
            suggestion_dictionary = json.loads(json.dumps(item))

            if user_choice == UserChoice.CLASSES.value:
                if suggestion_dictionary["name"] in suggested_classes:
                    logging.info(f"Skipping duplicate class: {suggestion_dictionary['name']}")
                    continue

                if suggestion_dictionary["name"] in CLASSES_BLACK_LIST:
                    logging.info(f"Skipping black-listed class: {suggestion_dictionary['name']}")
                    continue

                suggested_classes.append(suggestion_dictionary["name"])

                if not Field.ORIGINAL_TEXT.value in suggestion_dictionary:
                    # Find occurencies of the class name in the domain description
                    item[Field.ORIGINAL_TEXT.value] = suggestion_dictionary["name"]

            # Find originalText indexes for `item["originalText"]` in `domain_description`
            if Field.ORIGINAL_TEXT.value in item:
                original_text = item[Field.ORIGINAL_TEXT.value]
                original_text_indexes, _, _ = TextUtility.find_text_in_domain_description(original_text, domain_description, user_choice)
                suggestion_dictionary[Field.ORIGINAL_TEXT_INDEXES.value] = original_text_indexes
            else:
                logging.warn(f"Warning: original text not in item: {item}")

            json_item = json.dumps(suggestion_dictionary)
            yield f"{json_item}\n"


    def suggest_items(self, source_class, target_class, user_choice, domain_description, text_filtering_variation=TextFilteringVariation.SYNTACTIC.value, count_items_to_suggest=5):

        source_class = source_class.strip()
        target_class = target_class.strip()

        is_domain_description = domain_description != ""

        self.messages = []
        self.__append_default_messages(user_choice=user_choice, is_domain_description=is_domain_description)        


        if user_choice != UserChoice.CLASSES.value:
            relevant_texts = self.get_relevant_texts(source_class=source_class, domain_description=domain_description, filtering_variation=text_filtering_variation)
        else:
            relevant_texts = domain_description

        is_no_relevant_text = is_domain_description and not relevant_texts
        if is_no_relevant_text:
            logging.warn("No relevant texts found.")
            return

        is_chain_of_thoughts = True

        # For generating classes it usually works better to disable chain of thoughts
        if user_choice == UserChoice.CLASSES.value:
            is_chain_of_thoughts = False    


        max_attempts_count = 2
        self.is_some_item_generated = False

        # Some LLMs sometimes stop too early
        # When this happens try to generate the output again with a little bit different prompt to force different outcome
        for attempt_number in range(max_attempts_count):

            prompt = self.prompt_manager.create_prompt(user_choice=user_choice, source_class=source_class, target_class=target_class,
                is_domain_description=is_domain_description, items_count_to_suggest=count_items_to_suggest, relevant_texts=relevant_texts,
                is_chain_of_thoughts=is_chain_of_thoughts)

            if attempt_number > 0:
                logging.info(f"Attempt: {attempt_number}")
                prompt = self.prompt_manager.remove_last_n_lines_from_prompt(prompt, attempt_number)
            
            new_messages = self.messages.copy()
            new_messages.append({"role": "user", "content": prompt})

            messages_prettified = TextUtility.messages_prettify(new_messages)
            self.__log_sending_prompt_message(messages_prettified)

            self.debug_info.prompt = messages_prettified

            output_parser = OutputParser()
            items_iterator = output_parser.parse_streamed_output(new_messages, user_choice=user_choice, source_class=source_class, target_class=target_class)
            yield self.__process_suggested_item(user_choice=user_choice, items_iterator=items_iterator, domain_description=domain_description)

            if self.is_some_item_generated:
                break


    def suggest_single_field(self, user_choice, name, source_class, target_class, domain_description, field_name, text_filtering_variation=TextFilteringVariation.SYNTACTIC.value):

        source_class = source_class.strip()
        target_class = target_class.strip()

        relevant_texts = self.get_relevant_texts(source_class=source_class, domain_description=domain_description, filtering_variation=text_filtering_variation)
        is_domain_description = domain_description != ""

        prompt = self.prompt_manager.create_prompt(user_choice=user_choice, source_class=source_class, target_class=target_class, 
            attribute_name=name, association_name=name, relevant_texts=relevant_texts, field_name=field_name, is_chain_of_thoughts=False, is_domain_description=is_domain_description)

        self.messages = []
        new_messages = self.messages.copy()
        new_messages.append({"role": "user", "content": prompt})
        messages_prettified = TextUtility.messages_prettify(new_messages)
        self.debug_info.prompt = messages_prettified

        self.__log_sending_prompt_message(messages_prettified)

        output_parser = OutputParser()
        items_iterator = output_parser.parse_streamed_output(new_messages, user_choice, source_class, field_name=field_name)

        for item in items_iterator:

            item_object = json.loads(json.dumps(item)) # Convert `item` of type string into JSON and then into python dictionary

            if field_name == Field.ORIGINAL_TEXT.value:
                original_text_indexes, _, _ = TextUtility.find_text_in_domain_description(item_object[Field.ORIGINAL_TEXT.value], domain_description, user_choice)
                item_object[Field.ORIGINAL_TEXT_INDEXES.value] = original_text_indexes
            
            json_item = json.dumps(item_object)
            return json_item


    def suggest_summary_plain_text(self, conceptual_model, domain_description):
        
        user_choice = UserChoice.SUMMARY_PLAIN_TEXT.value

        is_domain_description = domain_description != ""
        prompt = self.prompt_manager.create_prompt(user_choice=user_choice, conceptual_model=conceptual_model,
            relevant_texts=domain_description, is_chain_of_thoughts=False, is_domain_description=is_domain_description)

        self.messages = []
        new_messages = self.messages.copy()
        new_messages.append({"role": "user", "content": prompt})
        messages_prettified = TextUtility.messages_prettify(new_messages)
        self.debug_info.prompt = messages_prettified

        self.__log_sending_prompt_message(messages_prettified)

        output_parser = OutputParser()
        items_iterator = output_parser.parse_streamed_output(messages=new_messages, user_choice=user_choice, source_class="")

        for item in items_iterator:
            dictionary = json.loads(json.dumps(item))

            json_item = json.dumps(dictionary)
            return json_item


    def suggest_summary_descriptions(self, conceptual_model, domain_description):

        user_choice = UserChoice.SUMMARY_DESCRIPTIONS.value

        is_domain_description = domain_description != ""
        prompt = self.prompt_manager.create_prompt(user_choice=user_choice, conceptual_model=conceptual_model, 
            relevant_texts=domain_description, is_chain_of_thoughts=False, is_domain_description=is_domain_description)

        self.messages = []
        new_messages = self.messages.copy()
        new_messages.append({"role": "user", "content": prompt})
        messages_prettified = TextUtility.messages_prettify(new_messages)
        self.debug_info.prompt = messages_prettified

        self.__log_sending_prompt_message(messages_prettified)

        output_parser = OutputParser()
        items_iterator = output_parser.parse_streamed_output(messages=new_messages, user_choice=user_choice, source_class="")

        for item in items_iterator:
            dictionary = json.loads(json.dumps(item))

            json_item = json.dumps(dictionary)
            return json_item