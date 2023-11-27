from ctransformers import AutoModelForCausalLM
import time

IS_SAVE_TO_FILE = True

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

system = """
You are an expert at creating models in PlantUML code from a given text.
"""

messages = [
    {"role": "system", "content": system}
]


#user_message = input("> ")

user_message = "Consider the following scenario and represent it as a UML class diagram in PlantUML code and do not add any information that is not described here and do not add any explanations and only show the PlantUML code: "
user_message += "Class A has three subclasses: B, C and D. B and D both have a name and a date as attributes. B is also a subclass of G, which is related to at least one or more classes of type H. G has an attribute named X and H has an attribute named Omega."

messages.append({"role": "user", "content": user_message})
prompt = build_llama2_prompt(messages)

#print("Prompt: " + prompt)

time_start = time.time()
output = llm(prompt, stream=False)

is_plant_uml_start = False
header_chars = 0

for char in output:
    if char == '@':
        break
    else:    
        header_chars += 1

plant_uml_code = output[header_chars:-3]
if plant_uml_code[-7:] != "@enduml":
    plant_uml_code += "@enduml"

if (IS_SAVE_TO_FILE):
    file_name = f"output/plantUML/{time.strftime('%Y-%m-%d-%H-%M-%S')}.txt"
    with open(file_name, 'w') as file:
        file.write(plant_uml_code)

#print(text, end="", flush=True)
#print(plant_uml_code)
time_end = time.time()

print()
print(f"Time: {time_end - time_start:.2f} seconds")