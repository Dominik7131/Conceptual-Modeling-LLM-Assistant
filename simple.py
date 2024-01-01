from ctransformers import AutoModelForCausalLM
from text_utility import TextUtility
import time

model_id = "TheBloke/Llama-2-7B-Chat-GGUF"
model_file = "llama-2-7b-chat.Q5_K_M.gguf"
llm = AutoModelForCausalLM.from_pretrained(model_id, model_file=model_file, model_type="llama", local_files_only=True, gpu_layers=100,
                                           temperature=0.0, context_length=4096, max_new_tokens=4096, batch_size=1024, threads=1)


system = """
You are a helpful, respectful and honest assistant. Always answer as helpfully as possible, while being safe. Your answers should not include any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. Please ensure that your responses are socially unbiased and positive in nature.

If a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don't know the answer to a question, please don't share false information.
"""

messages = [{"role": "system", "content": system}]

while True:

    user_message = input("> ")

    if user_message.lower() == "exit" or user_message.lower() == "quit" or user_message.lower() == "q":
        break
    
    if user_message.lower() == "test":
        user_message = "What is the definition of conceptual model in software engineering?"

    messages.append({"role": "user", "content": user_message})
    prompt = TextUtility.build_llama2_prompt(messages)

    print("Prompt: " + prompt)

    time_start = time.time()
    print(llm(prompt))
    time_end = time.time()

    print()
    print(f"Time: {time_end - time_start:.2f} seconds")