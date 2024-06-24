# Evaluation scripts brief description

## [evaluate_suggestions.py](evaluate_suggestions.py)
- computes recall and precision of manually matched classes, attributes and associations
    - during that checks if all manualy matched elements exist in the list of expected elements to report possible anomalies in manual evaluation


<br/>


## [evaluate_relevant_text_finder](evaluate_relevant_text_finder.py)
- computes recall and precision of the selected strategy for the text filtering
    - note that each expected original text for each element is evaluated separately
    - if an expected original text contains `n` sentences it is splitted into `n` original texts
    - for example the output for a domain description with 8 classes can look like this: "classes: 11/12 - 91.67%"
        - reason: the 8 classes are represented by 12 original texts in the domain description
- as test data it uses outputs from the script [generate_test_data.py](../generation/generate_test_data.py)