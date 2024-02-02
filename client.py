from LLM_assistant import LLMAssistant, ITEMS_COUNT
from user_input_processor import UserInputProcessor
import time
import json


def main():

    llm_assistant = LLMAssistant()
    
    user_input_processor = UserInputProcessor()

    while True:
        is_continue = user_input_processor.handle_user_input()
        if not is_continue:
            break

        time_start = time.time()

        domain_description = "We know that courses have a name and a specific number of credits. Each course can have one or more professors, who have a name. Professors could participate in any number of courses. For a course to exist, it must aggregate, at least, five students, where each student has a name. Students can be enrolled in any number of courses. Finally, students can be accommodated in dormitories, where each dormitory can have from one to four students. Besides, each dormitory has a price."
        llm_assistant.suggest(user_input_processor.entity_name, user_input_processor.entity_name_2, user_input_processor.user_choice, ITEMS_COUNT, conceptual_model=[], domain_description=domain_description)
        
        time_end = time.time()
        print(f"\nTime: {time_end - time_start:.2f} seconds")
        #break

if __name__ == "__main__":
    main()