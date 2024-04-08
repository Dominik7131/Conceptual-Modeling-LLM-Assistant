from llama_cpp import Llama
from text_utility import PromptFileSymbols, TextUtility, UserChoice, DataType
from find_relevant_text_lemmatization import RelevantTextFinderLemmatization
import time
import logging
import json


ITEMS_COUNT = 5
IS_SYSTEM_MSG = False
IS_CONCEPTUAL_MODEL_DEFINITION = False
IS_IGNORE_DOMAIN_DESCRIPTION = False
TAKE_ONLY_RELEVANT_INFO_FROM_DOMAIN_DESCRIPTION = True
IS_CHAIN_OF_THOUGHTS = True
IS_RELATIONSHIPS_IS_A = False

IS_STOP_GENERATING_OUTPUT = False

CONFIG_FILE_PATH = "llm-config.json"
TIMESTAMP = time.strftime('%Y-%m-%d-%H-%M-%S')
LOG_FILE_PATH = f"{TIMESTAMP}-log.txt"

DEFINED_DATA_TYPES = [DataType.STRING.value, DataType.NUMBER.value, DataType.TIME.value, DataType.BOOLEAN.value]

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
        n_batch = config['n_batch']

        self.llm = Llama(model_path=model_path, chat_format=model_type, n_gpu_layers=-1, n_ctx=context_size, n_batch=n_batch, verbose=True)

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
        if user_choice == UserChoice.ATTRIBUTES.value:
            if not is_domain_description:
                system = "You are an expert at generating attributes for a given entity."
            else:
                #system = "You are creating a conceptual model which consists of entities, their attributes and relationships in between the entities. You will be given an entity, text and description of JSON format. Your task is to output attributes of the given entity solely based on the given text in the described JSON format. Be careful that some relationships can look like an attributes. Do not output any explanation. Do not ouput anything else."
                # system = "You are an expert at extracting attributes for a given entity solely based on a given text in context of creating conceptual model in software engineering."
                system = "You are an expert at extracting attributes in JSON format for a given entity solely based on a given context."


        elif user_choice == UserChoice.RELATIONSHIPS.value:

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


        elif user_choice == UserChoice.RELATIONSHIPS2.value:
            if not is_domain_description:
                system = "You are an expert at generating relationships in between two given entities."
            else:
                system = "You are an expert at creating a conceptual model which consists of entities and their relationships. Each relationship is between exactly two entities, we will describe them as the source entity and the target entity. Each relationship has a name in a verb form such that when you insert this verb in between the source entity and the target entity in this order a short meaningful sentence is created. Always make sure that the short meaningful sentence indeed makes sense. Be very careful when creating the short meaningful sentence: the source entity must come first then follows the relationship name and then follows the target entity name which ends the sentence. Always check that this order holds."
                # system = "You are an expert at extracting relationships for an UML diagram in JSON format for two given entities solely based on a given context."


        elif user_choice == UserChoice.ENTITIES.value:
            if not is_domain_description:
                system = "You are an expert at generating entities in JSON format."
            else:
                system = "You are an expert at extracting class names for a UML diagram in JSON format solely based on a given context."

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

        if user_choice == UserChoice.ONLY_DESCRIPTION.value:
            is_item_ok = "description" in completed_item

            if not is_item_ok:
                logging.error("No description in the item")

            yield completed_item, is_item_ok
            return
        
        if user_choice == UserChoice.SUMMARY1.value:
            is_item_ok = "summary" in completed_item

            if not is_item_ok:
                logging.error("No summary in the item")

            yield completed_item, is_item_ok
            return

        elif user_choice == UserChoice.SUMMARY2.value:
            yield completed_item, is_item_ok
            return

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
        
        if user_choice == UserChoice.ATTRIBUTES.value:
            # TODO: define all attribute field names so we do not have to type "dataType" but can use some variable instead
            if "dataType" in completed_item:
                if completed_item["dataType"] == "float":
                    logging.debug(f"Converting float data type to number")
                    completed_item["dataType"] = "number"

                elif completed_item["dataType"] == "date":
                    logging.debug(f"Converting date data type to time")
                    completed_item["dataType"] = "time"

                # Convert any unknown data type to string
                if not completed_item["dataType"] in DEFINED_DATA_TYPES:
                    logging.debug(f"Converting unknown data type to string")
                    completed_item["dataType"] = "string"

            # Remove attributes in which their inferred text does not contain the given entity
            # is_inference = "inference" in completed_item
            # if is_inference and user_input_entity1 not in completed_item['inference'].lower():
                # completed_item['name'] = "(Deleted: Source entity is not contained in the inference) " + completed_item['name']
                # logging.warning("Source entity is not contained in the inference")
                # is_item_ok = True


        elif user_choice == UserChoice.RELATIONSHIPS.value:
            if not "source" in completed_item or not completed_item["source"]:
                completed_item["name"] = "error: no source entity"
                is_item_ok = False

            
            if not "target" in completed_item or not completed_item["target"]:
                completed_item["name"] = "error: no target entity"
                is_item_ok = False
            
            if not is_item_ok:
                yield completed_item, is_item_ok
                return
            
            source_lower = completed_item['source'].lower().replace('s', 'z')
            target_lower = completed_item['target'].lower().replace('s', 'z')

            is_entity1_source_or_target = user_input_entity1 == source_lower or user_input_entity1 == target_lower

            is_entity1_in_sentence = True
            if "sentence" in completed_item:
                is_entity1_in_sentence = user_input_entity1 in completed_item['sentence']
            
            is_none = (source_lower == "none") or (target_lower == "none")
            
            if not is_entity1_source_or_target or not is_entity1_in_sentence or is_none:
                # For debugging purpuses do not end parsing but otherwise we would probably end
                #self.end_parsing_prematurely = True
                #return completed_item
                completed_item['name'] = "(Deleted: Inputed entity is not source/target entity) " + completed_item['name']
                is_item_ok = False


        elif user_choice == UserChoice.RELATIONSHIPS2.value:
            if 'source' in completed_item and 'target' in completed_item:

                # Replace 's' for 'z' to solve the following issue:
                #   - input: motoriSed vehicle with S
                #   - LLM output: motoriZed vehicle with Z
                source_lower = completed_item['source'].lower().replace('s', 'z')
                target_lower = completed_item['target'].lower().replace('s', 'z')

                entity1 = user_input_entity1.replace('s', 'z')
                entity2 = user_input_entity2.replace('s', 'z')

                is_match = (entity1 == source_lower and entity2 == target_lower) or (entity2 == source_lower and entity1 == target_lower)
                is_none = (source_lower == "none") or (target_lower == "none")

                if not is_match or is_none:
                    completed_item['name'] = f"Deleted: Inputed entites are not contained in source and target entities: {completed_item['name']}"
                    is_item_ok = False

        logging.info(f"Completed item: {completed_item['name']}")

        for key in completed_item:
            if key == "name":
                continue
            key_name = key.replace('_', ' ').capitalize()
            logging.info(f"- {key_name}: {completed_item[key]}")

        logging.info("\n")

        yield completed_item, is_item_ok


    def __parse_streamed_output(self, messages, user_choice, user_input_entity1, user_input_entity2="", is_provided_class_source=True):
        self.debug_info = self.DebugInfo() # Reset debug info

        self.llm.reset()

        items = []
        item = ""
        new_lines_in_a_row = 0
        last_char = ''
        self.end_parsing_prematurely = False
        opened_curly_brackets_count = 0

        # For debugging purposes generate whole text first because there might be some bug on my side when parsing text on the fly
        is_generate_content_first = False

        if is_generate_content_first:
            output = self.llm.create_chat_completion(messages=messages, temperature=0)
            logging.debug(f"Output: {output}\n")
            output = output['choices'][0]['message']['content']
        else:
            output = self.llm.create_chat_completion(messages=messages, temperature=0, stream=True)


        for text in output:

            if not is_generate_content_first:
                if not 'content' in text['choices'][0]['delta']:
                    continue
                text = text['choices'][0]['delta']['content']


            self.debug_info.assistant_message += text

            if IS_STOP_GENERATING_OUTPUT:
                logging.debug("Stopping generating output")
                return

            for char in text:
                if char == '{':
                    opened_curly_brackets_count += 1

                if char == '\n' and last_char == '\n':
                    new_lines_in_a_row += 1
                else:
                    new_lines_in_a_row = 0

                
                # Return when LLM gets stuck in printing only new lines
                if new_lines_in_a_row > 3:
                    logging.warning("Warning: too many new lines")
                    return
                
                if opened_curly_brackets_count > 0:
                    item += char
                
                if char == '}':
                    opened_curly_brackets_count -= 1


                if opened_curly_brackets_count == 0 and item != '':

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

        if IS_IGNORE_DOMAIN_DESCRIPTION and len(items) != ITEMS_COUNT:
            logging.debug(f"Incorrect amount of items\n- expected: {ITEMS_COUNT}\n- actual: {len(items)}")

        # If the JSON object is not properly finished then insert the needed amount of closed curly brackets
        if opened_curly_brackets_count > 0:
            logging.debug(f"JSON object is not properly finished: {item}")
            item += '}' * opened_curly_brackets_count

            iterator = self.__parse_item_streamed_output(item, user_choice, is_provided_class_source, user_input_entity1)

            for completed_item, is_item_ok in iterator:
                if is_item_ok:
                    yield completed_item
                else:
                    self.debug_info.deleted_items.append(completed_item)
        
        logging.debug(f"\nFull message: {self.debug_info.assistant_message}")
        return


    def __create_prompt(self, user_choice, source_entity="", target_entity="", relevant_texts = "", is_domain_description_=True,
                        items_count_to_suggest = 5, isChainOfThoughts = True, conceptual_model = {}, field = "",
                        attribute_name="", relationship_name=""):

        replacements = {
            PromptFileSymbols.SOURCE_ENTITY.value: source_entity,
            PromptFileSymbols.TARGET_ENTITY.value: target_entity,
            PromptFileSymbols.DOMAIN_DESCRIPTION.value: relevant_texts,
            PromptFileSymbols.ITEMS_COUNT_TO_SUGGEST.value: items_count_to_suggest,
            PromptFileSymbols.CONCEPTUAL_MODEL.value: conceptual_model,
            PromptFileSymbols.ATTRIBUTE_NAME: attribute_name,
            PromptFileSymbols.RELATIONSHIP_NAME: relationship_name,
        }

        # Build corresponding file name
        prompt_file_name = f"{user_choice}"
        if field != "":
            prompt_file_name += f"-{field}"
        prompt_file_name += ".txt"

        with open(prompt_file_name, 'r') as file:
            original_prompt = file.read()
        
        prompt = TextUtility.multireplace(original_prompt, replacements)

        return prompt


    def suggest(self, source_entity, target_entity, user_choice, count_items_to_suggest, conceptual_model, domain_description):
        global IS_STOP_GENERATING_OUTPUT

        source_entity = source_entity.strip()

        if IS_IGNORE_DOMAIN_DESCRIPTION:
            domain_description = ""

        is_domain_description = domain_description != ""

        self.messages = []
        self.__append_default_messages_for_suggestions(user_choice=user_choice, is_domain_description=is_domain_description)        

        if TAKE_ONLY_RELEVANT_INFO_FROM_DOMAIN_DESCRIPTION and user_choice != UserChoice.ENTITIES.value:
            relevant_texts = self.relevant_text_finder.get(source_entity, domain_description)

            result = ""
            for text in relevant_texts:
                result += f"{text}\n"
            
            relevant_texts = result.rstrip() # Remove trailing new line
        else:
            relevant_texts = domain_description
        
        if is_domain_description and not relevant_texts:
            logging.warn("No relevant texts found.")
            return

        prompt = self.__create_prompt(user_choice=user_choice, source_entity=source_entity, target_entity=target_entity,
                                      is_domain_description=is_domain_description, items_count_to_suggest=count_items_to_suggest, relevant_texts=relevant_texts)
        
        new_messages = self.messages.copy()
        new_messages.append({"role": "user", "content": prompt})

        messages_prettified = TextUtility.messages_prettify(new_messages)
        logging.debug(f"\nSending this prompt to llm:\n{messages_prettified}\n")
        self.debug_info.prompt = messages_prettified

        items_iterator = self.__parse_streamed_output(new_messages, user_choice=user_choice, user_input_entity1=source_entity, user_input_entity2=target_entity)

        # TODO: Test if this works
        # try:
        #     items_iterator = self.__parse_streamed_output(new_messages, user_choice=user_choice, user_input_entity1=source_entity, user_input_entity2=target_entity)
        # finally:
        #     IS_STOP_GENERATING_OUTPUT = True

        if user_choice == UserChoice.ENTITIES.value:
            suggested_entities = []

        for item in items_iterator:
            suggestion_dictionary = json.loads(json.dumps(item))

            if user_choice == UserChoice.ENTITIES.value:
                if suggestion_dictionary['name'] in suggested_entities:
                    logging.debug(f"Skipping duplicate entity: {suggestion_dictionary['name']}")
                    continue
                suggested_entities.append(suggestion_dictionary['name'])

                # Set inference to find all occurencies of the entity name in the domain description
                item['inference'] = suggestion_dictionary['name']

            # Find inference indexes for `item['inference']` in `domain_description`
            if 'inference' in item:
                inference = item['inference']
                inference_indexes, _, _ = TextUtility.find_text_in_domain_description(inference, domain_description)
                suggestion_dictionary['inferenceIndexes'] = inference_indexes
            else:
                logging.warn(f"Warning: inference not in item: {item}")

            json_item = json.dumps(suggestion_dictionary)
            yield f"{json_item}\n"
    

    def get_field_content(self, attribute_name, source_entity, domain_description, field):
        source_entity = source_entity.strip()

        prompt = self.__create_prompt(user_choice=UserChoice.ONLY_DESCRIPTION.value, source_entity=source_entity, relevant_texts=domain_description, field=field)

        # For simplicity right now generate content only for "description" field
        prompt = f'Solely based on the given context provide description for the attribute: "{attribute_name}" of the entity: "{source_entity}" and output it in this JSON object: '
        prompt += '{"description": "..."}.\n\n'
        prompt += f'This is the given context:\n"{domain_description}"'

        self.messages = []
        new_messages = self.messages.copy()
        new_messages.append({"role": "user", "content": prompt})
        messages_prettified = TextUtility.messages_prettify(new_messages)
        self.debug_info.prompt = messages_prettified

        logging.debug(f"\nSending this prompt to llm:\n{messages_prettified}\n")

        items_iterator = self.__parse_streamed_output(new_messages, UserChoice.ONLY_DESCRIPTION.value, source_entity)

        for item in items_iterator:
            description_dictionary = json.loads(json.dumps(item))

            json_item = json.dumps(description_dictionary)
            yield f"{json_item}\n"


    def summarize_conceptual_model1(self, conceptual_model, domain_description):
        
        prompt = self.__create_prompt(user_choice=UserChoice.SUMMARY1.value, conceptual_model=conceptual_model, relevant_texts=domain_description)

        self.messages = []
        new_messages = self.messages.copy()
        new_messages.append({"role": "user", "content": prompt})
        messages_prettified = TextUtility.messages_prettify(new_messages)
        self.debug_info.prompt = messages_prettified

        logging.debug(f"\nSending this prompt to llm:\n{messages_prettified}\n")

        items_iterator = self.__parse_streamed_output(new_messages, UserChoice.SUMMARY1.value, "")

        for item in items_iterator:
            dictionary = json.loads(json.dumps(item))

            json_item = json.dumps(dictionary)
            yield f"{json_item}\n"


    def summarize_conceptual_model2(self, conceptual_model, domain_description):

        prompt = self.__create_prompt(user_choice=UserChoice.SUMMARY2.value, conceptual_model=conceptual_model, relevant_texts=domain_description)

        self.messages = []
        new_messages = self.messages.copy()
        new_messages.append({"role": "user", "content": prompt})
        messages_prettified = TextUtility.messages_prettify(new_messages)
        self.debug_info.prompt = messages_prettified

        logging.debug(f"\nSending this prompt to llm:\n{messages_prettified}\n")

        items_iterator = self.__parse_streamed_output(new_messages, UserChoice.SUMMARY2.value, "")

        for item in items_iterator:
            dictionary = json.loads(json.dumps(item))

            json_item = json.dumps(dictionary)
            print(f"Yielding: {json_item}")
            yield f"{json_item}\n"
    
