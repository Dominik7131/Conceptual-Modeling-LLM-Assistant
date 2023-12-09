# Input: entity, a (attributes) / r (relationships)
# Output: list of attributes or relationships for the given entity

from ctransformers import AutoModelForCausalLM
import json
import time
import embeddings

ITEMS_COUNT = 5
IS_SYSTEM_MSG = True
IS_CONCEPTUAL_MODEL_DEFINITION = False
TAKE_ONLY_RELEVANT_INFO_FROM_DOMAIN_DESCRIPTION = True

ATTRIBUTES_STRING = "attributes"
RELATIONSHIPS_STRING = "relationships"
RELATIONSHIPS_STRING_TWO_ENTITIES = "relationships2"

class LLMAssistant:
    def __init__(self, model_path_or_repo_id, model_file, model_type):
        self.messages = []
        self._are_default_messages_appended = False
        self.llm = AutoModelForCausalLM.from_pretrained(model_path_or_repo_id=model_path_or_repo_id, model_file=model_file, model_type=model_type, local_files_only=True,
                                                        gpu_layers=200, temperature=0.0, context_length=4096, max_new_tokens=4096,
                                                        batch_size=1024, threads=1)
        #print(f"Config: Context length: {str(llm.context_length)}, Temperature: {str(llm.config.temperature)}, Max new tokens: {str(llm.config.max_new_tokens)}")

    def append_default_messages(self, user_choice, is_source_entity=True, is_domain_description=False):
        system = ""
        if user_choice == ATTRIBUTES_STRING:
            if not is_domain_description:
                system = "You are an expert at generating attributes for a given entity."
            else:
                #system = "You are creating a conceptual model which consists of entities, their attributes and relationships in between the entities. You will be given an entity, text and description of JSON format. Your task is to output attributes of the given entity solely based on the given text in the described JSON format. Be careful that some relationships can look like an attributes. Do not output any explanation. Do not ouput anything else."
                system = "You are an expert at extracting attributes for a given entity solely based on a given text in context of creating conceptual model in software engineering."

        elif user_choice == RELATIONSHIPS_STRING:
            #system = "You are an expert at listing relationships for a given entity."
            #system = "You are creating a conceptual model which consists of entities and their relationships. Each relationship is between exactly two entities, we will denote them as the source entity and the target entity. Both entities are represented as nouns in singular. Each relationship has a name which can be either a single verb or a verb and preposition such that when you insert this name in between the source entity and the target entity in this order a short meaningful sentence is created."
            #system = "You are creating a conceptual model which consists of entities and their relationships. Each relationship is between exactly two entities, we will denote them as the source entity and the target entity. Both entities are represented as nouns in singular. Each relationship has a name which is represented as single verb in singular such that when you insert this relationship name in between the source entity and the target entity in this order a short meaningful sentence is created."
            #if is_source_entity:
            system = "You are creating a conceptual model which consists of entities and their relationships. Each relationship is between exactly two entities, we will denote them as the source entity and the target entity. Both entities are represented as nouns in singular. Each relationship has a name such that when you insert it in between the source entity and the target entity in this order a short meaningful sentence is created. When you come up with a new relationship name always make sure that the described short meaningful sentence can be created."
            #else:
                #system = "You are creating a conceptual model which consists of entities and their relationships. Each relationship is between exactly two entities, we will denote them as the source entity and the target entity. Both entities are represented as nouns in singular. Each relationship has a name such that when you insert it in between the source entity and the target entity in this order a short meaningful sentence is created. You will be given a target entity and your goal is to come up with a source entity and a new relationship name. Always make sure that the described short meaningful sentence can be created."



        elif user_choice == RELATIONSHIPS_STRING_TWO_ENTITIES:
            system = "You are creating a conceptual model which consists of entities and their relationships. "
            system += "Each relationship is between exactly two entities, we will describe them as the source entity and the target entity. "
            system += "Each relationship has a name in a verb form such that when you insert this verb in between the source entity and the target entity in this order a short meaningful sentence is created. "
            system += "Always make sure that the short meaningful sentence indeed makes sense. Be very careful when creating the short meaningful sentence: the source entity must come first then follows the relationship name and then follows the target entity name which ends the sentence. Always check that this order holds."

        else:
            raise ValueError(f"Error: Unknown user choice: {user_choice}")
        
        system = '\n' + system

        if IS_SYSTEM_MSG:
            self.messages.append({"role": "system", "content": system})
        else:
            self.messages.append({"role": "system", "content": ""})

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
            if "description" in completed_item:
                print(f"- Description: {completed_item['description']}")

        elif user_choice == RELATIONSHIPS_STRING:
            if is_provided_class_source and completed_item['source'] != user_input_entity_name:
                print(f"Warning: source entity is: {completed_item['source']}")
            elif not is_provided_class_source and completed_item['target'] != user_input_entity_name:
                print(f"Warning: target entity is: {completed_item['target']}")

            print(f"{len(items) + 1}: {completed_item['name'].capitalize()}")

            if "description" in completed_item:
                print(f"- Description: {completed_item['description']}")

            print(f"- Source: {completed_item['source']}")
            print(f"- Target: {completed_item['target']}")

            if "sentence" in completed_item:
                print(f"- Sentence: {completed_item['sentence']}")
            print()
        
        elif user_choice == RELATIONSHIPS_STRING_TWO_ENTITIES:
            print(f"{len(items) + 1}: {completed_item['name'].capitalize()}")

            if "sentence" in completed_item: 
                print(f"- Sentence: {completed_item['sentence']}")
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
        
        print(f"\nFull message: {assistant_message}")
    

    def suggest_attributes(self, entity_name, count_attributes_to_suggest, conceptual_model, domain_description):

        entity_name = entity_name.strip()
        is_domain_description = domain_description != ""

        if not self._are_default_messages_appended:
            self.append_default_messages(user_choice=ATTRIBUTES_STRING, is_domain_description=is_domain_description)        

        if TAKE_ONLY_RELEVANT_INFO_FROM_DOMAIN_DESCRIPTION:
            e = embeddings.Embeddings()
            queries = [f"Info about {entity_name}"]
            domain_description = e.remove_unsimilar_text(queries, domain_description)

        if is_domain_description:
            prompt = f'Solely based on the following text which attributes does the entity: "{entity_name}" have? '
            prompt += f'Output only those attributes which you are certain about in JSON format like this: '
        else:
            prompt = f'What attributes does this entity: "{entity_name}" have? '
            prompt += f'Output exactly {str(count_attributes_to_suggest)} attributes in JSON format like this: '        


        times_to_repeat = count_attributes_to_suggest
        is_elipsis = False
        if is_domain_description:
            times_to_repeat = 2
            is_elipsis = True

        is_description = False
        if is_description:
            # With description
            prompt += JSONBuilder.build_attributes(attribute_names=["name", "description"], descriptions=["* attribute name", "* attribute description"], times_to_repeat=times_to_repeat, is_elipsis=is_elipsis)
        else:
            # Without description
            prompt += JSONBuilder.build_attributes(attribute_names=["name"], descriptions=["* attribute name"], times_to_repeat=times_to_repeat, is_elipsis=is_elipsis)

        if is_domain_description:
            prompt += f'. This is the following text: {domain_description}'
        else:
            prompt += '. Do not output anything else.'
        
        new_messages = self.messages.copy()
        new_messages.append({"role": "user", "content": prompt})

        llama2_prompt = Utility.build_llama2_prompt(new_messages)
        print(f"Sending this prompt to llm:\n{llama2_prompt}\n")
        self.parse_streamed_output(llama2_prompt, user_choice=ATTRIBUTES_STRING)
        return


    def suggest_relationships(self, entity_name, count_relationships_to_suggest, is_provided_entity_source, conceptual_model, domain_description):

        entity_name = entity_name.strip()
        if not self._are_default_messages_appended:
            self.append_default_messages(user_choice=RELATIONSHIPS_STRING, is_source_entity=is_provided_entity_source)
        
        entity_type = "source" if is_provided_entity_source else "target"
        prompt = f'Which relationships does this {entity_type} entity: "{entity_name}" have? Output exactly {str(count_relationships_to_suggest)} relationships in JSON format like this: '

        if is_provided_entity_source:
            #prompt = '[{"name": first relationship name in form of a verb, "description": first relationship description, "source": "' + entity_name + '", "target": first relationship target entity}, {"name": second relationship name in form of a verb, "description": second relationship description, "source": "' + entity_name + '", "target": second relationship target entity}, ...].'
            #prompt = '[{"name": first relationship name in form of a verb, "description": first relationship description, "source": "' + entity_name + '", "target": first relationship target entity represented as noun in singular}, {"name": second relationship name in form of a verb, "description": second relationship description, "source": "' + entity_name + '", "target": second relationship target entity represented as noun in singular}, ...].'
            prompt = '[{"name": first relationship name in form of a verb, "source": "' + entity_name + '", "target": first relationship target entity represented as noun in singular}, {"name": second relationship name in form of a verb, "source": "' + entity_name + '", "target": second relationship target entity represented as noun in singular}, ...].'


        else:
            #prompt = '[{"name": first relationship name in form of a verb, "description": first relationship description, "source": "first relationship source entity", "target": "' + entity_name + '"}, {"name": second relationship name in form of a verb, "description": second relationship description, "source": "second relationship source entity", "target": "' + entity_name + '"}, ...]. Do not put quotation marks or escape character \ in the output fields. Do not output anything else.'
            #prompt += '[{"name": first relationship name in form of a verb, "source": first relationship source entity, "target": "' + entity_name + '"}, {"name": second relationship name in form of a verb, "source": second relationship source entity, "target": "' + entity_name + '"}, ...]. '
            prompt += JSONBuilder.build_relationships(
                attribute_names=["name", "source", "target", "sentence"],
                descriptions=["* relationship name in form of a verb", "* relationship source entity", f"\"{entity_name}\"", "the short meaningful sentence for the * relationship"], times_to_repeat=count_relationships_to_suggest
                )
        
        prompt += '. Do not output anything else.'


        new_messages = self.messages.copy()
        new_messages.append({"role": "user", "content": prompt})

        llama2_prompt = Utility.build_llama2_prompt(new_messages)
        print(f"Sending this prompt to llm:\n{llama2_prompt}\n")
        self.parse_streamed_output(llama2_prompt, user_choice=RELATIONSHIPS_STRING, is_provided_class_source=is_provided_entity_source, user_input_entity_name=entity_name)
        return


    def suggest_relationships_between_two_classes(self, source_entity, target_entity, count_relationships_to_suggest, conceptual_model, domain_description):
        
        source_entity = source_entity.strip()
        target_entity = target_entity.strip()
        if not self._are_default_messages_appended:
            self.append_default_messages(user_choice=RELATIONSHIPS_STRING_TWO_ENTITIES)

        prompt = 'What relationships could be between source entity "' + source_entity + '" and target entity "' + target_entity + '"? '
        #prompt += 'Output exactly ' + str(count_relationships_to_suggest) + ' relationships in JSON format like this: [{"name": first relationship name where "' + source_entity + '" is the source entity and "' + target_entity + '" is the target entity, "sentence": short meaningful sentence where you put the first relationship name in between the source entity and the target entity in this order}, {"name": second relationship name where "' + source_entity + '" is the source entity and "' + target_entity + '" is the target entity, "sentence": short meaningful sentence where you put the first relationship name in between the source entity and the target entity in this order}, ...]. '
        #prompt += 'Output exactly ' + str(count_relationships_to_suggest) + ' relationships in JSON format like this: [{"name": first relationship name where "' + source_entity + '" is the source entity and "' + target_entity + '" is the target entity, "sentence": the short meaningful sentence for the first relationship}, {"name": second relationship name where "' + source_entity + '" is the source entity and "' + target_entity + '" is the target entity, "sentence": the short meaningful sentence for the first relationship}, ...]. '
        prompt += 'Output exactly ' + str(count_relationships_to_suggest) + ' relationships in JSON format like this: [{"name": first relationship name where "' + source_entity + '" is the source entity and "' + target_entity + '" is the target entity, "sentence": the short meaningful sentence for the first relationship where the source entity "' + source_entity + '" comes first then follows the relationship name and then follows the target entity "' + target_entity + '"}, {"name": second relationship name where "' + source_entity + '" is the source entity and "' + target_entity + '" is the target entity, "sentence": the short meaningful sentence for the first relationship where the source entity "' + source_entity + '" comes first then follows the relationship name and then follows the target entity "' + target_entity + '"}, ...]. '
        

        #prompt += 'Output exactly ' + str(count_relationships_to_suggest) + ' relationships in JSON format like this: [{"name": first relationship name where "' + source_entity + '" is the source entity and "' + target_entity + '" is the target entity}, {"name": second relationship name where "' + source_entity + '" is the source entity and "' + target_entity + '" is the target entity}, ...]. '

        prompt += 'Do not output anything else.'

        new_messages = self.messages.copy()
        new_messages.append({"role": "user", "content": prompt})

        llama2_prompt = Utility.build_llama2_prompt(new_messages)
        print(f"Sending this prompt to llm:\n{llama2_prompt}\n")
        self.parse_streamed_output(llama2_prompt, user_choice=RELATIONSHIPS_STRING_TWO_ENTITIES, user_input_entity_name=source_entity)

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
        
        self.user_choice = "a" #input("Input 'a' for attributes, 'r' for relationships, 'x' for relationships between two classes: ").lower()

        if self.user_choice == "a":
            self.user_choice = ATTRIBUTES_STRING

        elif self.user_choice == "r":
            self.user_choice = RELATIONSHIPS_STRING

        elif self.user_choice == "x":
            self.user_choice = RELATIONSHIPS_STRING_TWO_ENTITIES
            entities = self.entity_name.split(',')
            self.entity_name = entities[0]
            self.entity_name_2 = entities[1]
        else:
            raise ValueError(f"Error: Unknown user choice: {self.user_choice}.")

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


