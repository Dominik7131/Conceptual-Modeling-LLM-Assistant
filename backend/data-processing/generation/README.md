# Scripts

## `generate_test_data.py`
- from annotated domain descriptions and expected domain models:
    - generates test data for domain description filtering
    - generates expected classes, attributes and associations for manual evaluation of LLM suggestions


## `generate_suggestions.sh`
- generates classes, attributes and associations suggested by LLM in a format ready for manual evaluation


## `generate_plantUML.py`
- generates plant UML diagram from generated classes, attributes and associations for a little bit more convenient manual evaluation of those elements


## `generate_prompt_examples.py`
- from prompting domain description and corresponding expected domain model generates examples that are used for N-shot prompting
