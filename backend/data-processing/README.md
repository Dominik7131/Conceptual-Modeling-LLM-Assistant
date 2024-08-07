# Manual evaluation workflow of LLM suggested domain elements

- change directory to `backend`:

      cd backend

- clone our [data repository](https://github.com/dataspecer/domain-modeling-benchmark)

      git clone https://github.com/dataspecer/domain-modeling-benchmark.git

- activate Python virtual environment

      source [virtual-environment-name]/bin/activate

- generate test data:

      python data-processing/generation/generate_test_data.py

- generate LLM suggestions from the test data (the LLM assistant server and the LLM server needs to be running):

      ./data-processing/generation/generate_suggestions.sh

- manually match the outputted suggestions with the expected outputs from the test data

- evaluate manually matched elements:

      python data-processing/evaluation/evaluate_suggestions.py