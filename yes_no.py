from ctransformers import AutoModelForCausalLM
import time

model_id = "TheBloke/Llama-2-7B-Chat-GGUF"
model_file = "llama-2-7b-chat.Q5_K_M.gguf" #"llama-2-7b-chat.q4_K_M.gguf"
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
Do not make anything up if you do not know the answer say that you do not know.
"""

messages = [{"role": "system", "content": system}]

TEXT_SCHOOL2 = """
Represent Professors and Students.
They both have a name.
Then there are also courses, which are taught by one or more professors, and are taken by five or more students.
Each course has a name and a number of credits.
Dormitory Units can host between 1 and 4 students. Each Dormitory Unit has a price.
"""

TEXT_SCHOOL3 = """
Each course is taken by five or more students.
"""

derived_text_1 = "A professor hosts Dormitory units."
derived_text_2 = "A student takes one or more courses."

#test = 'In range from 1 to 10 how much is it probable that the information: "' + derived_text_2 + '" is semantically inferred solely from this text: "' + TEXT_SCHOOL2 + '"? Do not provide any additional text output. Do not provide any explanation. Output only your estimation in JSON format like this: {"probability": "probability of the given text being inferred solely from this text"}.'
test = 'From 1 to 10 based on the meaning of this information: "' + derived_text_2 + '" how much is it probable that this information was implicitly inferred solely from this text: "' + TEXT_SCHOOL2 + '"? Do not provide any additional text output. Do not provide any explanation. Output only your estimation in JSON format like this: {"probability": "probability of the given text being inferred solely from this text"}.'
#test = 'Solely based on the meaning of the following text rate from 1 to 10 how much is it probable that the information "' + derived_text_1 + '" is derived from the following text: ' + TEXT_SCHOOL2

#test = 'Can the information: "A student takes one or more courses." be inferred solely based on this text: "Each course is taken by five or more students."'



while True:
    user_message = test

    if user_message.lower() == "exit" or user_message.lower() == "quit" or user_message.lower() == "q":
        break
    
    if user_message.lower() == "test":
        user_message = "What is the definition of conceptual model in software engineering?"

    messages.append({"role": "user", "content": user_message})
    prompt = build_llama2_prompt(messages)

    print(f"Prompt: {prompt}\n")

    time_start = time.time()
    print(llm(prompt))
    time_end = time.time()

    print()
    print(f"Time: {time_end - time_start:.2f} seconds")
    break