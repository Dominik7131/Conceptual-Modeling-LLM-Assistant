from ctransformers import AutoModelForCausalLM
import time
import json
import graph_drawer

model_id = "TheBloke/Llama-2-7B-Chat-GGUF"
model_file = "llama-2-7b-chat.q4_K_M.gguf"
llm = AutoModelForCausalLM.from_pretrained(model_id, model_file=model_file, model_type="llama", local_files_only=True, gpu_layers=100,
                                           temperature=0.0, context_length=4096, max_new_tokens=4096, batch_size=1024, threads=1)


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
            conversation.append(f" [/INST] {message['content'].strip()}</s><s>[INST] ")

    return startPrompt + "".join(conversation) + endPrompt

system = "You are expert at creating conceptual models in software engineering in JSON format solely based on the given input."

messages = [{"role": "system", "content": system}]

TEXT = "Entity school with attributes: name, address."
create_model = 'Create conceptual model solely based on the following text and output it in JSON format like this: {"entity": name of the entity, "attributes": [{"attribute": first attribute name}, {"attribute": second attribute name}], "relationships": [{"relationship": first relationship name}, {"relationship": second relationship name}]}. If in the given text there are no relationships output in the JSON object "relationships": []}. Output only the JSON format without any explanation. This is the following text: ' + TEXT

conceptual_model = '{"entity": "school", "attributes": [{"attribute": "name"}, {"attribute": "address"}], "relationships": []}'
conceptual_model_2 = '{"entity": "school", "attributes": [{"attribute": "location"}], "relationships": []}'

update_model = 'You are given this conceptual model: ' + conceptual_model + '. Now add to this conceptual model to the entity school an attribute: place. Leave the relationships unchanged. Output it in JSON format like this: {"entity": name of the entity, "attributes": [{"attribute": first attribute name}, {"attribute": second attribute name}], "relationships": [{"relationship": first relationship name}, {"relationship": second relationship name}]}. If there are no relationships output in the JSON object "relationships": []}. Output only the JSON format without any explanations.'

TEXT2 = 'Represent Professors and Students. They both have a name. There are also courses, which are taught by one or more professors, and are taken by five or more students. Each course has a name and a number of credits. Finally, Dormitory Units (DormUnit) can host between 1 and 4 students. Each DormUnit has a price.'
instruction = 'Solely based on the following text create a conceptual model with entities, attributes of those entities and with relationships in between those entities and output the whole result in JSON format like this: {"entity": first entity name, "attributes": [{"attribute": first attribute name, "description": first attribute description, "reason": first attribute reasoning how it was inferred from the given text}, {"attribute": second attribute name, "description": second attribute description, "reason": second attribute reasoning how it was inferred from the given text}], "relationships": [{"relationship": first relationship name, "source": name of the source entity in the first relationship, "target": name of the target entity in the first relationship}, {"relationship": second relationship name, "source": name of the source entity in the second relationship, "target": name of the target entity in the second relationship}]} {"entity": second entity name, "attributes": [{"attribute": first attribute name, "description": first attribute description, "reason": first attribute reasoning how it was inferred from the given text}, {"attribute": second attribute name, "description": second attribute description, "reason": second attribute reasoning how it was inferred from the given text}], "relationships": [{"relationship": first relationship name, "source": name of the source entity in the first relationship, "target": name of the target entity in the first relationship}, {"relationship": second relationship name, "source": name of the source entity in the second relationship, "target": name of the target entity in the second relationship}]}. Do not output anything else. This is the following text: ' + TEXT2


while True:

    #user_message = input("> ")

    #if user_message.lower() == "exit" or user_message.lower() == "quit" or user_message.lower() == "q":
    #    break

    user_message = instruction

    messages.append({"role": "user", "content": user_message})
    prompt = build_llama2_prompt(messages)

    #print("Prompt: " + prompt)

    assistant_message = ""
    time_start = time.time()
    is_skip_parsing = False
    is_JSON_start = False
    item = ""
    entities = {}
    closed_squared_brackets_count = 0
    is_last_bracket_closed_square_bracket = False

    for text in llm(prompt, stream=True):
        assistant_message += text
        if is_skip_parsing:
            print(text, end="", flush=True)
            continue
        
        for char in text:
            if char == '{':
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
    print(f"Assistant message: {assistant_message}")
    print(f"Time: {time_end - time_start:.2f} seconds")
    #graph_drawer.draw(entities)
    break