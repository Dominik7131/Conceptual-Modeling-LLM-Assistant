# Backend development documentation

## Project structure
The code is divided into these main directories:
- [definitions](../backend/definitions/) contain definitions of constant variables and enums
- [text-filtering](../backend/text-filtering/) contains semantic and syntactic algorithm for domain description filtering
- [utils](../backend/utils/) contain scripts used by the LLM assistant server
    - all these scripts are briefly described:
        - [here separately](../backend/utils/README.md)
        - later on in [the control flow of the architecture](architecture.md#llm-assistant-workflow)
- [tests](../backend/tests/) contain scripts for testing correctness of the implementation of some components
    - all these scripts are briefly described:
        - [here separately](../backend/tests/README.md)
        - later on in [the control flow of the architecture](architecture.md#llm-assistant-workflow)
- [data-processing](../backend/data-processing/) contains scripts for experimenting with different configurations such as different prompts, text filtering strategies, LLMs, etc.
    - scripts in the [generation](../backend/data-processing/generation/) directory are used for generating test data
        - [here is a brief description of each script](../backend/data-processing/generation/README.md)
    - scripts in the [evaluation](../backend/data-processing/evaluation/) directory are used for evaluating manually filled in data based on the generated test data
        - [here is a brief description of each script](../backend/data-processing/evaluation/README.md)
    - here is a description of the [manual evaluation workflow of LLM suggestions](../backend/data-processing/README.md)

<br/>

## LLM assistant server
- we are using:
    - [Flask](https://flask.palletsprojects.com/en/3.0.x/) version 3.0.1
    - [Python](https://www.python.org/) version 3.10

- [here is documentation of our API endpoints](api-endpoints.md)

<br/>

## LLM server
- we are using [llama.cpp server](https://github.com/ggerganov/llama.cpp/blob/master/examples/server)
    - it is a fast, lightweight, pure C/C++ HTTP server based on httplib, nlohmann::json and llama.cpp

- our LLM assistant server communicates with the LLM server via [OpenAI API](https://github.com/openai/openai-openapi)
    - bellow [this link](https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md#result-json-1) is an example of how to send request in Python via OpenAI API