class JSONBuilder:

    def build_attributes(attribute_names, descriptions, times_to_repeat, is_elipsis=False):

        positions = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"]

        result = "["
        for i in range(times_to_repeat):
            result += '{'
            for j in range(len(attribute_names)):
                current_description = descriptions[j].replace('*', positions[i])
                result += '"' + attribute_names[j] + '": ' + current_description
                if j + 1 < len(attribute_names):
                    result += ', '
            result += '}'
            if i + 1 < times_to_repeat:
                result += ', '
        
        if is_elipsis:
            result += ", ..."
        result += "]"
        return result
    
    def build_relationships(attribute_names, descriptions, times_to_repeat):

        positions = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"]

        result = "["
        for i in range(times_to_repeat):
            result += '{'
            for j in range(len(attribute_names)):
                current_description = descriptions[j].replace('*', positions[i])
                result += '"' + attribute_names[j] + '": ' + current_description
                if j + 1 < len(attribute_names):
                    result += ', '
            result += '}'
            if i + 1 < times_to_repeat:
                result += ', '
        
        result += "]"
        return result


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

        if user_input_processor.user_choice == ATTRIBUTES_STRING:
            llm_assistant.suggest_attributes(user_input_processor.entity_name, ITEMS_COUNT, conceptual_model=[], domain_description=domain_description)
        elif user_input_processor.user_choice == RELATIONSHIPS_STRING:
            llm_assistant.suggest_relationships(user_input_processor.entity_name, ITEMS_COUNT, is_provided_entity_source=False, conceptual_model=[], domain_description="")
        elif user_input_processor.user_choice == RELATIONSHIPS_STRING_TWO_ENTITIES:
            llm_assistant.suggest_relationships_between_two_classes(user_input_processor.entity_name, user_input_processor.entity_name_2, ITEMS_COUNT, conceptual_model=[], domain_description="")

        
        time_end = time.time()
        print(f"\nTime: {time_end - time_start:.2f} seconds")
        #break

if __name__ == "__main__":
    main()