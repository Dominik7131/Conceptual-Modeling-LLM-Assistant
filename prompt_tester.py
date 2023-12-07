# Input: entity, a (attributes) / r (relationships)
# Output: list of attributes or relationships for the given entity

from ctransformers import AutoModelForCausalLM
import json
import time

ITEMS_COUNT = 5
IS_SYSTEM_MSG = True
IS_CONCEPTUAL_MODEL_DEFINITION = False
ATTRIBUTES_STRING = "attributes"
RELATIONSHIPS_STRING = "relationships"

class LLMAssistant:
    def __init__(self, model_path_or_repo_id, model_file, model_type):
        self.messages = []
        self._are_default_messages_appended = False
        self.llm = AutoModelForCausalLM.from_pretrained(model_path_or_repo_id=model_path_or_repo_id, model_file=model_file, model_type=model_type, local_files_only=True,
                                                        gpu_layers=200, temperature=0.0, context_length=4096, max_new_tokens=4096,
                                                        batch_size=1024, threads=1)
        #print(f"Config: Context length: {str(llm.context_length)}, Temperature: {str(llm.config.temperature)}, Max new tokens: {str(llm.config.max_new_tokens)}")

    def append_default_messages(self, user_choice):        
        system = ""
        if user_choice == ATTRIBUTES_STRING:
            system = "\nYou are an expert at listing attributes for a given entity."
        elif user_choice == RELATIONSHIPS_STRING:
            #system = "\nYou are an expert at listing relationships for a given entity."
            #system = "\nYou are creating a conceptual model which consists of entities and their relationships. Each relationship is between exactly two entities, we will denote them as the source entity and the target entity. Both entities are represented as nouns in singular. Each relationship has a name which can be either a single verb or a verb and preposition such that when you insert this name in between the source entity and the target entity in this order a short meaningful sentence is created."
            system = "\nYou are creating a conceptual model which consists of entities and their relationships. Each relationship is between exactly two entities, we will denote them as the source entity and the target entity. Both entities are represented as nouns in singular. Each relationship has a name which is represented as single verb in singular such that when you insert this name in between the source entity and the target entity in this order a short meaningful sentence is created."

        if IS_SYSTEM_MSG:
            self.messages.append({"role": "system", "content": system})

        user_first_msg = "What is the definition of conceptual model in software engineering?"
        assistent_first_msg = "In software engineering, a conceptual model is a high-level representation of a system or problem domain that helps to organize and understand the key concepts, relationships, and constraints involved. It provides a framework for thinking about the problem space and can be used as a starting point for further analysis, design, and development. \
            A conceptual model typically includes: \
            Entities: The objects or concepts that are relevant to the problem domain. These may include users, systems, processes, data, etc. \
            Relationships: The connections between entities, such as associations, dependencies, or compositions. \
            Attributes: The characteristics or properties of entities and relationships."

        if IS_CONCEPTUAL_MODEL_DEFINITION:
            self.messages.append({"role": "user", "content": user_first_msg})
            self.messages.append({"role": "assistant", "content": assistent_first_msg})

        self._are_default_messages_appended = True
        return

    def parse_item(self, item, items, user_choice, is_provided_class_source, user_input_entity_name):
        try:
            completed_item = json.loads(item)
        except ValueError:
            print("Error: Cannot decode JSON: " + item)
            exit(1)

        if user_choice == ATTRIBUTES_STRING:
            print(f"{len(items) + 1}: {completed_item['name'].capitalize()}")
            print(f"- Description: {completed_item['description']}")
        elif user_choice == RELATIONSHIPS_STRING:

            if is_provided_class_source and completed_item['source'] != user_input_entity_name:
                print(f"Warning: source entity is: {completed_item['source']}")
            elif not is_provided_class_source and completed_item['target'] != user_input_entity_name:
                print(f"Warning: target entity is: {completed_item['target']}")

            print(f"{len(items) + 1}: {completed_item['name'].capitalize()}")
            #print(f"- Description: {completed_item['description']}")
            print(f"- Source: {completed_item['source']}")
            print(f"- Target: {completed_item['target']}")
            print()

        return completed_item

    def parse_streamed_output(self, prompt, user_choice, is_provided_class_source=True, user_input_entity_name=""):
        assistant_message = ""
        items = []
        item = ""
        is_item_start = False
        is_skip_parsing = False

        for text in self.llm(prompt, stream=True):
            assistant_message += text
            if is_skip_parsing:
                continue

            text = text.replace("'", "") # Edit apostrophes for now by deleting them
            for char in text:
                if char == "{":
                    is_item_start = True
                
                if is_item_start:
                    item += char
                
                if char == "}" and item != '':
                    is_item_start = False
                    completed_item = self.parse_item(item, items, user_choice, is_provided_class_source, user_input_entity_name)
                    items.append(completed_item)
                    item = ""
        
        if len(items) != ITEMS_COUNT:
            # Try to finish the object by appending the last curly bracket
            if is_item_start:
                item += '}'
                completed_item = self.parse_item(item, items, user_choice, is_provided_class_source, user_input_entity_name)
                items.append(completed_item)

            #print(f"\nFull message: {assistant_message}")
    
        if is_skip_parsing:
            print(f"\nFull message: {assistant_message}")
    
    def suggest_attributes(self, class_name, count_attributes_to_suggest, conceptual_model, domain_description):

        class_name = class_name.strip()
        if not self._are_default_messages_appended:
            self.append_default_messages(user_choice=ATTRIBUTES_STRING)

        prompt = 'What attributes does this entity have: \"' + class_name.strip() + '\"? Output exactly ' + str(count_attributes_to_suggest) + ' attributes with their description in JSON format like this: [{"name": first attribute name, "description": first attribute description}, {"name": second attribute name, "description": second attribute description}, {"name": third attribute name, "description": third attribute description}, ...]. Do not put quotation marks or escape character \ in the output fields. Do not output anything else.'
        
        new_messages = self.messages.copy()
        new_messages.append({"role": "user", "content": prompt})

        llama2_prompt = Utility.build_llama2_prompt(new_messages)
        print(f"Sending this prompt to llm:\n{llama2_prompt}\n")
        self.parse_streamed_output(llama2_prompt, user_choice=ATTRIBUTES_STRING)
        return


    def suggest_relationships(self, class_name, count_relationships_to_suggest, is_provided_class_source, conceptual_model, domain_description):

        class_name = class_name.strip()
        if not self._are_default_messages_appended:
            self.append_default_messages(user_choice=RELATIONSHIPS_STRING)

        if is_provided_class_source:
            #prompt = 'What relationships does this source entity have: \"' + class_name + '\"? Output exactly ' + str(count_relationships_to_suggest) + ' relationships with their description in JSON format like this: [{"name": first relationship name in form of a verb, "description": first relationship description, "source": "' + class_name + '", "target": first relationship target entity}, {"name": second relationship name in form of a verb, "description": second relationship description, "source": "' + class_name + '", "target": second relationship target entity}, ...]. Do not put quotation marks or escape character \ in the output fields. Do not output anything else.'
            #prompt = 'What relationships does this source entity have: \"' + class_name + '\"? Output exactly ' + str(count_relationships_to_suggest) + ' relationships with their description in JSON format like this: [{"name": first relationship name in form of a verb, "description": first relationship description, "source": "' + class_name + '", "target": first relationship target entity represented as noun in singular}, {"name": second relationship name in form of a verb, "description": second relationship description, "source": "' + class_name + '", "target": second relationship target entity represented as noun in singular}, ...]. Do not put quotation marks or escape character \ in the output fields. Do not output anything else.'
            prompt = 'What relationships does this source entity: "' + class_name + '" have? Output exactly ' + str(count_relationships_to_suggest) + ' relationships in JSON format like this: [{"name": first relationship name in form of a verb, "source": "' + class_name + '", "target": first relationship target entity represented as noun in singular}, {"name": second relationship name in form of a verb, "source": "' + class_name + '", "target": second relationship target entity represented as noun in singular}, ...]. Do not put quotation marks or escape character \ in the output fields. Do not output anything else.'


        else:
            #prompt = 'What relationships does this target entity have: \"' + class_name + '\"? Output exactly ' + str(count_relationships_to_suggest) + ' relationships with their description in JSON format like this: [{"name": first relationship name in form of a verb, "description": first relationship description, "source": "first relationship source entity", "target": "' + class_name + '"}, {"name": second relationship name in form of a verb, "description": second relationship description, "source": "second relationship source entity", "target": "' + class_name + '"}, ...]. Do not put quotation marks or escape character \ in the output fields. Do not output anything else.'
            prompt = 'What relationships does this target entity: \"' + class_name + '\" have? Output exactly ' + str(count_relationships_to_suggest) + ' relationships in JSON format like this: [{"name": first relationship name in form of a verb, "source": first relationship source entity, "target": "' + class_name + '"}, {"name": second relationship name in form of a verb, "source": second relationship source entity, "target": "' + class_name + '"}, ...]. Do not output anything else.'


        new_messages = self.messages.copy()
        new_messages.append({"role": "user", "content": prompt})

        llama2_prompt = Utility.build_llama2_prompt(new_messages)
        print(f"Sending this prompt to llm:\n{llama2_prompt}\n")
        self.parse_streamed_output(llama2_prompt, user_choice=RELATIONSHIPS_STRING, is_provided_class_source=is_provided_class_source, user_input_entity_name=class_name)
        return


