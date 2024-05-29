# Scripts

To use any of the scripts first change directory to the `backend` directory

## Used for manual evaluation


### `generate_suggestions.sh`
- generates classes, attributes and associations for manual evaluation


### `generate_test_data_from_annotated_texts.py`
- from annotated domain description generates:
    - test data for domain description filtering
    - expected classes, attributes and associations for each domain description
        - these files are used to manually check the generated suggestions


### `evaluate_suggestions.py`
- computes recall and precision of manually matched classes, attributes and associations
- also checks if all manualy matched elements exist in the list of expected elements


### `plantUML_generator.py`
- generates plant UML diagram from generated classes, attributes and associations for little bit more convenient manual evaluation of those elements


## Other

### `check_tags_in_annotated_texts.py`
- checks if all the manually created tags in the annotated domain descriptions are properly closed


### `create_prompt_example.py`
- from the data for prompting creates examples that are used for N-shot prompting


### `calculate_server_used_tokens.py`
- sums up all tokens that are logged by the llama.cpp server