# Scripts

## `calculate_server_used_tokens.py`
- the llama.cpp server logs how many tokens it processed
- this script sums up all those processed tokens


## `check_tags_in_annotated_texts.py`
- checks if all the manually created tags in the annotated domain descriptions are properly closed


## `create_prompt_example.py`
- from the data for prompting creates examples that are used for N-shot prompting


## `generate_suggestions.sh`
- generates classes, attributes and associations for manual evaluation


## `plantUML_generator.py`
- generates plant UML diagram from generated classes, attributes and associations for little bit more convenient manual evaluation of those elements


## `evaluate_suggestions.py`
- computes recall and precision of manually matched classes, attributes and associations
- also checks if all manualy matched elements exist in the list of expected elements


## `generate_test_data_from_annotated_texts.py`
- from annotated domain description generates:
    - test data for domain description filtering
    - expected classes, attributes and associations for each domain description