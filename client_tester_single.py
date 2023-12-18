from LLM_assistant import LLMAssistant, ITEMS_COUNT, ATTRIBUTES_STRING, RELATIONSHIPS_STRING, RELATIONSHIPS_STRING_TWO_ENTITIES, TAKE_ONLY_RELEVANT_INFO_FROM_DOMAIN_DESCRIPTION
import time


def main():

    # Define the model
    model_path_or_repo_id = "TheBloke/Llama-2-7B-Chat-GGUF"
    model_file = "llama-2-7b-chat.Q5_K_M.gguf"
    model_type = "llama"

    model_path_or_repo_id = "TheBloke/Starling-LM-7B-alpha-GGUF"
    model_file = "starling-lm-7b-alpha.Q5_K_M.gguf"
    model_type ="openchat"

    llm_assistant = LLMAssistant(model_path_or_repo_id=model_path_or_repo_id, model_file=model_file, model_type=model_type)

    #entities = ["vehicle", "student", "gpu", "employee", "earth", "zoo", "amusement park", "thing"]
    #entities = [("professor", "student")]
    #entities = ["course", "professor", "dormitory", "student"]
    entities = [("dormitory", "student")]
    user_choice = RELATIONSHIPS_STRING_TWO_ENTITIES

    for entity in entities:
        time_start = time.time()

        entity_1 = entity
        entity_2 = ""
        if user_choice == RELATIONSHIPS_STRING_TWO_ENTITIES:
            entity_1 = entity[0]
            entity_2 = entity[1]
        domain_description = "We know that courses have a name and a specific number of credits. Each course can have one or more professors, who have a name. Professors could participate in any number of courses. For a course to exist, it must aggregate, at least, five students, where each student has a name. Students can be enrolled in any number of courses. Finally, students can be accommodated in dormitories, where each dormitory can have from one to four students. Besides, each dormitory has a price."
        llm_assistant.suggest(entity_1, entity_2, user_choice, ITEMS_COUNT, conceptual_model=[], domain_description=domain_description)

        time_end = time.time()
        print(f"\nTime: {time_end - time_start:.2f} seconds")


if __name__ == "__main__":
    main()