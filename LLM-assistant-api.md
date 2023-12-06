# LLM-assistant API

## class LLM-assistant
LLM-assistant(llm, model_file)
- llm(string): name of the LLM to use (e.g. TheBloke/Llama-2-7B-Chat-GGUF)
- model_file (string): which specific model file to use (e.g. llama-2-7b-chat.Q5_K_M.gguf)

## Public functions of class LLM-assistant:
  
### function suggest_attributes
suggest_attributes(class_name, count_attributes_to_suggest, existing_class_attributes, domain_description)

- class_name (string): name of the class for which LLM-assistant suggests attributes
- count_attributes_to_suggest (int): how many attributes should be outputed, must be greater than 0
- existing_class_attributes (array with properties `attribute`, optional): already existing attributes of the class `class_name` in the user's conceptual model
- domain_description (string, optional): description of the domain the user is modeling
- returns (array with properties `attribute`): array of the suggested attributes of the class `class_name`
	- with the length of `count_attributes_to_suggest` 
	- solely based on the `domain_description` if provided  else the output is based on the learned parameters of the selected LLM
	-  does not contain any attributes in the `class_attributes` array

  
### function suggest_associations

suggest_associations(class_name, count_associations_to_suggest , is_provided_class_source, existing_class_associations, domain_description)
- class_name (string): name of the class for which LLM-assistant suggests associations
- count_associations_to_suggest (int): how many associations should be outputed, must be greater than 0
- is_provided_class_source (bool): if True the class `class_name` is considered as the source class else is considered as the target class
- existing_class_associations (array with properties `association`): array of already existing associations of the class `class_name` in the user's conceptual model
- domain_description (string, optional): description of the domain the user is modeling
- returns (array with properties `association`, `new_class_name`): list of associations between the class `class_name` and `new_class_name`
- with the length of `count_associations_to_suggest`
- does not contain any associations from the `existing_class_associations` array
- solely based on the `domain_description` if provided else the output is based on the learned parameters of the selected LLM

  
### function suggest_associations_between_two_classes

suggest_associations_between_two_classes(class_name_1, class_name_2, count_associations_to_suggest, is_class_1_souce, existing_class_associations, domain_description)

-  `class_name_1` (string): name of the first class
-  `class_name_2` (string): name of the second class
-  `count_associations_to_suggest` (int): how many associations should be outputed, must be greater than 0
-  `is_class_1_source` (bool): if True than the class `class_name_1` is the source class and the class `class_name_2` is the target class of the associations which will be suggested else oterwise
-  `existing_class_associations` (array with properties `association`, optional): array of already existing associations in between the classes `class_name_1` and `class_name_2` where `class_name_1` is the source class if `is_class_1_souce` is set to True else `class_name_1` is the target class
-  `domain_description` (string, optional): description of the domain the user is modeling
- returns (array with properties `association`): suggested associations in between the class `class_name_1` and `class_name_2`
	- where the class `class_name_1` is the source class and `class_name_2` is the target class if `is_class_1_souce` is set to True else otherwise
	- with the length of `count_associations_to_suggest `
	- these associations are solely bases on the `domain_description` if provided else is based on the learned parameters of the selected LLM
	- does not contain any associations in the `class_attributes` array

  
### function summarize_conceptual_model

summarize_conceptual_model(conceptual_model_selected)

- conceptual_model_selected (JSON object describing conceptual model): the selected part of the conceptual model
- returns (string): description of the selected conceptual model `conceptual_model_selected`

  
    
### function highlight_modeled_part

highlight_modeled_part(domain_text_description, conceptual_model_selected)

-  `domain_description` (string): description of the domain the user is modeling
- conceptual_model_selected (JSON object describing conceptual model): the selected part of the conceptual model
- returns (string): the part of the text from the `domain_description` which is represented in the selected conceptul model `conceptual_model_selected`

  

#### JSON object describing the conceptual model:

{"entities": ["entity_name": ..., "attributes": ["attribute_name": ...], "associations": ["association_name": ..., "source_entity": ..., "target_entity": ..., "cardinality": ..., "attributes": ["attribute_name": ..., ]]]}


### TODO:
- how to represent ISA-hierarchy in JSON format?
- can user provide some additional instruction for the LLM-assistant?