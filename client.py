from LLM_assistant import LLMAssistant, ITEMS_COUNT
from user_input_processor import UserInputProcessor
import time


def main():
    
    # Define the model
    model_path_or_repo_id = "TheBloke/Llama-2-7B-Chat-GGUF"
    model_file = "llama-2-7b-chat.Q5_K_M.gguf"
    model_type = "llama"

    llm_assistant = LLMAssistant(model_path_or_repo_id=model_path_or_repo_id, model_file=model_file, model_type=model_type)
    
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