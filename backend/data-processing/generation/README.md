# Generation scripts brief description

## [generate_test_data.py](generate_test_data.py)
- from annotated domain descriptions and expected domain models:
    - generates test data for domain description filtering
    - generates expected classes, attributes and associations for manual evaluation of the LLM suggestions

<br/>

## [generate_suggestions.sh](generate_suggestions.sh)
- generates classes, attributes and associations suggested by the LLM in the CSV format ready for manual evaluation
- uses the [generate_suggestions.py](generate_suggestions.py) script

<br/>

## [generate_descriptions.py](generate_suggestions.sh)
- generates class descriptions suggested by the LLM in the CSV format ready for manual evaluation

<br/>

## [generate_plantuml.py](generate_plantuml.py)
- generates plant UML diagram from generated classes, attributes and associations for a little bit more convenient manual evaluation of those elements