class UserInputProcessor():
    def __init__(self):
        self.messages = []

    def handle_user_input(self):

        self.entity_name = input("Insert entity name: ").lower()
        print()
        user_message = self.entity_name

        if user_message.lower() == "exit" or user_message.lower() == "quit" or user_message.lower() == "q":
            return False
        
        self.user_choice = "r" #input("Input 'a' for attributes or 'r' for relationships: ").lower()

        if self.user_choice == "a":
            self.user_choice = ATTRIBUTES_STRING

        elif self.user_choice == "r":
            self.user_choice = RELATIONSHIPS_STRING
        else:
            raise ValueError(f"Error: User choice not supported: {self.user_choice}.")

        return True

def print_help_message():
    print("Options: \"q\" to exit, \"print\" to print the current conceptual model")


class Utility:
    def build_llama2_prompt(messages):
        startPrompt = "<s>[INST] "
        endPrompt = " [/INST]"
        conversation = []
        for index, message in enumerate(messages):
            if message["role"] == "system" and index == 0:
                conversation.append(f"<<SYS>>{message['content']}\n<</SYS>>\n\n")
            elif message["role"] == "user":
                conversation.append(message["content"].strip())
            else:
                conversation.append(f" [/INST] {message['content'].strip()} </s><s>[INST] ")

        return startPrompt + "".join(conversation) + endPrompt

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

        if user_input_processor.user_choice == ATTRIBUTES_STRING:
            llm_assistant.suggest_attributes(user_input_processor.entity_name, ITEMS_COUNT, conceptual_model=[], domain_description="")
        else:
            llm_assistant.suggest_relationships(user_input_processor.entity_name, ITEMS_COUNT, is_provided_class_source=True, conceptual_model=[], domain_description="")
        
        time_end = time.time()
        print(f"\nTime: {time_end - time_start:.2f} seconds")
        #break

if __name__ == "__main__":
    main()