# LLM assistant API

## class LLM_assistant

### LLM_assistant(model_path_or_repo_id, model_file)
- **model_path_or_repo_id** (string): model path or repo ID of the LLM to use (e.g. TheBloke/Llama-2-7B-Chat-GGUF)
- **model_file** (string): which specific model file to use (e.g. llama-2-7b-chat.Q5_K_M.gguf)

<br />
<br />

## Public methods of the class LLM_assistant:

### 1) suggest(entity1, entity2, user_choice, count_items_to_suggest, conceptual_model, domain_description)
- **entity1** (string): name of the entity for which `LLM_assistant` suggests items based on the `user_choice`
- **entity2** (string, optional): name of the second entity if the user wants to suggest relationships in between two entities
- **user_choice** (enum): one of these 3 options of what user wants to suggest: ATTRIBUTES for attributes, RELATIONSHIPS_ENTITIES for relationships with new possible entites, RELATIONSHIPS for relationships in between two entities
- **count_items_to_suggest** (int): how many items should be suggested, must be greater than 0
- **conceptual_model** (JSON object describing conceptual model, optional): current user's conceptual model
- **domain_description** (string, optional): description of the domain the user is modeling
- returns new suggested items based on the `user_choice` for the entity `entity1` and optionally the entity `entity2`
	- solely based on the `domain_description` and the context of `conceptual_model` if provided else the output is based on the parameters of the selected LLM
	- output is in JSON array:
	 	- with properties `attribute` if `user_choice` == ATTRIBUTES
		- with properties `relationship`, `new_entity` if `user_choice` == RELATIONSHIPS_ENTITIES
		- with properties `relationship` if `user_choice` == RELATIONSHIPS
		- with the length of `count_items_to_suggest`

<br />
<br />


### 2) summarize_conceptual_model(conceptual_model)
- **conceptual_model** (JSON object describing conceptual model): selected part of user's conceptual model
- returns (string): description of the selected conceptual model `conceptual_model_selected`

  
<br />
<br />

### 3) highlight_modeled_domain_description(domain_description, conceptual_model)
- **domain_description** (string): description of the domain the user is modeling
- **conceptual_model** (JSON object describing conceptual model): selected part of user's conceptual model
- returns (string): the part of the text from the `domain_description` which is represented in the selected conceptul model `conceptual_model_selected`

<br />
<br />


#### JSON object describing the conceptual model:

```
{
	"entities": [
		{
			"name": "entity_name",
		 	"attributes": [
				{
					"name": "attribute_name", 
					"description": "...", 
					"inference": "...", 
					"data_type" : "..."
				}, 
				...
						], 
			"parent_entity": "parent_entity_name"
		},
		...
				],

	"relationships": [
		{
			"name": "relationship_name",
			"description": "...", 
			"inference": "...", 
			"source": "source_entity",
			"target": "target_entity"
		},
		...
					 ] 
}
```

<br />
<br />

### Notes
- in JSON object "parent_entity" is used for representing the ISA-hierarchy
- for possible future extension every method can have an additional argument `user_instruction` allowing user to specify his request more specifically