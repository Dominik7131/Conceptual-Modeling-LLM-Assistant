from LLM_assistant import LLMAssistant, ITEMS_COUNT, TAKE_ONLY_RELEVANT_INFO_FROM_DOMAIN_DESCRIPTION
from text_utility import ATTRIBUTES_STRING, RELATIONSHIPS_STRING, RELATIONSHIPS_STRING_TWO_ENTITIES, PROPERTIES_STRING
import time
import json
from enum import Enum

IS_SHOW_RAW_ASSISTANT_MSG = True

class LLM_Feature(Enum):
    IS_SUGGESTION = 1
    IS_SUMMARY = 2
    IS_HIGHLIGHT = 3

LLM_FEATURE = LLM_Feature.IS_SUGGESTION


def main():

    llm_assistant = LLMAssistant()

    domain_description = "We know that courses have a name and a specific number of credits. Each course can have one or more professors, who have a name. Professors could participate in any number of courses. For a course to exist, it must aggregate, at least, five students, where each student has a name. Students can be enrolled in any number of courses. Finally, students can be accommodated in dormitories, where each dormitory can have from one to four students. Besides, each dormitory has a price."
    #entities = ["vehicle", "student", "gpu", "employee", "earth", "zoo", "amusement park", "thing"]
    #entities = [("professor", "student")]
    entities = ["course", "student"] #, "dormitory", "student"]
    #entities = [("dormitory", "student")]
    user_choice = ATTRIBUTES_STRING


    if LLM_FEATURE == LLM_Feature.IS_SUGGESTION:
        for entity in entities:
            time_start = time.time()

            entity_1 = entity
            entity_2 = ""
            if user_choice == RELATIONSHIPS_STRING_TWO_ENTITIES:
                entity_1 = entity[0]
                entity_2 = entity[1]
            items = llm_assistant.suggest(entity_1, entity_2, user_choice, ITEMS_COUNT, conceptual_model={}, domain_description=domain_description)

            time_end = time.time()
            print(f"\nTime: {time_end - time_start:.2f} seconds")

            if IS_SHOW_RAW_ASSISTANT_MSG:
                print(f"Raw assistant message: {llm_assistant.debug_info.assistant_message}\n")

    elif LLM_FEATURE == LLM_Feature.IS_SUMMARY:
        result = llm_assistant.summarize_conceptual_model(conceptual_model={})
        print(result)


if __name__ == "__main__":
    main()