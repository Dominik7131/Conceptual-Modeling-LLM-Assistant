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
		},
		...
				],

	"relationships": [
		{
			"name": "relationship_name",
			"source_entity": "source_entity_name",
			"target_entity": "target_entity_name",
			"cardinality": "..."
		},
		...
					 ] 
}
```