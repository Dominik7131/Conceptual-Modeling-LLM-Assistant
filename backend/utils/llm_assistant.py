import os
import logging
import json
import sys


TEXT_FILTERING_DIRECTORY_NAME = "text-filtering"

sys.path.append("utils")
sys.path.append(os.path.join(TEXT_FILTERING_DIRECTORY_NAME, "syntactic"))
sys.path.append(os.path.join(TEXT_FILTERING_DIRECTORY_NAME, "semantic"))

from original_text_finder import OriginalTextFinder
from definitions.logging import LOG_DIRECTORY, LOG_FILE_PATH, LOGGER_NAME
from text_utility import TextUtility
from definitions.utility import CLASSES_BLACK_LIST, Field, TextFilteringVariation, UserChoice
from llm_manager import LLMManager
from prompt_manager import PromptManager
from syntactic_text_filterer import SyntacticTextFilterer
from semantic_text_filterer import SemanticTextFilterer


ITEMS_COUNT = 5
IS_SYSTEM_MSG = True


class LLMAssistant:

    def __init__(self):

        self._setup_logging()

        self.syntactic_text_filterer = SyntacticTextFilterer()
        self.semantic_text_filterer = SemanticTextFilterer()

        self.prompt_manager = PromptManager()
        self.output_generator = LLMManager()

        self.messages = []
        self.suggested_classes = []
        self.is_some_item_generated = False

    def _setup_logging(self):

        if not os.path.exists(LOG_DIRECTORY):
            os.makedirs(LOG_DIRECTORY)

        logging.basicConfig(
            level=logging.DEBUG, format="%(message)s", filename=LOG_FILE_PATH, filemode="w")
        self.logger = logging.getLogger(LOGGER_NAME)

    def _append_default_messages(self, user_choice, is_domain_description=False):

        if IS_SYSTEM_MSG:
            system_prompt = self.prompt_manager.create_system_prompt(
                user_choice, is_domain_description)
        else:
            system_prompt = ""

        self.messages.append({"role": "system", "content": system_prompt})

    def _get_text_filterer(self, text_filtering_variation):

        if text_filtering_variation == TextFilteringVariation.SYNTACTIC.value:
            return self.syntactic_text_filterer

        if text_filtering_variation == TextFilteringVariation.SEMANTIC.value:
            return self.semantic_text_filterer

        return None

    def get_relevant_texts(self, source_class, domain_description, filtering_variation):

        if filtering_variation == TextFilteringVariation.NONE.value:
            return domain_description

        text_filterer = self._get_text_filterer(filtering_variation)
        relevant_texts = text_filterer.get(source_class, domain_description)

        result = ""
        for text in relevant_texts:
            result += f"{text}\n"

        relevant_texts = result.rstrip()  # Remove trailing new line

        return relevant_texts

    def _log_sending_prompt_message(self, messages):

        self.logger.info(f"\nSending this prompt to llm:\n{messages}\n")

    def _empty_generator(self):

        if False:
            yield

    def _get_original_text_indexes(self, item, user_choice, domain_description):

        original_text_indexes = []

        if Field.ORIGINAL_TEXT.value in item:
            original_text = item[Field.ORIGINAL_TEXT.value]
            original_text_indexes, _, _ = OriginalTextFinder.find_in_domain_description(
                original_text=original_text, user_choice=user_choice, domain_description=domain_description)

        else:
            self.logger.warn(f"Original text not in item: {item}")

        return original_text_indexes

    def process_item(self, item, user_choice, domain_description):

        suggestion_dictionary = json.loads(json.dumps(item))

        if user_choice == UserChoice.CLASSES.value:

            if suggestion_dictionary["name"] in self.suggested_classes:
                self.logger.info(
                    f"Skipping duplicate class: {suggestion_dictionary['name']}")
                return True

            if suggestion_dictionary["name"] in CLASSES_BLACK_LIST:
                self.logger.info(
                    f"Skipping black-listed class: {suggestion_dictionary['name']}")
                return True

            self.suggested_classes.append(suggestion_dictionary["name"])

            if not Field.ORIGINAL_TEXT.value in suggestion_dictionary:
                # Find occurencies of the class name in the domain description
                item[Field.ORIGINAL_TEXT.value] = suggestion_dictionary["name"]

        original_text_indexes = self._get_original_text_indexes(
            item=item, user_choice=user_choice, domain_description=domain_description)
        suggestion_dictionary[Field.ORIGINAL_TEXT_INDEXES.value] = original_text_indexes

        json_item = json.dumps(suggestion_dictionary)
        return json_item, False

    def _get_output(self, user_choice, source_class, target_class, is_domain_description, domain_description, relevant_texts, is_chain_of_thoughts, items_count_to_suggest):

        max_attempts_count = 2

        # Some LLMs sometimes stop too early
        # When this happens try to generate the output again with a little bit different prompt to force different output
        for attempt_number in range(max_attempts_count):

            prompt = self.prompt_manager.create_prompt(user_choice=user_choice, source_class=source_class, target_class=target_class,
                                                       is_domain_description=is_domain_description, items_count_to_suggest=items_count_to_suggest, relevant_texts=relevant_texts,
                                                       is_chain_of_thoughts=is_chain_of_thoughts)

            if attempt_number > 0:
                self.logger.info(f"Attempt: {attempt_number}")
                prompt = self.prompt_manager.remove_last_n_lines_from_prompt(
                    prompt, attempt_number)

            new_messages = self.messages.copy()
            new_messages.append({"role": "user", "content": prompt})

            messages_prettified = TextUtility.prettify_messages(new_messages)
            self._log_sending_prompt_message(messages_prettified)

            items_iterator = self.output_generator.generate_stream(
                messages=new_messages, user_choice=user_choice, source_class=source_class, target_class=target_class)

            if user_choice == UserChoice.CLASSES.value:
                self.suggested_classes = []

            for item in items_iterator:

                self.is_some_item_generated = True
                json_item, is_continue = self.process_item(
                    item=item, user_choice=user_choice, domain_description=domain_description)

                if is_continue:
                    continue

                yield f"{json_item}\n"

            if self.is_some_item_generated:
                break

        self.logger.info("Returning empty generator")
        return self._empty_generator()

    def suggest_items(self, source_class, target_class, user_choice, domain_description, text_filtering_variation=TextFilteringVariation.SYNTACTIC.value, items_count_to_suggest=5):

        source_class = source_class.strip()
        target_class = target_class.strip()

        is_domain_description = domain_description != ""

        self.messages = []
        self._append_default_messages(
            user_choice=user_choice, is_domain_description=is_domain_description)

        if user_choice != UserChoice.CLASSES.value:
            relevant_texts = self.get_relevant_texts(
                source_class=source_class, domain_description=domain_description, filtering_variation=text_filtering_variation)
        else:
            relevant_texts = domain_description

        is_no_relevant_text = is_domain_description and not relevant_texts
        if is_no_relevant_text:
            self.logger.warn("No relevant texts found.")
            return self._empty_generator()

        is_chain_of_thoughts = True

        # For generating classes it usually works better to disable chain of thoughts
        if user_choice == UserChoice.CLASSES.value:
            is_chain_of_thoughts = False

        self.is_some_item_generated = False

        return self._get_output(user_choice, source_class, target_class, is_domain_description, domain_description, relevant_texts, is_chain_of_thoughts, items_count_to_suggest)

    def suggest_single_field(self, user_choice, name, source_class, target_class, domain_description, field_name, text_filtering_variation=TextFilteringVariation.SYNTACTIC.value):

        source_class = source_class.strip()
        target_class = target_class.strip()

        relevant_texts = self.get_relevant_texts(
            source_class=source_class, domain_description=domain_description, filtering_variation=text_filtering_variation)
        is_domain_description = domain_description != ""

        prompt = self.prompt_manager.create_prompt(user_choice=user_choice, source_class=source_class, target_class=target_class,
                                                   attribute_name=name, association_name=name, relevant_texts=relevant_texts, field_name=field_name, is_chain_of_thoughts=False, is_domain_description=is_domain_description)

        self.messages = []
        new_messages = self.messages.copy()
        new_messages.append({"role": "user", "content": prompt})
        messages_prettified = TextUtility.prettify_messages(new_messages)

        self._log_sending_prompt_message(messages_prettified)

        items_iterator = self.output_generator.generate_stream(
            messages=new_messages, user_choice=user_choice, source_class=source_class, field_name=field_name)

        for item in items_iterator:

            # Convert `item` of type string into JSON and then into python dictionary
            item_object = json.loads(json.dumps(item))

            original_text_indexes = self._get_original_text_indexes(
                item=item, user_choice=user_choice, domain_description=domain_description)
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
        messages_prettified = TextUtility.prettify_messages(new_messages)

        self._log_sending_prompt_message(messages_prettified)

        items_iterator = self.output_generator.generate_stream(
            messages=new_messages, user_choice=user_choice, source_class="")

        for item in items_iterator:

            json_item = json.dumps(item)
            return json_item

        return self._empty_generator()

    def suggest_summary_descriptions(self, conceptual_model, domain_description):

        user_choice = UserChoice.SUMMARY_DESCRIPTIONS.value

        is_domain_description = domain_description != ""
        prompt = self.prompt_manager.create_prompt(user_choice=user_choice, conceptual_model=conceptual_model,
                                                   relevant_texts=domain_description, is_chain_of_thoughts=False, is_domain_description=is_domain_description)

        self.messages = []
        new_messages = self.messages.copy()
        new_messages.append({"role": "user", "content": prompt})
        messages_prettified = TextUtility.prettify_messages(new_messages)

        self._log_sending_prompt_message(messages_prettified)

        items_iterator = self.output_generator.generate_stream(
            messages=new_messages, user_choice=user_choice, source_class="")

        for item in items_iterator:

            json_item = json.dumps(item)
            return json_item
