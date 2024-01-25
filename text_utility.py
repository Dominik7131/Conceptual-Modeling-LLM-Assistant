import re


ATTRIBUTES_STRING = "attributes"
RELATIONSHIPS_STRING = "relationships"
RELATIONSHIPS_STRING_TWO_ENTITIES = "relationships2"
PROPERTIES_STRING = "properties"

alphabets= "([A-Za-z])"
prefixes = "(Mr|St|Mrs|Ms|Dr)[.]"
suffixes = "(Inc|Ltd|Jr|Sr|Co)"
starters = "(Mr|Mrs|Ms|Dr|Prof|Capt|Cpt|Lt|He\s|She\s|It\s|They\s|Their\s|Our\s|We\s|But\s|However\s|That\s|This\s|Wherever)"
acronyms = "([A-Z][.][A-Z][.](?:[A-Z][.])?)"
websites = "[.](com|net|org|io|gov|edu|me)"
digits = "([0-9])"
multiple_dots = r'\.{2,}'


class TextUtility:

    def create_llm_prompt(model_type, messages):
        llm_prompt = ""
        if model_type == "llama":
            llm_prompt = TextUtility.build_llama2_prompt(messages)
        elif model_type == "openchat":
            llm_prompt = TextUtility.build_openchat_prompt(messages)
        else:
            raise ValueError(f"Error: Unknown model type '{model_type}'")
        return llm_prompt
    

    def build_llama2_prompt(messages):
        start_prompt = "<s>[INST] "
        end_prompt = " [/INST]"
        conversation = []
        for index, message in enumerate(messages):
            if message["role"] == "system" and index == 0:
                conversation.append(f"<<SYS>>\n{message['content']}\n<</SYS>>\n\n")
            elif message["role"] == "user":
                conversation.append(message["content"].strip())
            else:
                conversation.append(f" [/INST] {message['content'].strip()} </s><s>[INST] ")

        return start_prompt + "".join(conversation) + end_prompt


    def build_openchat_prompt(messages):
        user_start = "GPT4 Correct User: "
        #user_start = "GPT4 User: "
        assistant_start = "GPT4 Correct Assistant:"
        #assistant_start = "GPT4 Assistant:"
        end_of_turn = "<|end_of_turn|>"

        result = ""
        for index, message in enumerate(messages):
            if message["role"] == "system":
                if index != 0:
                    raise ValueError("Error: Non-first system message not implemented")
                result += message["content"]
                result += end_of_turn
    
            elif message["role"] == "user":
                result += user_start
                result += message["content"].strip()
                result += end_of_turn
                result += assistant_start
            else:
                result += message["content"].strip()
                result += end_of_turn
        
        return result
    
    def json_to_pretty_text(json_item, index, user_choice, ATTRIBUTES_STRING):

        result = ""
        result += f"{index + 1}: {json_item['name'].capitalize()}\n"

        if "description" in json_item:
            result += f"- Description: {json_item['description']}\n"


        if user_choice == ATTRIBUTES_STRING:
            if "inference" in json_item:
                result += f"- Inference: {json_item['inference']}\n"
            if "data_type" in json_item:
                result += f"- Data type: {json_item['data_type']}\n"

        else:
            if "source" in json_item:
                result += f"- Source: {json_item['source']}\n"
            if "target" in json_item:
                result += f"- Target: {json_item['target']}\n"
            if "sentence" in json_item:
                result += f"- Sentence: {json_item['sentence']}\n"
            if "inference" in json_item:
                result += f"- Inference: {json_item['inference']}\n"
            if "cardinality" in json_item:
                result += f"- Cardinality: {json_item['cardinality']}\n"
        
        return result

    def build_json(names, descriptions, times_to_repeat, is_elipsis=False):

        positions = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"]

        result = "["
        for i in range(times_to_repeat):
            result += '{'
            for j in range(len(names)):
                current_description = descriptions[j].replace('*', positions[i])
                result += '"' + names[j] + '": ' + current_description
                if j + 1 < len(names):
                    result += ', '
            result += '}'
            if i + 1 < times_to_repeat:
                result += ', '
        
        if is_elipsis:
            result += ", ..."
        result += "]"
        return result
    

    def build_json2(names, descriptions, times_to_repeat, is_elipsis=False):
        # like `build` but as an example show first JSON object, elipsis, last JSON object
        positions = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"]

        result = "["
        for i in range(times_to_repeat):
            result += '{'
            for j in range(len(names)):
                current_description = descriptions[j].replace('*', positions[i])
                result += '"' + names[j] + '": ' + current_description
                if j + 1 < len(names):
                    result += ', '
            result += '}'
            if i + 1 < times_to_repeat:
                result += ', '
        
        if is_elipsis:
            result += ", ... , {"
            for j in range(len(names)):
                    current_description = descriptions[j]
                    result += '"' + names[j] + '": ' + current_description
                    if j + 1 < len(names):
                        result += ', '

        result += "}]"
        return result


    def split_into_sentences(text: str) -> list[str]:
        # https://stackoverflow.com/a/31505798
        """
        Split the text into sentences.

        If the text contains substrings "<prd>" or "<stop>", they would lead 
        to incorrect splitting because they are used as markers for splitting.

        :param text: text to be split into sentences
        :type text: str

        :return: list of sentences
        :rtype: list[str]
        """
        text = " " + text + "  "
        text = text.replace("\n"," ")
        text = re.sub(prefixes,"\\1<prd>",text)
        text = re.sub(websites,"<prd>\\1",text)
        text = re.sub(digits + "[.]" + digits,"\\1<prd>\\2",text)
        text = re.sub(multiple_dots, lambda match: "<prd>" * len(match.group(0)) + "<stop>", text)
        if "Ph.D" in text: text = text.replace("Ph.D.","Ph<prd>D<prd>")
        text = re.sub("\s" + alphabets + "[.] "," \\1<prd> ",text)
        text = re.sub(acronyms+" "+starters,"\\1<stop> \\2",text)
        text = re.sub(alphabets + "[.]" + alphabets + "[.]" + alphabets + "[.]","\\1<prd>\\2<prd>\\3<prd>",text)
        text = re.sub(alphabets + "[.]" + alphabets + "[.]","\\1<prd>\\2<prd>",text)
        text = re.sub(" "+suffixes+"[.] "+starters," \\1<stop> \\2",text)
        text = re.sub(" "+suffixes+"[.]"," \\1<prd>",text)
        text = re.sub(" " + alphabets + "[.]"," \\1<prd>",text)
        if "”" in text: text = text.replace(".”","”.")
        if "\"" in text: text = text.replace(".\"","\".")
        if "!" in text: text = text.replace("!\"","\"!")
        if "?" in text: text = text.replace("?\"","\"?")
        text = text.replace(".",".<stop>")
        text = text.replace("?","?<stop>")
        text = text.replace("!","!<stop>")
        text = text.replace("<prd>",".")
        sentences = text.split("<stop>")
        sentences = [s.strip() for s in sentences]
        if sentences and not sentences[-1]: sentences = sentences[:-1]
        return sentences


    def split_file_into_chunks(file_name):
        with open(file_name) as file:
            lines = [line.rstrip() for line in file]

        # Divide the text into: sentences and bullets
        sentences = [TextUtility.split_into_sentences(line) for line in lines]
        sentences = [x for xs in sentences for x in xs] # flatten sentences
        return sentences