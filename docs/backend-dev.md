# Backend development documentation

## LLM assistant server
- we are using:
    - [Flask](https://flask.palletsprojects.com/en/3.0.x/) version 3.0.1
    - Python version 3.10

- [here si documentation of our API endpoints](api-endpoints.md)

- the code is divided into these main directories:
    - [definitions](../backend/definitions/)
    - [text-filtering](../backend/text-filtering/)
    - [utils](../backend/utils/)
    - [tests](../backend/tests/)
    - [data-processing](../backend/data-processing/)


### definitions
- provides definitions of constant variables and enums


### text-filtering
- provides semantic and syntactic algorithm for domain description filtering


### utils
- contains scripts used by the LLM assistant server to provide help to the user with conceptual modelling
- all these scripts are briefly described:
    - [here separately](../backend/utils/README.md)
    - [here in the context of the control flow of the architecture](architecture.md#llm-assistant-workflow)


### tests
- used for testing correctness of the implementation of some components
- all these scripts are briefly described:
    - [here separately](../backend/tests/README.md)
    - [here in the context of the control flow of the architecture](../backend/tests/README.md)


### data-processing
- used for experimenting with different configurations such as different prompts, text filtering strategies, LLMs, etc.
- scripts in the [generation](../backend/data-processing/generation/) directory are used for generating test data
    - [here is a brief description of each script](../backend/data-processing/generation/README.md)
- scripts in the [evaluation](../backend/data-processing/evaluation/) directory are used for evaluating manually filled in data based on the generated test data
    - [here is a brief description of each script](../backend/data-processing/evaluation/README.md)

- here is a description of the [manual evaluation workflow of LLM suggestions](../backend/data-processing/README.md)

<br/>


## LLM server
- we are using [llama.cpp server](https://github.com/ggerganov/llama.cpp/blob/master/examples/server)
    - it is a fast, lightweight, pure C/C++ HTTP server based on httplib, nlohmann::json and llama.cpp

- our LLM assistant server communicates with the LLM server via [OpenAI API](https://github.com/openai/openai-openapi)
    - bellow [this link](https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md#result-json-1) is an example of how to send request in Python