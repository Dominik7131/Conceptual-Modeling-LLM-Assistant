# Generation scripts brief description

## [generate_test_data.py](generate_test_data.py)
- from annotated domain descriptions and expected domain models:
    - generates test data for domain description filtering
    - generates expected classes, attributes and associations for manual evaluation of LLM suggestions

<br/>

## [generate_suggestions.sh](generate_suggestions.sh)
- generates classes, attributes and associations suggested by LLM in csv format ready for manual evaluation

<br/>

## [generate_plantUML.py](generate_plantUML.py)
- generates plant UML diagram from generated classes, attributes and associations for a little bit more convenient manual evaluation of those elements

<br/>

## [generate_prompt_examples.py](generate_prompt_examples.py)
- from prompting domain description and corresponding expected domain model generates examples that are used for N-shot prompting
