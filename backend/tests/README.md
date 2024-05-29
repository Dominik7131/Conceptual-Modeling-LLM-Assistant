# Test scripts

## `merge_original_text_indexes.py`
- purpose: test if we are correctly merging the original text indexes for highlighting in domain description all elements that the user has already modelled
- test data: list of original text indexes with their labels, list of expected original text indexes with their labels
- output: list of actual merged original text indexes including their labels

<br />

## `original_text_indexes.py`
- purpose: test if the original text indexes are correctly computed for highlighting original text of a single element in a domain description
- test data: domain description, original text, list of expected original text indexes
- output: list of actual original text indexes


<br />

## `name_formatter.py`
- purpose: test if we are correctly converting names into the standard convention because LLM generates element names in any convention and we convert them into standard convention for consistency
- test data: name in any convention
- output: corresponding name in the standard convention
