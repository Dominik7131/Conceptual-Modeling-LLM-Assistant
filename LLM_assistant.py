# Input: entity, a (attributes) / r (relationships)
# Output: list of attributes or relationships for the given entity

from ctransformers import AutoModelForCausalLM
import json
import time
from embeddings import Embeddings

ITEMS_COUNT = 5
IS_SYSTEM_MSG = True
IS_CONCEPTUAL_MODEL_DEFINITION = False
IS_IGNORE_DOMAIN_DESCRIPTION = False
TAKE_ONLY_RELEVANT_INFO_FROM_DOMAIN_DESCRIPTION = True

ATTRIBUTES_STRING = "attributes"
RELATIONSHIPS_STRING = "relationships"
RELATIONSHIPS_STRING_TWO_ENTITIES = "relationships2"

class LLMAssistant:
    def __init__(self, model_path_or_repo_id, model_file, model_type):
        self.llm = AutoModelForCausalLM.from_pretrained(model_path_or_repo_id=model_path_or_repo_id, model_file=model_file, model_type=model_type, local_files_only=True,
                                                        gpu_layers=200, temperature=0.0, context_length=4096, max_new_tokens=4096,
                                                        batch_size=1024, threads=1)
        #print(f"Config: Context length: {str(self.llm.context_length)}, Temperature: {str(self.llm.config.temperature)}, Max new tokens: {str(self.llm.config.max_new_tokens)}")

        if TAKE_ONLY_RELEVANT_INFO_FROM_DOMAIN_DESCRIPTION:
            self.embeddings = Embeddings()

    def append_default_messages(self, user_choice, is_domain_description=False):
        system = ""
        if user_choice == ATTRIBUTES_STRING:
            if not is_domain_description:
                system = "You are an expert at generating attributes for a given entity."
            else:
                #system = "You are creating a conceptual model which consists of entities, their attributes and relationships in between the entities. You will be given an entity, text and description of JSON format. Your task is to output attributes of the given entity solely based on the given text in the described JSON format. Be careful that some relationships can look like an attributes. Do not output any explanation. Do not ouput anything else."
                system = "You are an expert at extracting attributes for a given entity solely based on a given text in context of creating conceptual model in software engineering."

        elif user_choice == RELATIONSHIPS_STRING:
            if not is_domain_description:
                #system = "You are an expert at listing relationships for a given entity."
                #system = "You are creating a conceptual model which consists of entities and their relationships. Each relationship is between exactly two entities, we will denote them as the source entity and the target entity. Both entities are represented as nouns in singular. Each relationship has a name which can be either a single verb or a verb and preposition such that when you insert this name in between the source entity and the target entity in this order a short meaningful sentence is created."
                #system = "You are creating a conceptual model which consists of entities and their relationships. Each relationship is between exactly two entities, we will denote them as the source entity and the target entity. Both entities are represented as nouns in singular. Each relationship has a name which is represented as single verb in singular such that when you insert this relationship name in between the source entity and the target entity in this order a short meaningful sentence is created."
                #if is_source_entity:
                system = "You are an expert at creating a conceptual model which consists of entities and their relationships. Each relationship is between exactly two entities, we will denote them as the source entity and the target entity. Both entities are represented as nouns in singular. Each relationship has a name such that when you insert it in between the source entity and the target entity in this order a short meaningful sentence is created. When you come up with a new relationship name always make sure that the described short meaningful sentence can be created."
                #else:
                    #system = "You are creating a conceptual model which consists of entities and their relationships. Each relationship is between exactly two entities, we will denote them as the source entity and the target entity. Both entities are represented as nouns in singular. Each relationship has a name such that when you insert it in between the source entity and the target entity in this order a short meaningful sentence is created. You will be given a target entity and your goal is to come up with a source entity and a new relationship name. Always make sure that the described short meaningful sentence can be created."
            else:
                #system = "You are an expert at extracting relationships for a given entity solely based on a given text in context of creating conceptual model in software engineering."
                #system = "You are creating a conceptual model which consists of entities and their relationships. "
                #system += "Each relationship is between exactly two entities, we will describe them as the source entity and the target entity. "
                #system += "Each relationship has a name in a verb form such that when you insert this verb in between the source entity and the target entity in this order a short meaningful sentence is created. "
                #system += "Always make sure that the short meaningful sentence indeed makes sense. Be very careful when creating the short meaningful sentence: the source entity must come first then follows the relationship name and then follows the target entity name which ends the sentence. Always check that this order holds."

                system = "You are an expert creating a conceptual model which consists of entities and their relationships. Each relationship is between exactly two entities, we will denote them as the source entity and the target entity. Both entities are represented as nouns in singular. Each relationship has a name such that when you insert it in between the source entity and the target entity in this order a short meaningful sentence is created. When you come up with a new relationship name and a new target entity always make sure that the described short meaningful sentence can be created."

                #system += " You will be given a source entity and your goal is to solely based on the given text to find a relationships between this source entity and some new target entity."



        elif user_choice == RELATIONSHIPS_STRING_TWO_ENTITIES:
            system = "You are an expert at creating a conceptual model which consists of entities and their relationships. "
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
            completed_item = {"name": "Error: " + item} # For debugging return this as a valid item
            return completed_item

        if user_choice == ATTRIBUTES_STRING:
            print(f"{len(items) + 1}: {completed_item['name'].capitalize()}")
            if "description" in completed_item:
                print(f"- Description: {completed_item['description']}")

        elif user_choice == RELATIONSHIPS_STRING:
            #if is_provided_class_source and completed_item['source'] != user_input_entity_name:
            #    print(f"Warning: source entity is: {completed_item['source']}")
            #elif not is_provided_class_source and completed_item['target'] != user_input_entity_name:
            #    print(f"Warning: target entity is: {completed_item['target']}")

            if user_input_entity_name != completed_item['source'] and user_input_entity_name != completed_item['target']:
                self.end_parsing_prematurely = True
                return completed_item

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
        new_lines_in_a_row = 0
        last_char = ''
        self.end_parsing_prematurely = False

        for text in self.llm(prompt, stream=True):
            assistant_message += text
            if is_skip_parsing:
                continue

            text = text.replace("'", "") # Edit apostrophes for now by deleting them
            for char in text:
                if char == '{':
                    is_item_start = True

                if char == '\n' and last_char == '\n':
                    new_lines_in_a_row += 1
                else:
                    new_lines_in_a_row = 0
                
                # We already got the last object of the JSON output
                # If something weird starts happening with the LLM this premature return might be the cause
                if char == ']':
                    return items
                
                # Return when LLM gets stuck in printing only new lines
                if new_lines_in_a_row > 3:
                    print("Warning: too many new lines")
                    return items
                
                if is_item_start:
                    item += char
                
                if char == "}" and item != '':
                    is_item_start = False
                    completed_item = self.parse_item(item, items, user_choice, is_provided_class_source, user_input_entity_name)

                    if self.end_parsing_prematurely:
                        print(f"Ending parsing prematurely: {completed_item}")
                        return items
                        
                    items.append(completed_item)
                    item = ""
                
                last_char = char
        
        if len(items) != ITEMS_COUNT:
            # LLM sometimes does not properly finish the JSON object
            # So try to finish the object by appending the last curly bracket
            if is_item_start:
                item += '}'
                completed_item = self.parse_item(item, items, user_choice, is_provided_class_source, user_input_entity_name)
                items.append(completed_item)

            #print(f"\nFull message: {assistant_message}")
    
        if is_skip_parsing:
            print(f"\nFull message: {assistant_message}")
        
        print(f"\nFull message: {assistant_message}")
        return items
    

    def suggest(self, entity_name, entity_name_2, user_choice, count_items_to_suggest, conceptual_model, domain_description):

        entity_name = entity_name.strip()

        if IS_IGNORE_DOMAIN_DESCRIPTION:
            domain_description = ""

        is_domain_description = domain_description != ""

        self.messages = []
        self.append_default_messages(user_choice=user_choice, is_domain_description=is_domain_description)        

        if TAKE_ONLY_RELEVANT_INFO_FROM_DOMAIN_DESCRIPTION:
            queries = [f"Info about {entity_name}"]
            domain_description = self.embeddings.remove_unsimilar_text(queries, domain_description)

        times_to_repeat = count_items_to_suggest
        is_elipsis = False
        if is_domain_description:
            times_to_repeat = 2
            is_elipsis = True


        if user_choice == ATTRIBUTES_STRING:

            if not is_domain_description:
                prompt = f'What attributes does this entity: "{entity_name}" have? '
                prompt += f'Output exactly {str(count_items_to_suggest)} attributes in JSON format like this: '  
            
            else:
                prompt = f'Solely based on the following text which attributes does the entity: "{entity_name}" have? '
                #prompt = f'Solely based on the text in triple quotation marks which attributes does the entity: "{entity_name}" have? '

                #prompt += "If you find an attribute which looks more like a relationship then it is not an attribute. "
                prompt += f'Output only those attributes which you are certain about in JSON format like this: '

            is_description = False
            if is_description:
                prompt += JSONBuilder.build(names=["name", "description"], descriptions=["* attribute name", "* attribute description"], times_to_repeat=times_to_repeat, is_elipsis=is_elipsis)
            else:
                prompt += JSONBuilder.build(names=["name"], descriptions=["* attribute name"], times_to_repeat=times_to_repeat, is_elipsis=is_elipsis)
        
        elif user_choice == RELATIONSHIPS_STRING:

            if not is_domain_description:
                prompt = f'Which relationships does the source entity: "{entity_name}" have? Output exactly {str(count_items_to_suggest)} relationships in JSON format like this: '

            else:
                prompt = f'Solely based on the following text which relationships does this entity: "{entity_name}" have? '
                #prompt += f'Always make sure that the entity: "{entity_name}" is the source entity in all the relationships. '
                #prompt += f'Output only those relationships which you are certain about in JSON format like this: '
                prompt += f'Output it in JSON format like this: '
            
            names = ["name", "source", "target"]
            if True: #not is_domain_description:
                names.append("sentence")

            prompt += JSONBuilder.build(
                names=names,
                descriptions=["* relationship name in form of a verb", f'"{entity_name}"', f"* relationship target entity", "the short meaningful sentence for the * relationship"], times_to_repeat=times_to_repeat, is_elipsis=is_elipsis)
                #descriptions=["relationship name in form of a verb", f'"{entity_name}"', f"relationship target entity", "the short meaningful sentence for the relationship"], times_to_repeat=times_to_repeat, is_elipsis=is_elipsis)
    
        

        elif user_choice == RELATIONSHIPS_STRING_TWO_ENTITIES:
            if not is_domain_description:
                prompt = 'What relationships are between source entity "' + entity_name + '" and target entity "' + entity_name_2 + '"? '
                #prompt += 'Output exactly ' + str(count_items_to_suggest) + ' relationships in JSON format like this: [{"name": first relationship name where "' + source_entity + '" is the source entity and "' + target_entity + '" is the target entity, "sentence": short meaningful sentence where you put the first relationship name in between the source entity and the target entity in this order}, {"name": second relationship name where "' + source_entity + '" is the source entity and "' + target_entity + '" is the target entity, "sentence": short meaningful sentence where you put the first relationship name in between the source entity and the target entity in this order}, ...]. '
                #prompt += 'Output exactly ' + str(count_items_to_suggest) + ' relationships in JSON format like this: [{"name": first relationship name where "' + source_entity + '" is the source entity and "' + target_entity + '" is the target entity, "sentence": the short meaningful sentence for the first relationship}, {"name": second relationship name where "' + source_entity + '" is the source entity and "' + target_entity + '" is the target entity, "sentence": the short meaningful sentence for the first relationship}, ...]. '
                prompt += 'Output exactly ' + str(count_items_to_suggest) + ' relationships in JSON format like this: '

            else:
                prompt = f'Solely based on the following text which relationships are between the entity "{entity_name}" and the entity "{entity_name_2}"? '
                prompt += f'Output only those relationships which you are certain about in JSON format like this: '

            prompt += JSONBuilder.build(names=["name", "source", "target", "sentence"], descriptions=[f'* relationship name where "{entity_name}" is the source entity and "{entity_name_2}" is the target entity', f'"{entity_name}"', f'"{entity_name_2}"', f'the short meaningful sentence for the first relationship where the source entity "{entity_name}" comes first then follows the relationship name and then follows the target entity "{entity_name_2}"'], times_to_repeat=times_to_repeat, is_elipsis=is_elipsis)
        
        else:
            raise ValueError(f"Error: Undefined user choice: {user_choice}")
        
        if is_domain_description:
            prompt += f". This is the following text: {domain_description}"
            #prompt += f'. And provide detailed explanation. This is the following text: {domain_description}'
            #prompt += f'. And provide detailed explanation. \n """{domain_description}"""'
        
        new_messages = self.messages.copy()
        new_messages.append({"role": "user", "content": prompt})

        llama2_prompt = Utility.build_llama2_prompt(new_messages)
        print(f"Sending this prompt to llm:\n{llama2_prompt}\n")
        items = self.parse_streamed_output(llama2_prompt, user_choice=user_choice, user_input_entity_name=entity_name)
        items.insert(0, {"prompt": llama2_prompt}) # For testing prepend the prompt
        return items


