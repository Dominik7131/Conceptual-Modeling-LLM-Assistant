from ctransformers import AutoModelForCausalLM
import json
import time

ITEMS_COUNT = 10
IS_JSON = True

# Define the model
model_id = "TheBloke/Llama-2-7B-Chat-GGUF"
model_file = "llama-2-7b-chat.q4_K_M.gguf"
llm = AutoModelForCausalLM.from_pretrained(model_id, model_file=model_file, model_type="llama", local_files_only=True, gpu_layers=100,
                                           temperature=0.0, context_length=4096, max_new_tokens=4096, batch_size=1024, threads=1)
#print(f"Config: Context length: {str(llm.context_length)}, Temperature: {str(llm.config.temperature)}, Max new tokens: {str(llm.config.max_new_tokens)}")


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


def handle_user_input(messages):
    global user_input_entity_name
    global prompt
    global user_choice
    print_help_message()

    user_input_entity_name = input("Insert entity name: ")

    user_message = user_input_entity_name

    if user_message.lower() == "exit" or user_message.lower() == "quit" or user_message.lower() == "q":
        return False

    if user_message.lower() == "print":
        print_conceptual_model(collected_info)
        return handle_user_input(messages)
    
    user_choice = "x" #input("Attributes or Relationships?: ").lower()

    if user_choice == "r":
        user_choice = "relationships"
    if user_choice == "a":
        user_choice = "attributes"

    if user_choice != "attributes" and user_choice != "relationships":
        #print("Warning: Unknown answer, selecting attributes")
        user_choice = "x"

    if IS_JSON:
        if user_choice == "attributes":
            user_message = 'What attributes does this entity have: \"' + user_message.strip() + '\"? Output exactly ' + str(ITEMS_COUNT) + ' ' + user_choice + ' with their description in a list of JSON, one JSON for each output object: [{"a": first ' + user_choice[:-1] + ' name, "d":first ' + user_choice[:-1] + ' description}, {"a":second ' + user_choice[:-1] + ' name, "d":second ' + user_choice[:-1] + ' description}, {"a":third ' + user_choice[:-1] + ' name, "d":third ' + user_choice[:-1] + ' description}]. Do not put quotation marks or escape character \ in the output fields. Do not output anything else.'
        elif user_choice == "relationships":
            user_message = 'What relationships does this source entity have: \"' + user_message.strip() + '\"? Output exactly ' + str(ITEMS_COUNT) + ' relationships with their description in a list of JSON, one JSON for each output element: [{"name": first relationship name, "source": first relationship source entity, "target": first relationship target entity}, {"name": second relationship name, "source": second relationship source entity, "target": second relationship target entity}]. Do not put quotation marks or escape character \ in the output fields. Do not output anything else.'
        else:
            #user_message = 'Solely based on the following text inside the quotation marks create a conceptual model with entities and relationships in between those entities: "A road vehicle is a motorized or non-motorized vehicle that is manufactured for the purpose of operating on roads for the transport of persons, animals or goods. A special vehicle is a vehicle manufactured for purposes other than road traffic, which may be operated on road roads if the conditions set forth in this Act are met. A trailer is a non-motorized road vehicle designed to be towed by another vehicle with which it is combined into a set. A historic vehicle is a vehicle that is registered in the register of historic and sports vehicles and to which a historic vehicle license has been issued." Output the attributes in JSON format like this: [{"name": first attribute name, "description": first attribute description}, {"name": second attribute name, "description": second attribute description}, {"name": third attribute name, "description": third attribute description}]. Output the relationships like this: [{"name": first relationship name, "source": first source entity, "target": first target entity}, {"name": second relationship name, "source": second source entity, "target": second target entity},{"name": third relationship name, "source": third source entity, "target": third target entity}]'
            #user_message = 'Solely based on the following text create a conceptual model with entities and relationships in between those entities and output the attributes in JSON format like this: [{"name": first attribute name, "description": first attribute description}, {"name": second attribute name, "description": second attribute description}, {"name": third attribute name, "description": third attribute description}] and output the relationships in JSON format like this: [{"name": first relationship name, "source": first source entity, "target": first target entity}, {"name": second relationship name, "source": second source entity, "target": second target entity},{"name": third relationship name, "source": third source entity, "target": third target entity}]. This is the following text: A road vehicle is a motorized or non-motorized vehicle that is manufactured for the purpose of operating on roads for the transport of persons, animals or goods.'
            user_message = 'Solely based on the following text create a conceptual model with source entities, with attributes of those entities and with relationships in between those entities and output the result in JSON format like this: [{"name": first entity name, "description": first entity description, "attributes:" [{"a": first attribute of the first entity}, {"a": second attribute of the first entity}], "relationships": [{"name": first relationship name, "source": first relationship source entity, "target": first relationship target entity}, {"name": second relationship name, "source": second relationship source entity, "target": second relationship target entity}], {"name": second entity name, "description": second entity description, "attributes:" [{"a": first attribute of the second entity}, {"a": second attribute of the second entity}], "relationships": [{"name": first relationship name, "source": first relationship source entity, "target": first relationship target entity}, {"name": second relationship name, "source": second relationship source entity, "target": second relationship target entity}]]. Do not output anything else. This is the following text: A road vehicle is a motorized or non-motorized vehicle that is manufactured for the purpose of operating on roads for the transport of persons, animals or goods.'

    else:
        user_message = f'Generate {str(ITEMS_COUNT)} {user_choice} and their description of this entity: {user_message.strip()}. Do not output anything else.'
        #user_message = f'In context of the entity {user_message.strip()} generate {str(ITEMS_COUNT)} {user_choice} and their descriptions. Do not output anything else.'
        #user_message = f'In context of the entity: {user_message.strip()}, generate {str(ITEMS_COUNT)} {user_choice}. For each relationship include the name of the target class. Do not output anything else.'
        #user_message = f'Entity: "{user_message.strip()}". Generate for this entity {str(ITEMS_COUNT)} {user_choice}.' #For each relationship write only the name of the connection and the name of the target class. The name of the target class can not be equal to the name of the given entity. Do not output anything else.'
        #user_message = f'Write {str(ITEMS_COUNT)} meaningful relationships between the entity "{user_message.strip()}" and other suitable entity. Do not output anything else.'




    forced_messages = messages.copy()
    forced_messages.append({"role": "user", "content": user_message})
    prompt = build_llama2_prompt(forced_messages)

    return True


