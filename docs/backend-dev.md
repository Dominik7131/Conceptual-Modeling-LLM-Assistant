# Backend development documentation

## LLM assistant server
- we are using [Flask](https://flask.palletsprojects.com/en/3.0.x/) version 3.0.1
- all our scripts were made with Python version 3.10
- [here si documentation of our API endpoints](api-endpoints.md)
- [here is our tutorial how to launch the LLM assistant server](../backend/README.md#how-to-run-llm-assistant-server)

- the code is divided into 3 main directories:
    - definitions
    - text-filtering
    - utils


### definitions
- provides definitions of constant variables and enums

### text-filtering
- provides semantic and syntactic algorithm for domain description filtering


### utils
- contains scripts used by the LLM server to provide help to the user with conceptual modelling
- all these scripts are briefly described in the [architecture documentation](architecture.md)


<br/>


## LLM server
- we are using [llama.cpp server](https://github.com/ggerganov/llama.cpp/blob/master/examples/server)
    - it is a fast, lightweight, pure C/C++ HTTP server based on httplib, nlohmann::json and llama.cpp

- our LLM assistant server communicates with the LLM server via [OpenAI API](https://github.com/openai/openai-openapi)
    - bellow [this link](https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md#result-json-1) is an example of how to send request in Python

- [here is our tutorial how to launch the LLM server](../backend/README.md#how-to-run-llm-backend-powered-by-llamacpp)