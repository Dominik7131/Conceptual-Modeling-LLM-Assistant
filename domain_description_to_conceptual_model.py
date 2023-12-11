from ctransformers import AutoModelForCausalLM
import json
import time
import graph_drawer

IS_ALL = False
IS_ENTITIES_ONLY = True
IS_ATTRIBUTES_ONLY = False
IS_RELATIONSHIPS_ONLY = False

IS_SAVE_TO_FILE = False

TEXT_CAR = ["A road vehicle is a motorized or non-motorized vehicle that is manufactured for the purpose of operating on roads for the transport of persons, animals or goods.",
"A special vehicle is a vehicle manufactured for purposes other than road traffic, which may be operated on road roads if the conditions set forth in this Act are met.",
"A trailer is a non-motorized road vehicle designed to be towed by another vehicle with which it is combined into a set.",
"A historic vehicle is a vehicle that is registered in the register of historic and sports vehicles and to which a historic vehicle license has been issued.",
"A vehicle system is any structural system of a vehicle that is subject to the technical requirements established by implementing legislation. A vehicle system is, for example, brakes or emission reduction devices.",
"A structural part of a vehicle is a part of a vehicle, the type of which must be approved independently of the vehicle, if so provided by the implementing legal regulation, and to which the technical requirements established by the implementing legal regulation apply. A structural part of a vehicle is, for example, a lamp.",
"A separate technical unit of a vehicle is a part whose type can be approved independently of the vehicle, but only in relation to one type of vehicle or several types of vehicles, if so provided by the implementing legal regulation, and to which the technical requirements established by the implementing legal regulation apply . A separate technical unit of the vehicle is, for example, the rear bumper of the vehicle, a fixed or replaceable superstructure of the vehicle.",
"A vehicle category is a group of vehicles that have the same technical conditions established by implementing legislation.",
]

TEXT = ""
for i in range(5): #range(len(TEXT_CAR)):
    TEXT += TEXT_CAR[i] + ' '

TEXT_SCHOOL = """
1. The following types of study programs are offered at the university:
a. bachelor,
b. master's degree, which follows on from the bachelor's study program,
c. a master's degree that does not follow on from a bachelor's study program,
d. doctoral.

2. The profile of a bachelor's or master's study program can be
a. professionally oriented with an emphasis on mastering the practical skills needed to perform the profession supported by the necessary theoretical knowledge, or
b. academically focused with an emphasis on acquiring the theoretical knowledge needed for the performance of the profession, including application in creative activities, and also providing space for acquiring the necessary practical skills.
"""

TEXT_SCHOOL2 = """
Represent Professors and Students.
They both have a name.
Then there are also courses, which are taught by one or more professors, and are taken by five or more students.
Each course has a name and a number of credits.
Finally, Dormitory Units can host between 1 and 4 students.
Each Dormitory Unit has a price.
"""

TEXT = TEXT_SCHOOL2


# Define the model
model_id = "TheBloke/Llama-2-7B-Chat-GGUF"
model_file = "llama-2-7b-chat.Q5_K_M.gguf"
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


def print_conceptual_model(entities):
    print()
    for entity in entities:
        print(f"Entity: {entity}")
        for attribute in entities[entity]["attributes"]:
            print(f"- Attribute: {attribute['attribute']}")
            print(f"-- Description: {attribute['description']}")
            print(f"-- Reason: {attribute['reason']}")
            print()

        print()

        for relationship in entities[entity]["relationships"]:
            print(f"- Relationship: {relationship['relationship']}")
            print(f"-- Description: {relationship['description']}")
            print(f"-- Source entity: {relationship['source']}")
            print(f"-- Target entity: {relationship['target']}")
            print(f"-- Reason: {relationship['reason']}")
            print()
        
        print()
    return
    

system = "\nYou are an expert at creating conceptual models in software engineering from a given text. Precisely follow the user's instructions."
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
entities = {}
current_entity = ""
current_key = 0