def print_help_message():
    print("Options: \"q\" to exit, \"print\" to print the current conceptual model")


def print_conceptual_model(collected_info):
    print()
    for info in collected_info:
        print(f'Class name: {str(info)}')
        print("Attributes: ")
        for attribute in collected_info[info]["attributes"]:
            print(f'- {attribute["a"]}: {attribute["d"]}')

        print("Relationships: ")        
        for relationship in collected_info[info]["relationships"]:
            print(f'- {relationship["a"]}: {relationship["d"]}')
        print()

    #collected_info = {"School": {"attributes": [{'a': 'Name', 'd': 'The name of the school'}, {'a': 'Zip Code', 'd': 'The zip code of the school'}], "relationships": ["r1", "r2"]}}
    #print_conceptual_model(collected_info)
    #exit(0)

    #"Truck": {"Attributes": ["a1", "a2"], "Relationships": ["r1", "r2"]}
    # Get attributes of truck:
    # x = collected_info["Truck"]["Attributes"]

def handle_items_selection(entity_name):
    global collected_info
    global user_choice

    while True:
        selected_number = int(input("Type number to add attribute or -1 to continue: "))

        if selected_number == -1:
            break

        if selected_number >= 0 and selected_number < len(items):
            selected_item = items[selected_number]
        else:
            print("Invalid number")
            return
        
        if not entity_name in collected_info:
            collected_info[entity_name] = {"attributes": [], "relationships": []}
        
        collected_info[entity_name][user_choice].append(selected_item)
    

