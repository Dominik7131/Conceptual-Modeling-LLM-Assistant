import re
import os
import logging
from difflib import SequenceMatcher
from enum import Enum

# TODO: Change to enum
class UserChoice(Enum):
    ATTRIBUTES = "attributes"
    RELATIONSHIPS = "relationships"
    RELATIONSHIPS2 = "relationships2"
    ENTITIES = "entities"
    ONLY_DESCRIPTION = "description"
    SUMMARY1 = "summary1"
    SUMMARY2 = "summary2"

ATTRIBUTES_STRING = "attributes"
RELATIONSHIPS_STRING = "relationships"
RELATIONSHIPS_STRING_TWO_ENTITIES = "relationships2"
ENTITIES_STRING = "entities"
ONLY_DESCRIPTION = "description"

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
        # llama2 prompt format: https://huggingface.co/blog/llama2#how-to-prompt-llama-2
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


    def messages_prettify(messages):
        result = ""
        for message in messages:
            result += f"{message['role']}: {message['content']}\n"
        
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


    def is_camel_case(string, can_be_snake_case = True):
        if not string:
            return False
        
        if ' ' in string:
            return False
        
        if string.isspace():
            return False
        
        if can_be_snake_case and '_' in string:
            return False

        return True


    def convert_name_to_standard_convention(name):
        # Convert text in any convention to a lower-cased text where each word is delimited with a space

        # TODO: Convert camel case starting with a small letter
        # E.g.: periodOfInterruptionOfInsurance, dateOfChangeOfInsurance

        if name == "Capitalized Name":
            print("")
        
        if not name:
            return ""

        # Detect snake_case_convention
        if name[0].islower() and '_' in name:
            name_parts = name.split('_')
            result = ""

            for name_part in name_parts:
                result += name_part + ' '
            
            result = result.rstrip() # Remove trailing space
            return result.lower()
        
        # Detect CamelCase
        if TextUtility.is_camel_case(name, can_be_snake_case=False):
            result = ""

            for index, char in enumerate(name):
                if index == 0:
                    result += char
                    continue

                if (char.isupper()):
                    result += ' ' + char.lower()
                else:
                    result += char

            return result.lower()

        return name.lower()


    def create_query(entity):
        #query = f'What attributes does \"{entity}\" have?'
        #query = f"Information about {entity}"
        query = f"What are the information about {entity}?"
        return query
    
    def is_bullet_point(text):
        # TODO: Implement for all possible bullet points -- e.g. I), a), 15), *, ...
        return text[0] == '-'


    def split_text_into_chunks(domain_description):
        # Divide the text into: sentences and bullets
        lines = domain_description.split(sep='\n')
        lines = list(filter(None, lines)) # Remove empty elements
        sentences = [TextUtility.split_into_sentences(line) for line in lines]
        sentences = [x for xs in sentences for x in xs] # flatten sentences
        
        edited_sentences = []
        text_before_bullet_points = ""
        chunk_before_bullet_points_index = 0
        is_bullet_point_processing = False

        is_bullet_point_enhancement = True
        if not is_bullet_point_enhancement:
            return sentences, sentences, [], []
        
        is_bullet_point_list = []
        title_references = []

        # For each bullet point prepend text from row before these bullet points
        # TODO: Refactor: no need to do for example "edited_sentences.append()"
        # TODO: Do TextUtility.is_bullet_point() testing only once not in two different parts of code
        for index, sentence in enumerate(sentences):

            if index == 0:
                edited_sentences.append(sentence)
                is_bullet_point_list.append(False)
                title_references.append(-1)
                continue

            if is_bullet_point_processing:
                if TextUtility.is_bullet_point(sentence):
                    edited_sentences.append(f"{sentence[:2]}{text_before_bullet_points} {sentence[2:]}")
                    is_bullet_point_list.append(True)
                    title_references.append(chunk_before_bullet_points_index)
                else:
                    is_bullet_point_processing = False
                    edited_sentences.append(sentence)
                    is_bullet_point_list.append(False)
                    title_references.append(-1)
                continue

            if TextUtility.is_bullet_point(sentence):
                text_before_bullet_points = sentences[index - 1]
                chunk_before_bullet_points_index = index - 1
                # TODO: if `text_before_bullet_points` is a bullet point then skip the current group of bullet points
                #   - for example this can happen when the file starts with I), II), III), ...
                edited_sentences.append(f"{sentence[:2]}{text_before_bullet_points} {sentence[2:]}")
                is_bullet_point_processing = True
                is_bullet_point_list.append(True)
                title_references.append(chunk_before_bullet_points_index)
                continue

            edited_sentences.append(sentence)
            is_bullet_point_list.append(False)
            title_references.append(-1)

        return edited_sentences, sentences, is_bullet_point_list, title_references


    # TODO: Add sliding window to each sentence
    def split_file_into_chunks_sliding_window(file_name):
        with open(file_name) as file:
            lines = [line.rstrip() for line in file]

        # Divide the text into: sentences and bullets
        sentences = [TextUtility.split_into_sentences(line) for line in lines]
        sentences = [x for xs in sentences for x in xs] # flatten sentences
        return sentences
    

    def find_text_in_domain_description(inference, domain_description):
        # TODO: Add domain description as an method argument

        # Convert all text to lower-case as LLM sometimes does not generate case-sensitive inference
        domain_description = domain_description.lower()
        
        # Split inference if it contains more inferences:
        # E.g.: "The insurance contract shall always contain... the limit of the insurance benefit..."
        # -> ["The insurance contract shall always contain", "the limit of the insurance benefit"]
        result = []

        inference_parts = inference.split(sep="...")
        inference_parts = list(filter(None, inference_parts)) # Remove empty strings

        inference_parts_total = len(inference_parts)
        inference_parts_found = 0

        for inference_part in inference_parts:
            inference_part = inference_part.lower().strip()
            is_inference_found = False

            # TODO: Do not iterate from 0 every time because each inference part should not be at index < the previous part index
            for i in range(len(domain_description)):
                # Append all occurencies of the `inference_part` in the `domain_description`
                if domain_description[i:].startswith(inference_part):
                    is_inference_found = True
                    result.append(i)
                    result.append(i + len(inference_part))

            # TODO: Backup plan: if an inference is not found at least try to find some relevant setence with lemmatization
            # Relevant sentece = sentence that contains all lemmas in `inference_part` (probably except brackets, punctuation etc.)        
            if is_inference_found:
                inference_parts_found += 1
            else:
                new_result = TextUtility.findSubstrings(inference_part, domain_description)
                if new_result:
                    is_inference_found = True
                    for inference_index in new_result:
                        result.append(inference_index)
                else:
                    print(f"Warning: inference not found: {inference_part}")


        # TODO: Fix bug with too many inference indexes
        if len(result) > 10:
            result = []

        return result, inference_parts_found, inference_parts_total


    def show_inference_in_domain_description(inference_indexes, domain_description):
        # TODO: Add domain description as an method argument
        # E.g. inference_indexes = [4, 10, 20, 24]

        from termcolor import cprint

        start_at_index = 0
        
        for i in range(0, len(inference_indexes), 2):
            inference_index_start = inference_indexes[i]
            inference_index_end = inference_indexes[i + 1]
            print(domain_description[start_at_index : inference_index_start], end="")
            cprint(domain_description[inference_index_start : inference_index_end], "green", "on_black", end='')
            start_at_index = inference_index_end

        
        print(domain_description[start_at_index:])
        print("\n\n")


    def longest_substring(s1, s2):

        seq_match = SequenceMatcher(None, s1, s2)

        match = seq_match.find_longest_match(0, len(s1), 0, len(s2))

        # returns the longest substring
        if (match.size != 0):
            return (s1[match.a: match.a + match.size])
        else:
            return ("")


    def find_inference_indexes(inference_parts, domain_description):
        result = []
        for inference_part in inference_parts:
            inference_part = inference_part.lower().strip()

            last_result_index = 0
            append_only_first_occurence = False

            # Skip immediately to the previous detected inference as the next inference part should not be before the previous one
            # We cannot skip immediately to the index at result[-1] if there are more inferences found for the previous inference part
            if result:
                last_result_index = result[1]
                append_only_first_occurence = True

            for i in range(last_result_index, len(domain_description)):

                # Append all occurencies of the `inference_part` in the `domain_description`
                if domain_description[i:].startswith(inference_part):
                    result.append(i)
                    result.append(i + len(inference_part))

                    if append_only_first_occurence:
                        break

        # TODO: Find out a better way to analyze if everything was found
        is_everything_found = len(result) > 2
        return result, is_everything_found


    def findSubstrings(inference, domain_description):
        longest_substring = TextUtility.longest_substring(domain_description, inference)

        if not longest_substring:
            return

        if inference.startswith(longest_substring):
            inference_parts = [inference[0:len(longest_substring)], inference[len(longest_substring):]]
            result, is_everything_found = TextUtility.find_inference_indexes(inference_parts, domain_description)

            # Try to detect one typo by dividing inference into two inferences and skipping the character at which it failed
            if not is_everything_found:
                inference_parts = [inference[0:len(longest_substring)], inference[len(longest_substring) + 1:]]
                result, is_everything_found = TextUtility.find_inference_indexes(inference_parts, domain_description)
            
            return result
        
        elif inference.endswith(longest_substring):
            # Symmetrically do the same thing as before
            split = len(inference) - len(longest_substring)
            inference_parts = [inference[:split], inference[split:]]
            result, is_everything_found = TextUtility.find_inference_indexes(inference_parts, domain_description)

            # Try to detect one typo by dividing inference into two inferences and skipping the character at which it failed
            if not is_everything_found:
                inference_parts = [inference[0:len(longest_substring)], inference[len(longest_substring) + 1:]]
                result, is_everything_found = TextUtility.find_inference_indexes(inference_parts, domain_description)
            
            return result

        else: # Longest substring was detected in the middle of the inference

            # Get start index and end index of the middle part of the inference
            for i in range(len(inference)):
                if inference[i:].startswith(longest_substring):
                    start_index = i
                    end_index = i + len(longest_substring)
                    break

            inference_parts = [inference[:start_index], inference[start_index : end_index], inference[end_index:]]
            result, is_everything_found = TextUtility.find_inference_indexes(inference_parts, domain_description)

            return result

        

        
