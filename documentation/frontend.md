# Frontend documentation

## Input/Output conceptual model JSON format

```
{
	"entities": [
		{
			"name": "entity_name",
		 	"attributes": [
				{
					"name": "attribute_name", 
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
			"source": "source_entity",
			"target": "target_entity",
			"cardinality": "..."
		},
		...
					 ] 
}
```