system = "You are an expert at listing attributes and relationships for a given entity."
messages = [{"role": "system", "content": system}]

user_first_msg = "What is the definition of conceptual model in software engineering?"
assistent_first_msg = "In software engineering, a conceptual model is a high-level representation of a system or problem domain that helps to organize and understand the key concepts, relationships, and constraints involved. It provides a framework for thinking about the problem space and can be used as a starting point for further analysis, design, and development. \
    A conceptual model typically includes: \
    Entities: The objects or concepts that are relevant to the problem domain. These may include users, systems, processes, data, etc. \
    Relationships: The connections between entities, such as associations, dependencies, or compositions. \
    Attributes: The characteristics or properties of entities and relationships."

messages.append({"role": "user", "content": user_first_msg})
messages.append({"role": "assistant", "content": assistent_first_msg})


collected_info = {}
print()

while True:
    user_input_entity_name = ""
    prompt = ""
    user_choice = ""
    is_continue = handle_user_input(messages)
    if not is_continue:
        break

    #print("Sending this prompt to llm: " + prompt)
    time_start = time.time()
    
    assistant_message = ""
    item = ""
    items = []
    is_item_start = False
    items_count = 0
    ljust_value = 40
    is_attribute_processing = user_choice == "attributes"

    is_skip_parsing = True
    header = user_choice.capitalize()[:-1].ljust(ljust_value + 4) + "Description"

    if IS_JSON:
        for text in llm(prompt, stream=True):
            assistant_message += text
            if is_skip_parsing:
                continue
            text = text.replace("'", "") # Edit apostrophes for now by deleting them
            for char in text:
                if char == "{":
                    is_item_start = True
                
                if is_item_start:
                    item += char
                
                if char == "}":
                    
                    if len(items) == 0:
                        print(header)

                    is_item_start = False
                    try:
                        completed_item = json.loads(item)
                    except ValueError:
                        print("Error: Cannot decode JSON: " + item)
                        exit(1)

                    if user_choice == "attributes":
                        item_name = completed_item['a'].ljust(ljust_value - len(str(items_count)) + 1)
                        print(f"{items_count + 1}: {item_name} {completed_item['d']}")
                    elif user_choice == "relationships":
                        print(f"{items_count + 1}: {completed_item['name']} | Source: {completed_item['source']} | Target: {completed_item['target']}")
                    
                    items.append(completed_item)
                    item = ""
                    items_count += 1
    else: # Plain text output
        # Every item is separated by a new line
        # Format: Number. Attribute/Relationship: Description
        is_header = True
        is_item_start = False
        is_description_start = False
        description = ""
        for text in llm(prompt, stream=True):
            assistant_message += text

            for char in text:
                if is_header and char == "\n":
                    is_header = False
                
                if is_description_start and char == "\n":
                    is_description_start = False

                    #item_name = completed_item['a'].ljust(ljust_value - len(str(attributes_count)) + 1)
                    description = description.lstrip()
                    print(f"{items_count}. {item}: {description}")
                    items.append({"a": item, "d": description})
                    items_count += 1
                    item = ""
                    description = ""

                if is_description_start:
                    description += char

                if is_item_start:
                    if char == ":":
                        is_description_start = True
                        is_item_start = False
                    else:
                        item += char

                if not is_header and not is_item_start and not is_description_start and char == ' ':
                    is_item_start = True
        
        # Process last line
        description = description.lstrip()
        print(f"{items_count}. {item}: {description}")
        items.append({"a": item, "d": description})
        items_count += 1

    time_end = time.time()
    print()
    print(f"Time: {time_end - time_start:.2f} seconds")

    #handle_items_selection(user_input_entity_name)

    print(f"Full message: {assistant_message}")
    if len(items) == 0:
        print("Warning: Unknown entity name")
