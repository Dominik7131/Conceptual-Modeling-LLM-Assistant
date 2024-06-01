# Brief description

## [convention_convertor.py](convention_convertor.py)
- purpose: LLM can generate plain text output in any convention (such as snake_case, camelCase, UPPERCASE, etc.) so for consistency we convert this output into the standard convention (for simplicity all letters are lower cased and each word is divided by a single white space)
- provides class `ConventionConvertor` for converting text from any convention into the standard convention

<br/>

## [llm_assistant.py](llm_assistant.py)
- purpose: control the flow of putting together output from the LLM based on the given input
- provides class `LLMAssistant` for helping the user with some domain modelling tasks

<br/>

## [llm_manager.py](llm_manager.py)
- purpose: send prompt to the LLM and parses the output
- provides class `LLMManager` for communicating with the LLM server

<br/>

## [original_text_finder.py](original_text_finder.py)
- purpose: for each attribute and association let the LLM provide original text based on the given domain description so we can highlight to the user in the domain description the generated object
    - also contains strategy for recovering from some simple misstakes made from LLM such as changing one letter in the original text for example when "motorised vehicle" with "s" is changed into "motorized vehicle" with "z"
- provides class `OriginalTextFinder` for getting original text indexes based on the given original text and domain description


<br/>

## [original_text_merger.py](original_text_merger.py)
- purpose: for highlighting all user's modelled elements in his domain description merge all the given original text indexes including their labels
- provides class `OriginalTextMerger` for merging original text indexes including their labels

<br/>

## [prompt_manager.py](prompt_manager.py)
- purpose: retrieve the correct prompt template based on the given parameters and fill in all the prompt symbols
- provides class `PromptManager` for getting a completed prompt based on the given parameters

<br/>

## [replacer.py](replacer.py)
- purpose: separate logic for filling in prompt symbols
- provides class `Replacer` for filling in prompt symbols inside a prompt template

<br/>

## [text_splitter.py](text_splitter.py)
- purpose: for filtering domain description divide it into chunks so for each chunk we can separately decide if we want to keep it or if we want to remove it
- provides class `TextSplitter` for splitting any text into chunks

<br/>

## [text_utility.py](text_utility.py)
- purpose: provides generally useful functions without any specific purpose
- provides class `TextUtility` for example for converting messages sent to LLM into more readable format