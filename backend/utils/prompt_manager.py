import json
import os

from definitions.prompt_techniques import SELECTED_PROMPT_TECHNIQUES
from definitions.prompt_symbols import PromptSymbols
from utils.replacer import Replacer


PROMPT_DIRECTORY = os.path.join("..", "prompts")
SYSTEM_PROMPT_DIRECTORY = os.path.join(PROMPT_DIRECTORY, "system")


class PromptManager:

    def __init__(self):
        pass

    def create_system_prompt(self, user_choice, is_domain_description):

        prompt_file_name = f"{user_choice}"

        if is_domain_description:
            prompt_file_name += "-dd"
        prompt_file_name += ".txt"

        prompt_file_path = os.path.join(
            SYSTEM_PROMPT_DIRECTORY, prompt_file_name)

        with open(prompt_file_path, "r", encoding="utf-8") as file:
            system_prompt = file.read()

        return system_prompt

    def create_prompt(self, user_choice, source_class="", target_class="", relevant_texts="", is_domain_description=True,
                      items_count_to_suggest=5, conceptual_model=None, field_name="",
                      attribute_name="", association_name="", description="", original_text="", summary_plain_text_style=""):

        original_prompt = self.get_prompt(
            user_choice=user_choice, field_name=field_name, is_domain_description=is_domain_description,
            summary_plain_text_style=summary_plain_text_style)

        if conceptual_model is None:
            conceptual_model = {}

        replacements = {
            PromptSymbols.SOURCE_CLASS.value: source_class,
            PromptSymbols.TARGET_CLASS.value: target_class,
            PromptSymbols.DOMAIN_DESCRIPTION.value: relevant_texts,
            PromptSymbols.ITEMS_COUNT_TO_SUGGEST.value: str(items_count_to_suggest),
            PromptSymbols.CONCEPTUAL_MODEL.value: json.dumps(conceptual_model),
            PromptSymbols.ATTRIBUTE_NAME.value: attribute_name,
            PromptSymbols.ASSOCIATION_NAME.value: association_name,
            PromptSymbols.DESCRIPTION.value: description,
            PromptSymbols.ORIGINAL_TEXT.value: original_text,
            PromptSymbols.SUMMARY_STYLE.value: summary_plain_text_style,
        }

        # Substitute all the special symbols in the given prompt
        prompt = Replacer.replace(original_prompt, replacements)

        return prompt

    def get_prompt(self, user_choice, field_name="", is_domain_description=True, summary_plain_text_style=""):

        is_generate_domain_elements = field_name == "" and user_choice in SELECTED_PROMPT_TECHNIQUES
        if is_generate_domain_elements and is_domain_description:
            prompt_file_name = SELECTED_PROMPT_TECHNIQUES[user_choice]
        else:
            prompt_file_name = "baseline"

        if field_name != "":
            prompt_file_name += f"-{field_name}"

        if is_domain_description:
            prompt_file_name += "-dd"

        if summary_plain_text_style != "":
            prompt_file_name += "-style"

        prompt_file_name += ".txt"

        if prompt_file_name[0] == "-":
            prompt_file_name = prompt_file_name[1:]

        prompt_file_path = os.path.join(PROMPT_DIRECTORY, user_choice, prompt_file_name)

        with open(prompt_file_path, "r", encoding="utf-8") as file:
            prompt = file.read()

        return prompt

    def remove_last_n_lines_from_prompt(self, prompt, lines_to_remove):

        for i in range(lines_to_remove):
            last_new_line_index = prompt.rfind("\n")

            if last_new_line_index == -1:
                return prompt

            if i + 1 == lines_to_remove:
                return prompt[:last_new_line_index]

            prompt = prompt[:last_new_line_index]

        return prompt
