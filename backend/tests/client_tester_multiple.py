import sys
sys.path.append('.')
from LLM_assistant import LLMAssistant, ITEMS_COUNT, TAKE_ONLY_RELEVANT_INFO_FROM_DOMAIN_DESCRIPTION
from text_utility import TextUtility, UserChoice
import time
import os
import json

IS_SAVE_TO_FILE = True
IS_SHOW_RAW_ASSISTANT_MSG = False

def main():

    llm_assistant = LLMAssistant()

    entities = {
        UserChoice.ATTRIBUTES.value: ["course", "professor"],
        UserChoice.RELATIONSHIPS.value: [],
        UserChoice.RELATIONSHIPS2.value: []
        }


    domain_descriptions = ["We know that courses have a name and a specific number of credits. Each course can have one or more professors, who have a name. Professors could participate in any number of courses. For a course to exist, it must aggregate, at least, five students, where each student has a name. Students can be enrolled in any number of courses. Finally, students can be accommodated in dormitories, where each dormitory can have from one to four students. Besides, each dormitory has a price."]
    user_choices = [UserChoice.ATTRIBUTES.value, UserChoice.RELATIONSHIPS.value, UserChoice.RELATIONSHIPS2.value]

    file_name = os.path.join("output", f"{time.strftime('%Y-%m-%d-%H-%M-%S')}.txt")

    if (IS_SAVE_TO_FILE):
        with open(file_name, 'w') as file:
            # TODO: write into the `file` all config from config.json
            #file.write(f"LLM file: {model_path}\nTake only relevant info from domain description: {str(TAKE_ONLY_RELEVANT_INFO_FROM_DOMAIN_DESCRIPTION)}\n\n")
            pass

    time_start = time.time()

    for user_choice in user_choices:
        for domain_description in domain_descriptions:
            for entity in entities[user_choice]:

                entity_1 = entity
                entity_2 = ""
                if user_choice == UserChoice.RELATIONSHIPS2.value:
                    entity_1 = entity[0]
                    entity_2 = entity[1]

                items = llm_assistant.suggest(entity_1, entity_2, user_choice, ITEMS_COUNT, conceptual_model=[], domain_description=domain_description)
                
                if (IS_SAVE_TO_FILE):
                    with open(file_name, 'a') as file:
                        file.write(f"Prompt: {llm_assistant.debug_info.prompt}\n\n")
                        file.write(f"Assistant message: {llm_assistant.debug_info.assistant_message}\n\n")

                        item_index = 0

                        for item in items:
                            parsed_item = TextUtility.json_to_pretty_text(item, item_index, user_choice, UserChoice.ATTRIBUTES.value)
                            item_index += 1
                            file.write(parsed_item + '\n')
                        
                        for item in llm_assistant.debug_info.deleted_items:
                            parsed_item = TextUtility.json_to_pretty_text(item, item_index, user_choice, UserChoice.ATTRIBUTES.value)
                            item_index += 1
                            file.write(parsed_item + '\n')
                        
                        file.write("\n\n")

    time_end = time.time()
    print(f"\nTime: {time_end - time_start:.2f} seconds")

if __name__ == "__main__":
    main()