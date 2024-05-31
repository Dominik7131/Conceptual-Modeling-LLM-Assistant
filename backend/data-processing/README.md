# Manual evaluation workflow of LLM suggestions

- activate Python virtual environment
- change directory to `backend`
    - `cd backend`

- generate test data
    - `python data-processing/generation/generate_test_data.py`

- generate LLM suggestions from the test data
    - `python data-processing/generation/generate_suggestions.sh`

- manually match the outputted suggestions with the expected outputs from the test data

- evaluate manually matched elements
    - `python data-processing/evaluation/evaluate_suggestions.py`