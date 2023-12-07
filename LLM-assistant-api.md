# LLM-assistant API

## class LLM_assistant
LLM_assistant(model_id, model_file)
- model_id (string): ID of the LLM to use (e.g. TheBloke/Llama-2-7B-Chat-GGUF)
- model_file (string): which specific model file to use (e.g. llama-2-7b-chat.Q5_K_M.gguf)

## Public methods of the class LLM_assistant:
  
### method suggest_attributes
suggest_attributes(class_name, count_attributes_to_suggest, conceptual_model, domain_description)

- class_name (string): name of the class for which `LLM_assistant` suggests attributes
- count_attributes_to_suggest (int): how many attributes should be outputed, must be greater than 0
- conceptual_model (JSON object describing conceptual model, optional): whole user's conceptual model or only part of it
- domain_description (string, optional): description of the domain the user is modeling
- returns (array with properties `attribute`): new suggested attributes for the class `class_name`
	- with the length of `count_attributes_to_suggest` 
	- solely based on the `domain_description` and the context of `conceptual_model` if provided else the output is based on the learned parameters of the selected LLM

  
### method suggest_relationships

suggest_relationships(class_name, count_relationships_to_suggest, is_provided_class_source, conceptual_model, domain_description)
- class_name (string): name of the class for which `LLM_assistant` suggests relationships
- count_relationships_to_suggest (int): how many relationships should be outputed, must be greater than 0
- is_provided_class_source (bool): if True the class `class_name` is considered as the source class else is considered as the target class
- conceptual_model (JSON object describing conceptual model, optional): whole user's conceptual model or only part of it
- domain_description (string, optional): description of the domain the user is modeling
- returns (array with properties `relationship`, `new_class_name`): new suggested relationships between the class `class_name` and `new_class_name`
- with the length of `count_relationships_to_suggest`
- solely based on the `domain_description` and the context of `conceptual_model` if provided else the output is based on the learned parameters of the selected LLM

  
### method suggest_relationships_between_two_classes

suggest_relationships_between_two_classes(class_name_1, class_name_2, count_relationships_to_suggest, is_class_1_souce, conceptual_model, domain_description)

-  `class_name_1` (string): name of the first class
-  `class_name_2` (string): name of the second class
-  `count_relationships_to_suggest` (int): how many relationships should be outputed, must be greater than 0
-  `is_class_1_source` (bool): if True than the class `class_name_1` is the source class and the class `class_name_2` is the target class of the relationships which will be suggested else oterwise
-  `conceptual_model` (JSON object describing conceptual model, optional): whole user's conceptual model or only part of it
-  `domain_description` (string, optional): description of the domain the user is modeling
- returns (array with properties `relationship`): new suggested relationships in between the class `class_name_1` and `class_name_2`
	- where the class `class_name_1` is the source class and `class_name_2` is the target class if `is_class_1_souce` is set to True else otherwise
	- with the length of `count_relationship_to_suggest `
	- these relationships are solely bases on the `domain_description` and the context of `conceptual_model` if provided else is based on the learned parameters of the selected LLM
	- does not contain any relationships in the `class_attributes` array

  
### method summarize_conceptual_model

summarize_conceptual_model(conceptual_model)

- conceptual_model (JSON object describing conceptual model): whole user's conceptual model or only part of it
- returns (string): description of the selected conceptual model `conceptual_model_selected`

  
    
### method highlight_modeled_part

highlight_modeled_part(domain_text_description, conceptual_model)

- `domain_description` (string): description of the domain the user is modeling
- conceptual_model (JSON object describing conceptual model): whole user's conceptual model or only part of it
- returns (string): the part of the text from the `domain_description` which is represented in the selected conceptul model `conceptual_model_selected`

  

#### JSON object describing the conceptual model:

{"entities": ["entity_name": ..., "attributes": ["attribute_name": ...], "relationships": ["relationship_name": ..., "source_entity": ..., "target_entity": ..., "cardinality": ..., "attributes": ["attribute_name": ..., ]]]}


### TODO:
- how to represent ISA-hierarchy in JSON format?
- can user provide some additional instruction for the `LLM_assistant`?