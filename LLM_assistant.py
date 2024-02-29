from llama_cpp import Llama
from text_utility import TextUtility, ATTRIBUTES_STRING, RELATIONSHIPS_STRING, RELATIONSHIPS_STRING_TWO_ENTITIES, ENTITIES_STRING
from find_relevant_text_lemmatization import RelevantTextFinderLemmatization
import time
import logging
import json


ITEMS_COUNT = 5
IS_SYSTEM_MSG = True
IS_CONCEPTUAL_MODEL_DEFINITION = False
IS_IGNORE_DOMAIN_DESCRIPTION = False
TAKE_ONLY_RELEVANT_INFO_FROM_DOMAIN_DESCRIPTION = False
IS_CHAIN_OF_THOUGHTS = False
IS_RELATIONSHIPS_IS_A = False

CONFIG_FILE_PATH = "llm-config.json"
TIMESTAMP = time.strftime('%Y-%m-%d-%H-%M-%S')
LOG_FILE_PATH = f"{TIMESTAMP}-log.txt"

logging.basicConfig(level=logging.DEBUG, format="%(message)s", filename=LOG_FILE_PATH, filemode='w')


class LLMAssistant:
    def __init__(self):
        # Larger batch_size will process the prompt faster but will require more memory.
        # If you have enough GPU memory to fit the model, setting threads=1 can improve performance.

        with open(CONFIG_FILE_PATH, 'r') as file:
            config = json.load(file)
    
        model_path = config['model_path']
        model_type = config['model_type']
        context_size = config['context_size']

        self.llm = Llama(model_path=model_path, chat_format=model_type, n_gpu_layers=-1, main_gpu=1, n_ctx=context_size, verbose=True)

        if TAKE_ONLY_RELEVANT_INFO_FROM_DOMAIN_DESCRIPTION:
            # Assumption: domain description never changes
            # TODO: Add option for semantic text finder
            self.relevant_text_finder = RelevantTextFinderLemmatization()
        
        self.debug_info = self.DebugInfo()
    
    class DebugInfo:
        def __init__(self):
            self.prompt = ""
            self.assistant_message = ""
            self.deleted_items = []


    def __append_default_messages_for_suggestions(self, user_choice, is_domain_description=False):
        system = ""
        if user_choice == ATTRIBUTES_STRING:
            if not is_domain_description:
                system = "You are an expert at generating attributes for a given entity."
            else:
                #system = "You are creating a conceptual model which consists of entities, their attributes and relationships in between the entities. You will be given an entity, text and description of JSON format. Your task is to output attributes of the given entity solely based on the given text in the described JSON format. Be careful that some relationships can look like an attributes. Do not output any explanation. Do not ouput anything else."
                # system = "You are an expert at extracting attributes for a given entity solely based on a given text in context of creating conceptual model in software engineering."
                system = "You are an expert at extracting attributes in JSON format for a given entity solely based on a given context."


        elif user_choice == RELATIONSHIPS_STRING:

            if not is_domain_description:
                system = "You are an expert at creating a conceptual model which consists of entities and their relationships. Each relationship is between exactly two entities, we will denote them as the source entity and the target entity. Both entities are represented as nouns in singular. Each relationship has a name such that when you insert it in between the source entity and the target entity in this order a short meaningful sentence is created. When you come up with a new relationship name always make sure that the described short meaningful sentence can be created."
            else:
                #system = "You are an expert at extracting relationships for a given entity solely based on a given text in context of creating conceptual model in software engineering."
                #system = "You are creating a conceptual model which consists of entities and their relationships. "
                #system += "Each relationship is between exactly two entities, we will describe them as the source entity and the target entity. "
                #system += "Each relationship has a name in a verb form such that when you insert this verb in between the source entity and the target entity in this order a short meaningful sentence is created. "
                #system += "Always make sure that the short meaningful sentence indeed makes sense. Be very careful when creating the short meaningful sentence: the source entity must come first then follows the relationship name and then follows the target entity name which ends the sentence. Always check that this order holds."
                #system += " You will be given a source entity and your goal is to solely based on the given text to find a relationships between this source entity and some new target entity."

                #system = "You are an expert at creating a conceptual model which consists of entities and their relationships solely based on a given text. Each relationship is between exactly two entities, we will denote them as the source entity and the target entity. Both entities are represented as nouns in singular. Each relationship has a name such that when you insert it in between the source entity and the target entity in this order a short meaningful sentence is created. When you come up with a new relationship name and a new target entity always make sure that the described short meaningful sentence can be created."

                if IS_RELATIONSHIPS_IS_A:
                    system = "You are an expert at extracting is-a relationships in JSON format for a given entity solely based on a given context."
                else:
                    #system = "You are an expert at creating a conceptual model which consists of entities and their relationships. Each relationship is between exactly two entities, we will denote them as the source entity and the target entity. Both entities are represented as nouns in singular. Each relationship has a name such that when you insert it in between the source entity and the target entity in this order a short meaningful sentence is created. When you come up with a new relationship name and a new target entity always make sure that the described short meaningful sentence can be created."
                    system = "You are an expert at extracting relationships in JSON format for a given entity solely based on a given context."


        elif user_choice == RELATIONSHIPS_STRING_TWO_ENTITIES:
            system = "You are an expert at creating a conceptual model which consists of entities and their relationships. "
            system += "Each relationship is between exactly two entities, we will describe them as the source entity and the target entity. "
            system += "Each relationship has a name in a verb form such that when you insert this verb in between the source entity and the target entity in this order a short meaningful sentence is created. "
            system += "Always make sure that the short meaningful sentence indeed makes sense. Be very careful when creating the short meaningful sentence: the source entity must come first then follows the relationship name and then follows the target entity name which ends the sentence. Always check that this order holds."


        elif user_choice == ENTITIES_STRING:

            if not is_domain_description:
                system = "You are an expert at generating entities in JSON format."
            else:
                system = "You are an expert at extracting entities in JSON format solely based on a given context."

        else:
            raise ValueError(f"Error: Unknown user choice: {user_choice}")

        if not IS_SYSTEM_MSG:
            system = ""

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
    

    def __append_default_messages_for_summaries(self):

        #system = "You are an expert at describing conceptual models which are in JSON format."
        system = "You are an expert at generating domain description solely based on given conceptual model which is in JSON format."

        if not IS_SYSTEM_MSG:
            system = ""

        self.messages.append({"role": "system", "content": system})


    # Returns (parsed_item, is_item_ok)
    # is_item_ok: False if there is any issue while parsing otherwise True
    def __parse_item_streamed_output(self, item, user_choice, is_provided_class_source, user_input_entity1, user_input_entity2=""):
        try:
            # Replace invalid characters from JSON
            item = item.replace('\_', ' ')

            completed_item = json.loads(item)

        except ValueError:
            logging.error(f"Cannot decode JSON: {item}\n")
            completed_item = { "name": f"Error: {item}"}
            yield completed_item, False
            return
        
        is_item_ok = True
        user_input_entity1 = user_input_entity1.lower()
        user_input_entity2 = user_input_entity2.lower()

        if "name" not in completed_item or not completed_item["name"]:
            completed_item["name"] = "error: no name"
            is_item_ok = False

        else:
            # Lower case the first letter in the `name` to consistently have all names with the first letter in lower case
            completed_item["name"] = completed_item["name"][0].lower() + completed_item["name"][1:]

            completed_item["name"] = TextUtility.convert_name_to_standard_convention(completed_item["name"])
        

        if not is_item_ok:
            yield completed_item, is_item_ok
            return
        
        if user_choice == ATTRIBUTES_STRING:
            pass
            # Remove attributes in which their inferred text does not contain the given entity
            # is_inference = "inference" in completed_item
            # if is_inference and user_input_entity1 not in completed_item['inference'].lower():
                # completed_item['name'] = "(Deleted: Source entity is not contained in the inference) " + completed_item['name']
                # logging.warning("Source entity is not contained in the inference")
                # is_item_ok = True


        elif user_choice == RELATIONSHIPS_STRING:
            # if not "source" in completed_item or not completed_item["source"]:
            #     completed_item["name"] = "error: no source entity"
            #     is_item_ok = False
            
            # if not "target" in completed_item or not completed_item["target"]:
            #     completed_item["name"] = "error: no target entity"
            #     is_item_ok = False
            
            # if not is_item_ok:
            #     yield completed_item, is_item_ok
            #     return

            # is_entity1_source_or_target = user_input_entity1 == completed_item['source'] or user_input_entity1 == completed_item['target']

            # is_entity1_in_sentence = True
            # if "sentence" in completed_item:
            #     is_entity1_in_sentence = user_input_entity1 in completed_item['sentence']
            
            # is_none = (completed_item['source'].lower() == "none") or (completed_item['target'].lower() == "none")
            
            # if not is_entity1_source_or_target or not is_entity1_in_sentence or is_none:
            #     # For debugging purpuses do not end parsing but otherwise we would probably end
            #     #self.end_parsing_prematurely = True
            #     #return completed_item
            #     completed_item['name'] = "(Deleted: Inputed entity is not source/target entity) " + completed_item['name']
            #     is_item_ok = False
            pass


        elif user_choice == RELATIONSHIPS_STRING_TWO_ENTITIES:
            source_lower = completed_item['source'].lower()
            target_lower = completed_item['target'].lower()

            is_match = (user_input_entity1 == source_lower and user_input_entity2 == target_lower) or (user_input_entity2 == source_lower and user_input_entity1 == target_lower)
            is_none = (source_lower == "none") or (target_lower == "none")

            if not is_match or is_none:
                completed_item['name'] = "(Deleted: Inputed entites are not contained in source and target entities) " + completed_item['name']
                is_item_ok = False

        logging.info(f"Completed item: {completed_item['name']}")

        for key in completed_item:
            if key == "name":
                continue
            key_name = key.replace('_', ' ').capitalize()
            logging.info(f"- {key_name}: {completed_item[key]}")

        # if "description" in completed_item:
        #     logging.info(f"- Description: {completed_item['description']}")
        # if "source" in completed_item:
        #     logging.info(f"- Source: {completed_item['source']}")
        # if "target" in completed_item:
        #     logging.info(f"- Target: {completed_item['target']}")
        # if "sentence" in completed_item:
        #     logging.info(f"- Sentence: {completed_item['sentence']}")
        # if "inference" in completed_item:
        #     logging.info(f"- Inference: {completed_item['inference']}")
        # if "cardinality" in completed_item:
        #     logging.info(f"- Cardinality: {completed_item['cardinality']}")
        # if "data_type" in completed_item:
        #     logging.info(f"- Data type: {completed_item['data_type']}")

        logging.info("\n")

        yield completed_item, is_item_ok


    def __parse_streamed_output(self, messages, user_choice, user_input_entity1, user_input_entity2="", is_provided_class_source=True):
        self.debug_info = self.DebugInfo() # Reset debug info

        items = []
        item = ""
        is_item_start = False
        is_skip_parsing = False
        new_lines_in_a_row = 0
        last_char = ''
        self.end_parsing_prematurely = False
        opened_square_brackets = 0

        # For debugging purposes generate whole text first because there might be some bug on my side when parsing text on the fly
        is_generate_content_first = True

        if is_generate_content_first:
            output = self.llm.create_chat_completion(messages=messages, temperature=0)
            logging.debug(f"Output: {output}")
            output = output['choices'][0]['message']['content']
        else:
            output = self.llm.create_chat_completion(messages=messages, temperature=0, stream=True)


        for text in output:

            if not is_generate_content_first:
                if not 'content' in text['choices'][0]['delta']:
                    continue
                text = text['choices'][0]['delta']['content']


            self.debug_info.assistant_message += text
            if is_skip_parsing:
                continue

            for char in text:
                if char == '{':
                    is_item_start = True
                if char == '[':
                    opened_square_brackets += 1

                if char == '\n' and last_char == '\n':
                    new_lines_in_a_row += 1
                else:
                    new_lines_in_a_row = 0
                
                if char == ']':
                    opened_square_brackets -= 1

                    # We already got the last object of the JSON output
                    if opened_square_brackets == 0:
                        logging.debug("End: last square bracket was detected")
                        return
                
                # Return when LLM gets stuck in printing only new lines
                if new_lines_in_a_row > 3:
                    logging.warning("Warning: too many new lines")
                    return
                
                if is_item_start:
                    item += char
                
                if char == "}" and item != '':
                    is_item_start = False

                    iterator = self.__parse_item_streamed_output(item, user_choice, is_provided_class_source, user_input_entity1, user_input_entity2)

                    for completed_item, is_item_ok in iterator:
                        # TODO: Add comment what this code is doing
                        if self.end_parsing_prematurely:
                            logging.debug(f"Ending parsing prematurely: {completed_item}")
                            return
                            
                        if is_item_ok:
                            yield completed_item
                        else:
                            self.debug_info.deleted_items.append(completed_item)

                    item = ""
                
                last_char = char
        
        #logging.debug(f"-- End of LLM output generation --")

        if len(items) != ITEMS_COUNT:
            # LLM sometimes does not properly finish the JSON object
            # So try to finish the object by appending the last curly bracket
            if is_item_start:
                item += '}'

                iterator = self.__parse_item_streamed_output(item, user_choice, is_provided_class_source, user_input_entity1)

                for completed_item, is_item_ok in iterator:
                    if is_item_ok:
                        yield completed_item
                    else:
                        self.debug_info.deleted_items.append(completed_item)
    
        if is_skip_parsing:
            logging.debug(f"\nFull message: {self.debug_info.assistant_message}")
        
        logging.debug(f"\nFull message: {self.debug_info.assistant_message}")
        return


    def __create_prompt(self, user_choice, entity1, entity2, is_domain_description, count_items_to_suggest, relevant_texts):

        # TODO: Load prompts from JSON file and do something like this: prompt = prompt_file['user_choice']['is_domain_description']
        # JSON file structure example: { "attributes": { "is_domain_description" : "prompt1", "is_not_domain_description": "prompt2" } }
        # If we need to substitute `entity1` then the JSON file can contain as string ENTITY1 and we will call prompt.replace("ENTITY1", entity1)

        if user_choice == ATTRIBUTES_STRING:
            if not is_domain_description:
                prompt = f'What attributes does the entity: "{entity1}" have? Output exactly {count_items_to_suggest} attributes in JSON format like this: '
                prompt += '{"description": "attribute description", "name": "attribute name"}.'
            else:
                prompt = f'Solely based on the following context which attributes does the entity: "{entity1}" have? '
                
                if IS_CHAIN_OF_THOUGHTS:
                    # prompt += 'First for each attribute output its name and copy the part of the given context containing this attribute. After outputting all attributes output each single attribute in JSON object like this: {"inference": "copy the part of the given context containing this attribute", "name": "attribute name"}.'
                    prompt += 'First for each attribute output its name and copy the part of the given context containing this attribute. After outputting all attributes output each single attribute in JSON object like this: {"inference": "copy the part of the given context containing this attribute", "name": "attribute name", "data_type": "data type of the attribute", "cardinality": "cardinality of the attribute"}.'
                else:
                    prompt += 'Output each single attribute in JSON object like this: {"inference": "copy the part of the given context containing this attribute", "name": "attribute name"}.'


        elif user_choice == RELATIONSHIPS_STRING:
            if not is_domain_description:
                prompt = f'Which relationships does the entity: "{entity1}" have? Output exactly {count_items_to_suggest} relationships in JSON format like this: '
                prompt += '{"description": "relationship description", "name": "relationship name", "source": "source entity name", "target": "target entity name"}.'

            else:
                if IS_RELATIONSHIPS_IS_A:
                    prompt = f'Solely based on the following context which is-a relationships does the entity: "{entity1}" have? First output all possible is-a relationships for the entity "{entity1}". Then output only those is-a relationships which you are certain about in JSON format like this: '
                    prompt += '{"inference": "copy the part of the given context containing this is-a relationship", "name": "relationship name", "source": "source entity name", "target": "target entity name"}.'

                else:
                    prompt = f'Solely based on the following context which relationships does the entity: "{entity1}" have? '

                    if IS_CHAIN_OF_THOUGHTS:
                        prompt += 'First for each relationship output its name and copy the part of the given context containing this relationship. After outputting all relationships output each relationship in JSON object like this: {"inference": "copy the part of the given context containing this relationship", "name": "relationship name"}.'
                    else:
                        prompt += 'Output each single relationship in JSON object like this: {"inference": "copy the part of the given context containing this relationship", "name": "relationship name"}.'


        elif user_choice == RELATIONSHIPS_STRING_TWO_ENTITIES:
            if not is_domain_description:
                prompt = f'What relationships are between source entity "{entity1}" and target entity "{entity2}"? Output exactly {count_items_to_suggest} relationships in JSON format like this: '
                prompt += '{"description": "relationship description", "name": "relationship name", "source": "source entity name", "target": "target entity name"}.'

            else:
                prompt = f'Solely based on the following text which relationships are between the entity "{entity1}" and the entity "{entity2}"? '
                prompt += 'First for each relationship output: its name, only the exact part of the given context containing this relationship, source entity of this relationship and target entity of this relationship. After outputting all relationships output each relationship in JSON object like this: {"inference": "text from the following context containing this relationship", "name": "relationship name", "source": "source entity name", "target": "target entity name"}.'


        elif user_choice == ENTITIES_STRING:
            if IS_CHAIN_OF_THOUGHTS:
                prompt = 'Solely based on the following context extract all entities. First for each entity output its name and copy the part of the given context containing this entity. After outputting all entities output each entity in this JSON object: {"inference": "copy the part of the given context containing this entity", "name": "entity name"}. '
            else:
                prompt = 'Solely based on the following context extract all entities in this JSON object: {"name": "entity name", "inference": "copy the part of the given context containing this entity"}.'
        else:
            raise ValueError(f"Error: Encountered undefined user choice while creating prompt: {user_choice}")


        if is_domain_description:
            prompt += f'\n\nThis is the given context:\n"{relevant_texts}"'

        return prompt


    def suggest(self, entity1, entity2, user_choice, count_items_to_suggest, conceptual_model, domain_description):
        entity1 = entity1.strip()

        if IS_IGNORE_DOMAIN_DESCRIPTION:
            domain_description = ""

        is_domain_description = domain_description != ""

        self.messages = []
        self.__append_default_messages_for_suggestions(user_choice=user_choice, is_domain_description=is_domain_description)        

        if TAKE_ONLY_RELEVANT_INFO_FROM_DOMAIN_DESCRIPTION:
            relevant_texts = self.relevant_text_finder.get(entity1)

            result = ""
            for text in relevant_texts:
                result += f"{text}\n"
            
            relevant_texts = result.rstrip() # Remove trailing new line
        else:
            relevant_texts = domain_description

        prompt = self.__create_prompt(user_choice, entity1, entity2, is_domain_description, count_items_to_suggest, relevant_texts)
        
        new_messages = self.messages.copy()
        new_messages.append({"role": "user", "content": prompt})

        messages_prettified = TextUtility.messages_prettify(new_messages)
        logging.debug(f"\nSending this prompt to llm:\n{messages_prettified}\n")
        self.debug_info.prompt = messages_prettified

        items_iterator = self.__parse_streamed_output(new_messages, user_choice=user_choice, user_input_entity1=entity1, user_input_entity2=entity2)

        for item in items_iterator:
            suggestion_dictionary = json.loads(json.dumps(item))

            # Find inference indexes for `item['inference']` in `domain_description`
            if 'inference' in item:
                inference = item['inference']
                inference_indexes, _, _ = TextUtility.find_text_in_domain_description(inference, domain_description)
                suggestion_dictionary['inference_indexes'] = inference_indexes
            else:
                logging.warn(f"Warning: inference not in item: {item}")

            json_item = json.dumps(suggestion_dictionary)
            yield f"{json_item}\n"


    def summarize_conceptual_model(self, conceptual_model):

        # TODO: Possible improvement: convert `conceptual_model` in JSON format into simple model description

        conceptual_model = {
            "student" : { "attributes": [ {"attribute_name" : "name", "data_type": "string"}], "relationships" : [{"relationship_name": "is accomodated", "source_entity": "student", "target_entity": "dormitory" }, {"relationship_name": "enrolls", "source_entity": "student", "target_entity": "course" }] },
            "course" : { "attributes": [ {"attribute_name": "name", "data_type": "string"}, {"attribute_name": "number of credits", "data_type": "integer"}], "relationships" : [{"relationship_name": "have", "source_entity": "course", "target_entity": "professor" }, {"relationship_name": "aggregates", "source_entity": "course", "target_entity": "student" }], },
            "professor" : { "attributes": [ {"attribute_name": "name", "data_type": "string"}], "relationships" : [{"relationship_name": "participates in", "source_entity": "professor", "target_entity": "course" }], },
            "dormitory" : { "attributes": [ {"attribute_name": "price", "data_type": "real"}], "relationships" : [{"relationship_name": "accomodates", "source_entity": "dormitory", "target_entity": "student" }], },

        }
        #prompt = f"Create a human description of this conceptual model: {json.dumps(conceptual_model)}?"
        #prompt = f"The following conceptual model was created from some domain description. Create this domain description based on the following conceptual model: "
        prompt = f"Create domain description like human in simple sentences solely based on this conceptual model: "

        prompt += f"{json.dumps(conceptual_model)}"


        self.messages = []
        self.__append_default_messages_for_summaries()
        new_messages = self.messages.copy()
        new_messages.append({"role": "user", "content": prompt})

        llm_prompt = TextUtility.create_llm_prompt(self.model_type, new_messages)
        logging.debug(f"Sending this prompt to llm:\n{llm_prompt}\n")

        for text in self.llm(prompt, stream=True):
            logging.info(text, end="", flush=True)

        return ""