class UserInputProcessor():
    def __init__(self):
        self.messages = []
        self.entity_name = ""
        self.entity_name_2 = ""

    def handle_user_input(self):
        self.entity_name = input("Insert entity name: ").lower()
        print()
        user_message = self.entity_name

        if user_message.lower() == "exit" or user_message.lower() == "quit" or user_message.lower() == "q":
            return False
        
        self.user_choice = input("Input 'a' for attributes, 'r' for relationships, 'x' for relationships between two classes: ").lower()

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

    def build(names, descriptions, times_to_repeat, is_elipsis=False):

        positions = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"]

        result = "["
        for i in range(times_to_repeat):
            result += '{'
            for j in range(len(names)):
                current_description = descriptions[j].replace('*', positions[i])
                result += '"' + names[j] + '": ' + current_description
                if j + 1 < len(names):
                    result += ', '
            result += '}'
            if i + 1 < times_to_repeat:
                result += ', '
        
        if is_elipsis:
            result += ", ..."
        result += "]"
        return result
    

    def build2(names, descriptions, times_to_repeat, is_elipsis=False):
        # like `build` but as an example show first JSON object, elipsis, last JSON object
        positions = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"]

        result = "["
        for i in range(times_to_repeat):
            result += '{'
            for j in range(len(names)):
                current_description = descriptions[j].replace('*', positions[i])
                result += '"' + names[j] + '": ' + current_description
                if j + 1 < len(names):
                    result += ', '
            result += '}'
            if i + 1 < times_to_repeat:
                result += ', '
        
        if is_elipsis:
            result += ", ... , {"
            for j in range(len(names)):
                    current_description = descriptions[j]
                    result += '"' + names[j] + '": ' + current_description
                    if j + 1 < len(names):
                        result += ', '

        result += "}]"
        return result