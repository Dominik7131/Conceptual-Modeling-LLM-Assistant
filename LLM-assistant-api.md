# LLM-assistant API

## class LLM_assistant
LLM_assistant(model_path_or_repo_id, model_file)
- model_path_or_repo_id (string): model path or repo ID of the LLM to use (e.g. TheBloke/Llama-2-7B-Chat-GGUF)
- model_file (string): which specific model file to use (e.g. llama-2-7b-chat.Q5_K_M.gguf)

## Public methods of the class LLM_assistant:
  
### method suggest_attributes
suggest_attributes(entity_name, count_attributes_to_suggest, conceptual_model, domain_description)

- entity_name (string): name of the entity for which `LLM_assistant` suggests attributes
- count_attributes_to_suggest (int): how many attributes should be outputed, must be greater than 0
- conceptual_model (JSON object describing conceptual model, optional): whole user's conceptual model or some part of it
- domain_description (string, optional): description of the domain the user is modeling
- returns (JSON array with properties `attribute`): new suggested attributes for the entity `entity_name`
	- with the length of `count_attributes_to_suggest` 
	- solely based on the `domain_description` and the context of `conceptual_model` if provided else the output is based on the learned parameters of the selected LLM

  
### method suggest_relationships

suggest_relationships(entity_name, count_relationships_to_suggest, is_provided_entity_source, conceptual_model, domain_description)
- entity_name (string): name of the entity for which `LLM_assistant` suggests relationships
- count_relationships_to_suggest (int): how many relationships should be outputed, must be greater than 0
- is_provided_entity_source (bool): if True the entity `entity_name` is considered as the source entity else is considered as the target entity
- conceptual_model (JSON object describing conceptual model, optional): whole user's conceptual model or some part of it
- domain_description (string, optional): description of the domain the user is modeling
- returns (JSON array with properties `relationship`, `new_entity_name`): new suggested relationships between the entity `entity_name` and `new_entity_name`
- with the length of `count_relationships_to_suggest`
- solely based on the `domain_description` and the context of `conceptual_model` if provided else the output is based on the learned parameters of the selected LLM

  
### method suggest_relationships_between_two_entities

suggest_relationships_between_two_entities(source_entity, target_entity, count_relationships_to_suggest, conceptual_model, domain_description)

-  `source_entity` (string): name of the source entity for the suggested relationships
-  `target_entity` (string): name of the target entity for the suggested relationships
-  `count_relationships_to_suggest` (int): how many relationships should be outputed, must be greater than 0
-  `conceptual_model` (JSON object describing conceptual model, optional): whole user's conceptual model or some part of it
-  `domain_description` (string, optional): description of the domain the user is modeling
- returns (JSON array with properties `relationship`): new suggested relationships in between the source entity `source_entity` and the target entity `target_entity`
	- with the length of `count_relationship_to_suggest `
	- these relationships are solely bases on the `domain_description` and the context of `conceptual_model` if provided else is based on the learned parameters of the selected LLM

  
### method summarize_conceptual_model

summarize_conceptual_model(conceptual_model)

- conceptual_model (JSON object describing conceptual model): whole user's conceptual model or some part of it
- returns (string): description of the selected conceptual model `conceptual_model_selected`

  
    
### method highlight_modeled_part

highlight_modeled_domain_description(domain_text_description, conceptual_model)

- `domain_description` (string): description of the domain the user is modeling
- conceptual_model (JSON object describing conceptual model): whole user's conceptual model or some part of it
- returns (string): the part of the text from the `domain_description` which is represented in the selected conceptul model `conceptual_model_selected`



#### JSON object describing the conceptual model:

{
	"entity_name_1":
	{
		"attributes": ["name": ...],
	  	"relationships": ["name": ..., "source_entity": ..., "target_entity": ..., "cardinality": ... "attributes": ["name": ..., ...]]
		"parent_entity": ...
	},
	"entity_name_2":
	{
		...
	},
	...
}

### Notes
- in JSON object "parent_entity" is used for representing the ISA-hierarchy
- for possible future extension every method can have an additional argument `user_instruction` allowing user to specify his request more specifically