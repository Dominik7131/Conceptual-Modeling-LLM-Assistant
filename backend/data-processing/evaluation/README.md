# Evaluation scripts brief description

## [evaluate_suggestions.py](evaluate_suggestions.py)
- computes recall and precision of manually matched classes, attributes and associations
    - during that checks if all manualy matched elements exist in the list of expected elements to report possible anomalies in manual evaluation


<br/>


## [evaluate_relevant_text_finder](evaluate_relevant_text_finder.py)
- computes recall and precision of the selected strategy for the text filtering
- as test data it uses outputs from the script [generate_test_data.py](../generation/generate_test_data.py)