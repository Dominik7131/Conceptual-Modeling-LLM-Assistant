## General info

To use any of the scripts:
- change directory to the `backend`:

    `cd backend`


- create Python virtual environment
    - `python -m venv llm_assistant`

- activate Python virtual environment:
    - Linux: `source llm_assistant/bin/activate`
    - Windows: `.\llm_assistant\Scripts\activate`

- install Python packages
    - `pip install -r requirements.txt`

<br/>

## How to run LLM backend powered by llama.cpp

- clone [llama.cpp repository](https://github.com/ggerganov/llama.cpp):
    - `git clone https://github.com/ggerganov/llama.cpp.git`

- [here is a detailed guide of how to build llama.cpp with different configurations](https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#build)

- build llama.cpp server on Linux with CUDA:
    - update CUDA to at least version 11.7.1
    - install compatible version of [nvidia-cuda-toolkit](https://developer.nvidia.com/cuda-downloads)
    - `make server LLAMA_CUDA=1`
    - if this doesn't work [here is a more detailed description](https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#cuda)

- download one of the [supported models](https://github.com/ggerganov/llama.cpp#description) in `GGUF` format

- inside `llm_backend.sh`:
    - set corresponding `MODEL_PATH` variable
    - set corresponding `CHAT_TEMPLATE` variable

- for more information you can check [llama.cpp server documentation](https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md)

- run llm backend:
    - `./llm_backend.sh`
    - default port is 8080
    - note: first time loading LLM is slow

<br/>

## How to run LLM assistant
- download a model for syntactic text filtering from [this page](https://lindat.mff.cuni.cz/repository/xmlui/handle/11858/00-097C-0000-0023-68D9-0)
    - here is a [link to download model english-morphium-wsj-140407.zip](https://lindat.mff.cuni.cz/repository/xmlui/bitstream/handle/11858/00-097C-0000-0023-68D9-0/english-morphium-wsj-140407.zip?sequence=3&isAllowed=y)
    - extract the files
    - set path to the `.tagger` file inside `backend/text-filtering/syntactic/morphodita-config.json`

- run python server
    - `python server.py`
    - default port is 5000