while True:
    # All at the same time
    user_message = 'Solely based on the following text create a conceptual model with entities, attributes of those entities and with relationships in between those entities and output the whole result in JSON format like this: {"entity": first entity name, "attributes": [{"attribute": first attribute name, "description": first attribute description, "reason": first attribute reasoning how it was inferred from the given text}, {"attribute": second attribute name, "description": second attribute description, "reason": second attribute reasoning how it was inferred from the given text}], "relationships": [{"relationship": first relationship name, "source": name of the source entity in the first relationship, "target": name of the target entity in the first relationship}, {"relationship": second relationship name, "source": name of the source entity in the second relationship, "target": name of the target entity in the second relationship}]} {"entity": second entity name, "attributes": [{"attribute": first attribute name, "description": first attribute description, "reason": first attribute reasoning how it was inferred from the given text}, {"attribute": second attribute name, "description": second attribute description, "reason": second attribute reasoning how it was inferred from the given text}], "relationships": [{"relationship": first relationship name, "source": name of the source entity in the first relationship, "target": name of the target entity in the first relationship}, {"relationship": second relationship name, "source": name of the source entity in the second relationship, "target": name of the target entity in the second relationship}]}. Do not output anything else. This is the following text: ' + TEXT

    # With added reasoning but the JSON format is incorrect
    #user_message = 'Solely based on the following text create a conceptual model with entities, attributes of those entities and with relationships in between those entities and output the whole result in JSON format like this: {"entity": first entity name, "attributes": [{"attribute": first attribute name, "description": first attribute description, "reason": first attribute reasoning how it was inferred from the given text}, {"attribute": second attribute name, "description": second attribute description, "reason": second attribute reasoning how it was inferred from the given text}], "relationships": [{"relationship": first relationship name, "source": name of the source entity in the first relationship, "target": name of the target entity in the first relationship, "description": first relationship description, "reason": first relationship reasoning how it was inferred from the given text}, {"relationship": second relationship name, "source": name of the source entity in the second relationship, "target": name of the target entity in the second relationship, "description": second relationship description, "reason": second relationship reasoning how it was inferred from the given text}]} {"entity": second entity name, "attributes": [{"attribute": first attribute name, "description": first attribute description, "reason": first attribute reasoning how it was inferred from the given text}, {"attribute": second attribute name, "description": second attribute description, "reason": second attribute reasoning how it was inferred from the given text}], "relationships": [{"relationship": first relationship name, "source": name of the source entity in the first relationship, "target": name of the target entity in the first relationship, "description": first relationship description, "reason": first relationship reasoning how it was inferred from the given text}, {"relationship": second relationship name, "source": name of the source entity in the second relationship, "target": name of the target entity in the second relationship, "description": second relationship description, "reason": second relationship reasoning how it was inferred from the given text}]}. Do not output anything else. This is the following text: ' + TEXT

    # Get list of entities from the given text
    if IS_ENTITIES_ONLY:
        total_time_start = time.time()
        #user_message = 'Solely based on the following text write which all possible entities it has and output all of them in JSON format exactly like this: {"entity": first entity name}, {"entity": second entity name}. Do not output anything else. This is the following text: ' + TEXT
        # Explicit singular form
        user_message = 'Solely based on the following text write which all entities it has and output all of them in JSON format exactly like this: {"entity": first entity name in singular}, {"entity": second entity name in singular}, {"entity": third entity name in singular}, ... . Do not output anything else. This is the following text: ' + TEXT


    # Get list of attributes for the entities from the given text
    if IS_ATTRIBUTES_ONLY:
        if current_key < len(entities):
            current_entity = list(entities.keys())[current_key]
            #user_message = 'Solely based on the following text write which attributes does the entity: "' + current_entity + '" have and output all of them in JSON format like this: {"attribute": first attribute name, "description": first attribute description, "reason": first attribute reasoning how it was inferred from the given text}, {"attribute": second attribute name, "description": second attribute description, "reason": second attribute reasoning how it was inferred from the given text}. Do not output anything else. This is the following text: ' + TEXT
            # Explicit singular form
            user_message = 'Solely based on the following text write which attributes does the entity: "' + current_entity + '" have and output all of them in JSON format like this: {"attribute": first attribute name in singular, "description": first attribute description, "reason": first attribute reasoning how it was inferred from the given text}, {"attribute": second attribute name in singular, "description": second attribute description, "reason": second attribute reasoning how it was inferred from the given text}, ... . Do not output anything else. This is the following text: ' + TEXT

            current_key += 1
        else:
            IS_ATTRIBUTES_ONLY = False
            IS_RELATIONSHIPS_ONLY = True
            current_key = 0

    # Get list of relationships for the entities from the given text
    if IS_RELATIONSHIPS_ONLY:
        if current_key < len(entities):
            current_entity = list(entities.keys())[current_key]
            # Explicit singular form
            user_message = 'Solely based on the following text write which relationships does the source entity: "' + current_entity + '" have and output all of them in JSON format like this: {"relationship": first relationship name in singular, "description": description of the first relationship, "source": first relationship source entity in singular, "target": first relationship target entity in singular, "reason": first relationship reasoning how it was inferred from the given text}, {"relationship": second relationship name in singular, "description": description of the second relationship, "source": second relationship source entity in singular, "target": second relationship target entity in singular, "reason": second relationship reasoning how it was inferred from the given text}, ... . Make sure to always fill in the name of the target entity in singular. Do not output anything else. This is the following text: ' + TEXT
            current_key += 1
        else:
            print_conceptual_model(entities)
            total_time_end = time.time()
            print(f"Time: {total_time_end - total_time_start:.2f} seconds")

            if (IS_SAVE_TO_FILE):
                file_name = f"output/{time.strftime('%Y-%m-%d-%H-%M-%S')}.json"
                with open(file_name, 'w') as file:
                    json.dump(entities, file)

            graph_drawer.draw(entities)
            break

    forced_messages = messages.copy()
    forced_messages.append({"role": "user", "content": user_message})
    prompt = build_llama2_prompt(forced_messages)

    if IS_ENTITIES_ONLY:
        print("Sending this prompt to llm: " + prompt)

    time_start = time.time()

    assistant_message = ""
    item = ""
    items = []
    is_item_start = False
    items_count = 0

    is_last_bracket_closed_square_bracket = False
    is_JSON_start = False
    is_skip_parsing = False
    new_lines_in_a_row = 0
    last_char = ''
    is_end = False
    closed_squared_brackets_count = 0

    for text in llm(prompt, stream=True):
        assistant_message += text
        if is_skip_parsing:
            print(text, end="", flush=True)
            continue
        
        if is_end:
            break

        if IS_ENTITIES_ONLY or IS_ATTRIBUTES_ONLY or IS_RELATIONSHIPS_ONLY:
            for char in text:
                if is_item_start:
                    item += char

                if char == '\n' and last_char == '\n':
                    new_lines_in_a_row += 1

                    if new_lines_in_a_row > 3:
                        print("Warning: too many new lines")
                        is_end = True
                        break
                else:
                    new_lines_in_a_row = 0

                if not is_item_start and char == '{':
                    is_item_start = True
                    item += char
                
                last_char = char
                
                if is_item_start and char == '}':
                    # End of one JSON item
                    is_item_start = False
                    try:
                        completed_item = json.loads(item)
                        #items.append(completed_item)
                        item = ""
                        if IS_ENTITIES_ONLY:
                            #print(f"Entity: {completed_item['entity']}")
                            entities[completed_item['entity']] = {"attributes": [], "relationships": []}
                            #print()

                        elif IS_ATTRIBUTES_ONLY:
                            #print(f"Current entity: {current_entity}")
                            #print(f"Attribute: {completed_item['attribute']}")
                            #print(f"- Description: {completed_item['description']}")
                            #print(f"- Reason: {completed_item['reason']}")
                            entities[current_entity]["attributes"].append({"attribute": completed_item['attribute'], "description": completed_item['description'], "reason": completed_item['reason']})

                        elif IS_RELATIONSHIPS_ONLY:
                            #print(f"Current entity: {current_entity}")
                            #print(f"Relationship: {completed_item['relationship']}")
                            #print(f"- Description: {completed_item['description']}")
                            #print(f"- Source entity: {completed_item['source']}")
                            #print(f"- Target entity: {completed_item['target']}")
                            #print(f"- Reason: {completed_item['reason']}")
                            entities[current_entity]["relationships"].append({"relationship": completed_item['relationship'], "description": completed_item['description'], "source": completed_item['source'], "target": completed_item['target'], "reason": completed_item['reason']})

                    except ValueError:
                        print("Error: Cannot decode JSON: " + item)
        elif IS_ALL:
            for char in text:
                if not is_JSON_start and char == '{':
                    is_JSON_start = True
                
                if is_JSON_start:
                    item += char

                if char == ']':
                    closed_squared_brackets_count += 1
                    is_last_bracket_closed_square_bracket = True
                
                # Incorrectly formated JSON
                if closed_squared_brackets_count == 2 and char == ',':
                    char = '}'
                    item = item[:-1]
                    item += char
                
                if is_last_bracket_closed_square_bracket and char == '}':
                    # End of one JSON item
                    try:
                        completed_item = json.loads(item)

                        if closed_squared_brackets_count == 2:
                            item = "{"
                            closed_squared_brackets_count = 0
                        else:
                            item = ""


                        if 'entity' not in completed_item:
                            continue

                        print(f"{completed_item['entity']}")
                        print(f"Attributes: {completed_item['attributes']}")
                        print(f"Relationships: {completed_item['relationships']}")
                        print()
                        entities[completed_item['entity']] = {"attributes": completed_item['attributes'], "relationships": completed_item['relationships']}

                    except ValueError:
                        print("Error: Cannot decode JSON: " + item)
                
                if char == '{' or char == '[':
                    is_last_bracket_closed_square_bracket = False



    time_end = time.time()
    print()
    print(f"Time: {time_end - time_start:.2f} seconds")

    #print(f"Full message: {assistant_message}")

    if IS_ENTITIES_ONLY:
        IS_ENTITIES_ONLY = False
        IS_ATTRIBUTES_ONLY = True
    
    if IS_ALL:
        graph_drawer.draw(entities)
        break