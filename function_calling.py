from ctransformers import AutoModelForCausalLM
import json
import time


model_id = "Trelis/Llama-2-7b-chat-hf-function-calling-v2"
model_file = "llama-2-7b-function-calling.Q3_K_M.gguf"

llm = AutoModelForCausalLM.from_pretrained(model_id, model_file=model_file, model_type="llama", local_files_only=True,
                                           gpu_layers=100, temperature=0.0, context_length=4096, max_new_tokens=4096, batch_size=1024, threads=1)

# Define the roles and markers for Llama2
B_FUNC, E_FUNC = "<FUNCTIONS>", "</FUNCTIONS>\n\n"
B_INST, E_INST = "[INST] ", " [/INST]"
B_SYS, E_SYS = "<<SYS>>\n", "\n<</SYS>>\n\n"


functionMetaData1 = {
    "function": "get_weather",
    "description": "Get the current weather for one city",
    "arguments": [
        {
            "name": "city",
            "type": "string",
            "description": "The city"
        }
    ]
}

functionMetaData2 = {
    "function": "get_weather",
    "description": "Get the current weather for a city",
    "arguments": [
        {
            "type": "object",
            "properties": {
                "city": {
                    "type": "string",
                    "description": "The city"
                    }
            }
        }
    ]
}

system_prompt = ""
user_prompt = "Get weather in Prague, London and Paris"

functionList = json.dumps(functionMetaData1) #+ json.dumps(functionMetaData2)

prompt = f"{B_FUNC}{functionList.strip()}{E_FUNC}{B_INST}{B_SYS}{system_prompt.strip()}{E_SYS}{user_prompt.strip()}{E_INST}\n\n"

#print(f"Prompt: {prompt}")

assistant_answer = llm(prompt)
print(f"Answer 1: {assistant_answer}")

user_prompt_2 = "In London it is sunny"

prompt = f"{B_FUNC}{functionList.strip()}{E_FUNC}{B_INST}{B_SYS}{system_prompt.strip()}{E_SYS}{user_prompt.strip()}{E_INST}{assistant_answer}{B_INST}{user_prompt_2}{E_INST}\n\n"

#print(f"Prompt: {prompt}")

assistant_answer_2 = llm(prompt)
print(f"Answer 2: {assistant_answer_2}")
