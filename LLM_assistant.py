from ctransformers import AutoModelForCausalLM
import json
from embeddings import Embeddings
from text_utility import TextUtility, ATTRIBUTES_STRING, RELATIONSHIPS_STRING, RELATIONSHIPS_STRING_TWO_ENTITIES, PROPERTIES_STRING


ITEMS_COUNT = 5
IS_SYSTEM_MSG = True
IS_CONCEPTUAL_MODEL_DEFINITION = False
IS_IGNORE_DOMAIN_DESCRIPTION = False
TAKE_ONLY_RELEVANT_INFO_FROM_DOMAIN_DESCRIPTION = False


class LLMAssistant:
    def __init__(self, model_path_or_repo_id, model_file, model_type):
        # Larger batch_size will process the prompt faster but will require more memory.
        # If you have enough GPU memory to fit the model, setting threads=1 can improve performance.
        self.model_type = model_type
        self.llm = AutoModelForCausalLM.from_pretrained(model_path_or_repo_id=model_path_or_repo_id, model_file=model_file, model_type=model_type, local_files_only=True,
                                                        gpu_layers=200, temperature=0.0, context_length=4096, max_new_tokens=4096,
                                                        batch_size=1024, threads=1, reset=True)
        #print(f"Config: Context length: {str(self.llm.context_length)}, Temperature: {str(self.llm.config.temperature)}, Max new tokens: {str(self.llm.config.max_new_tokens)}")

        if TAKE_ONLY_RELEVANT_INFO_FROM_DOMAIN_DESCRIPTION:
            self.embeddings = Embeddings()

    def __append_default_messages_for_suggestions(self, user_choice, is_domain_description=False):
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
                #system += " You will be given a source entity and your goal is to solely based on the given text to find a relationships between this source entity and some new target entity."

                system = "You are an expert at creating a conceptual model which consists of entities and their relationships. Each relationship is between exactly two entities, we will denote them as the source entity and the target entity. Both entities are represented as nouns in singular. Each relationship has a name such that when you insert it in between the source entity and the target entity in this order a short meaningful sentence is created. When you come up with a new relationship name and a new target entity always make sure that the described short meaningful sentence can be created."
                #system = "You are an expert at creating a conceptual model which consists of entities and their relationships solely based on a given text. Each relationship is between exactly two entities, we will denote them as the source entity and the target entity. Both entities are represented as nouns in singular. Each relationship has a name such that when you insert it in between the source entity and the target entity in this order a short meaningful sentence is created. When you come up with a new relationship name and a new target entity always make sure that the described short meaningful sentence can be created."


        elif user_choice == RELATIONSHIPS_STRING_TWO_ENTITIES:
            system = "You are an expert at creating a conceptual model which consists of entities and their relationships. "
            system += "Each relationship is between exactly two entities, we will describe them as the source entity and the target entity. "
            system += "Each relationship has a name in a verb form such that when you insert this verb in between the source entity and the target entity in this order a short meaningful sentence is created. "
            system += "Always make sure that the short meaningful sentence indeed makes sense. Be very careful when creating the short meaningful sentence: the source entity must come first then follows the relationship name and then follows the target entity name which ends the sentence. Always check that this order holds."

        elif user_choice == PROPERTIES_STRING:

            if not is_domain_description:
                system = "You are an expert at generating properties for a given entity in context of creating conceptual model in software engineering."
            else:
                system = "You are an expert at extracting properties for a given entity solely based on a given text in context of creating conceptual model in software engineering."



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


    def __parse_item(self, item, items, user_choice, is_provided_class_source, user_input_entity1, user_input_entity2=""):
        try:
            completed_item = json.loads(item)
        except ValueError:
            print("Error: Cannot decode JSON: " + item)
            completed_item = {"name": "Error: " + item} # For debugging return this as a valid item
            return completed_item
        
        user_input_entity1 = user_input_entity1.lower()
        user_input_entity2 = user_input_entity2.lower()

        if "name" not in completed_item:
            completed_item["name"] = "error: no name"

        if user_choice == ATTRIBUTES_STRING:
            # Remove attributes in which their inferred text does not contain the given entity
            is_inference = "inference" in completed_item
            if is_inference and user_input_entity1 not in completed_item['inference'].lower():
                completed_item['name'] = "(DELETED) " + completed_item['name']


        elif user_choice == RELATIONSHIPS_STRING:

            is_entity1_source_or_target = user_input_entity1 == completed_item['source'] or user_input_entity1 == completed_item['target']

            is_entity1_in_sentence = True
            if "sentence" in completed_item:
                is_entity1_in_sentence = user_input_entity1 in completed_item['sentence']
            
            is_none = (completed_item['source'].lower() == "none") or (completed_item['target'].lower() == "none")
            
            if not is_entity1_source_or_target or not is_entity1_in_sentence or is_none:
                # For debugging purpuses do not end parsing but otherwise we would probably end
                #self.end_parsing_prematurely = True
                #return completed_item
                completed_item['name'] = "(DELETED) " + completed_item['name']


        elif user_choice == RELATIONSHIPS_STRING_TWO_ENTITIES:
            source_lower = completed_item['source'].lower()
            target_lower = completed_item['target'].lower()

            is_match = (user_input_entity1 == source_lower and user_input_entity2 == target_lower) or (user_input_entity2 == source_lower and user_input_entity1 == target_lower)
            is_none = (source_lower == "none") or (target_lower == "none")

            if not is_match or is_none:
                completed_item['name'] = "(DELETED) " + completed_item['name']


        print(f"{len(items) + 1}: {completed_item['name'].capitalize()}")

        if "description" in completed_item:
            print(f"- Description: {completed_item['description']}")
        if "source" in completed_item:
            print(f"- Source: {completed_item['source']}")
        if "target" in completed_item:
            print(f"- Target: {completed_item['target']}")
        if "sentence" in completed_item:
            print(f"- Sentence: {completed_item['sentence']}")
        if "inference" in completed_item:
            print(f"- Inference: {completed_item['inference']}")
        if "cardinality" in completed_item:
            print(f"- Cardinality: {completed_item['cardinality']}")
        if "data_type" in completed_item:
            print(f"- Data type: {completed_item['data_type']}")

        print()
        return completed_item


    def __parse_streamed_output(self, prompt, user_choice, user_input_entity1, user_input_entity2="", is_provided_class_source=True):
        assistant_message = ""
        items = []
        item = ""
        is_item_start = False
        is_skip_parsing = False
        new_lines_in_a_row = 0
        last_char = ''
        self.end_parsing_prematurely = False
        opened_square_brackets = 0

        for text in self.llm(prompt, stream=True):
            assistant_message += text
            if is_skip_parsing:
                continue

            text = text.replace("'", "") # Edit apostrophes for now by deleting them
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
                    # If something weird starts happening with the LLM this premature return might be the cause
                    if opened_square_brackets == 0:
                        return (items, assistant_message)
                
                # Return when LLM gets stuck in printing only new lines
                if new_lines_in_a_row > 3:
                    print("Warning: too many new lines")
                    return (items, assistant_message)
                
                if is_item_start:
                    item += char
                
                if char == "}" and item != '':
                    is_item_start = False
                    completed_item = self.__parse_item(item, items, user_choice, is_provided_class_source, user_input_entity1, user_input_entity2)

                    if self.end_parsing_prematurely:
                        print(f"Ending parsing prematurely: {completed_item}")
                        return (items, assistant_message)
                        
                    items.append(completed_item)
                    item = ""
                
                last_char = char
        
        if len(items) != ITEMS_COUNT:
            # LLM sometimes does not properly finish the JSON object
            # So try to finish the object by appending the last curly bracket
            if is_item_start:
                item += '}'
                completed_item = self.__parse_item(item, items, user_choice, is_provided_class_source, user_input_entity1)
                items.append(completed_item)

            #print(f"\nFull message: {assistant_message}")
    
        if is_skip_parsing:
            print(f"\nFull message: {assistant_message}")
        
        print(f"\nFull message: {assistant_message}")

        # For debugging return also the raw assistant message
        return (items, assistant_message)
    

    def suggest(self, entity1, entity2, user_choice, count_items_to_suggest, conceptual_model, domain_description):

        entity1 = entity1.strip()

        if IS_IGNORE_DOMAIN_DESCRIPTION:
            domain_description = ""

        is_domain_description = domain_description != ""

        self.messages = []
        self.__append_default_messages_for_suggestions(user_choice=user_choice, is_domain_description=is_domain_description)        

        if TAKE_ONLY_RELEVANT_INFO_FROM_DOMAIN_DESCRIPTION:
            queries = [f"Info about {entity1}"]
            domain_description = self.embeddings.remove_unsimilar_text(queries, domain_description)

        times_to_repeat = count_items_to_suggest
        is_elipsis = False
        if is_domain_description:
            times_to_repeat = 2
            is_elipsis = True

        inference_prompt = "inference from which exact text in the following text was it inferred"
        #inference_prompt = "inference by copying the following text and inserting the symbol < to the start of the part from which it was inferred and inserting the symbol > to the end of the part from which it was inferred"
        #inference_prompt = "inference by copying the following text and leaving only the part from which it was inferred"


        if user_choice == ATTRIBUTES_STRING:

            if not is_domain_description:
                prompt = f'What attributes does this entity: "{entity1}" have? '
                prompt += f'Output exactly {str(count_items_to_suggest)} attributes in JSON format like this: '  
            
            else:
                prompt = f'Solely based on the following text which attributes does the entity: "{entity1}" have? '

                #prompt += "If you find an attribute which looks more like a relationship then it is not an attribute. "
                prompt += f'Output only those attributes which you are certain about in JSON format like this: '

            is_description = True
            if is_description:
                if not is_domain_description:
                    prompt += TextUtility.build_json(names=["name", "description"], descriptions=["* attribute name", "* attribute description"], times_to_repeat=times_to_repeat, is_elipsis=is_elipsis)
                else:
                    #prompt += TextUtility.build_json(names=["name", "inference"], descriptions=["* attribute name", "* attribute inference from which exact text in the following text was it inferred"], times_to_repeat=times_to_repeat, is_elipsis=is_elipsis)
                    prompt += TextUtility.build_json(names=["name", "inference", "data_type"], descriptions=["* attribute name", f"* attribute {inference_prompt}", "* attribute data type"], times_to_repeat=times_to_repeat, is_elipsis=is_elipsis)

            else:
                prompt += TextUtility.build_json(names=["name"], descriptions=["* attribute name"], times_to_repeat=times_to_repeat, is_elipsis=is_elipsis)
        
        elif user_choice == RELATIONSHIPS_STRING:

            if not is_domain_description:
                prompt = f'Which relationships does the source entity: "{entity1}" have? Output exactly {str(count_items_to_suggest)} relationships in JSON format like this: '

            else:
                prompt = f'Solely based on the following text which relationships does this entity: "{entity1}" have? '

                #prompt += f'Always make sure that the entity: "{entity_name}" is the source entity in all the relationships. '
                #prompt += f'Output only those relationships which you are certain about in JSON format like this: '
                prompt += f'Output it in JSON format like this: '
            
            names = ["name", "source", "target", "sentence", "inference", "cardinality"]

            prompt += TextUtility.build_json(
                names=names,
                #descriptions=["* relationship name", f'"{entity1}"', f"* relationship target entity", "the short meaningful sentence for the * relationship"], times_to_repeat=times_to_repeat, is_elipsis=is_elipsis)
                descriptions=["* relationship name", f'"{entity1}"', f"* relationship target entity", "the short meaningful sentence for the * relationship", f"* relationship {inference_prompt}", "* relationship cardinality"], times_to_repeat=times_to_repeat, is_elipsis=is_elipsis)

    
        

        elif user_choice == RELATIONSHIPS_STRING_TWO_ENTITIES:
            if not is_domain_description:
                prompt = 'What relationships are between source entity "' + entity1 + '" and target entity "' + entity2 + '"? '
                #prompt += 'Output exactly ' + str(count_items_to_suggest) + ' relationships in JSON format like this: [{"name": first relationship name where "' + source_entity + '" is the source entity and "' + target_entity + '" is the target entity, "sentence": short meaningful sentence where you put the first relationship name in between the source entity and the target entity in this order}, {"name": second relationship name where "' + source_entity + '" is the source entity and "' + target_entity + '" is the target entity, "sentence": short meaningful sentence where you put the first relationship name in between the source entity and the target entity in this order}, ...]. '
                #prompt += 'Output exactly ' + str(count_items_to_suggest) + ' relationships in JSON format like this: [{"name": first relationship name where "' + source_entity + '" is the source entity and "' + target_entity + '" is the target entity, "sentence": the short meaningful sentence for the first relationship}, {"name": second relationship name where "' + source_entity + '" is the source entity and "' + target_entity + '" is the target entity, "sentence": the short meaningful sentence for the first relationship}, ...]. '
                prompt += 'Output exactly ' + str(count_items_to_suggest) + ' relationships in JSON format like this: '

            else:
                prompt = f'Solely based on the following text which relationships are between the entity "{entity1}" and the entity "{entity2}"? '

                prompt += f'Output only those relationships which you are certain about in JSON format like this: '


            names = ["name", "source", "target", "sentence", "inference", "cardinality"]
            #prompt += JSONBuilder.build(names=["name", "source", "target", "sentence"], descriptions=[f'* relationship name where "{entity1}" is the source entity and "{entity2}" is the target entity', f'"{entity1}"', f'"{entity2}"', f'the short meaningful sentence for the first relationship where the source entity "{entity1}" comes first then follows the relationship name and then follows the target entity "{entity2}"'], times_to_repeat=times_to_repeat, is_elipsis=is_elipsis)
            #prompt += JSONBuilder.build(names=["name", "source", "target", "sentence"], descriptions=[f'* relationship name', 'the source entity', 'the target entity', f'the short meaningful sentence for the first relationship where the source entity comes first then follows the relationship name and then follows the target entity'], times_to_repeat=times_to_repeat, is_elipsis=is_elipsis)
            prompt += TextUtility.build_json(
                names=names,
                descriptions=[f'* relationship name', 'the source entity', 'the target entity', f'the short meaningful sentence for the first relationship where the source entity comes first then follows the relationship name and then follows the target entity', f"* relationship {inference_prompt}", "* relationship cardinality"], times_to_repeat=times_to_repeat, is_elipsis=is_elipsis)


        elif user_choice == PROPERTIES_STRING:
            if not is_domain_description:
                #prompt = f'What properties does this entity: "{entity1}" have? '
                prompt = f'What properties could be relevant for a conceptual model of a "{entity1}"? '
                prompt += f'Output exactly {str(count_items_to_suggest)} of those properties in JSON format exactly like this: '
            
            else:
                prompt = f'Solely based on the following text which properties does the entity: "{entity1}" have? '
                prompt += f'Output only those properties which you are certain about in JSON format like this: '

            if not is_domain_description:
                prompt += TextUtility.build_json(names=["name", "description"], descriptions=["* property name", "* property description"], times_to_repeat=times_to_repeat, is_elipsis=is_elipsis)
            else:
                prompt += TextUtility.build_json(names=["name", "inference", "data_type"], descriptions=["* property name", f"* property {inference_prompt}", "* property data type"], times_to_repeat=times_to_repeat, is_elipsis=is_elipsis)

        else:
            raise ValueError(f"Error: Undefined user choice: {user_choice}")
        
        if not is_domain_description:
            pass
        else:
            prompt += f". This is the following text: {domain_description}"
            #prompt += f'. And provide detailed explanation. This is the following text: {domain_description}'
            #prompt += f'. And provide detailed explanation. \n """{domain_description}"""'
        
        new_messages = self.messages.copy()
        new_messages.append({"role": "user", "content": prompt})

        llm_prompt = TextUtility.create_llm_prompt(self.model_type, new_messages)
        print(f"Sending this prompt to llm:\n{llm_prompt}\n")

        items, assistant_msg = self.__parse_streamed_output(llm_prompt, user_choice=user_choice, user_input_entity1=entity1, user_input_entity2=entity2)

        # For debugging prepend the prompt and the assistant msg
        items.insert(0, {"prompt": llm_prompt})
        items.insert(1, {"raw_assistant_msg": assistant_msg})
        return items


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
        print(f"Sending this prompt to llm:\n{llm_prompt}\n")

        for text in self.llm(prompt, stream=True):
            print(text, end="", flush=True)

        return ""