## Backend general info

To use any of the backend scripts:

- download and install [Python](https://www.python.org/downloads/) if you haven't already

- change directory to the `backend`:

      cd backend


- create Python virtual environment

      python -m venv [virtual-environment-name]

- activate Python virtual environment:
    - Linux:
    
          source [virtual-environment-name]/bin/activate
    - Windows:

          [virtual-environment-name]\Scripts\activate

- install the following Python packages:
    - `flask`, `flask-cors`, `timeout-decorator`, `openai`, `ufal.morphodita`, [pytorch with CUDA](https://pytorch.org/get-started/locally/),`sentence-transformers`, `termcolor`

<br/>


## How to run LLM assistant server
- download a model for syntactic text filtering from [this page](https://lindat.mff.cuni.cz/repository/xmlui/handle/11858/00-097C-0000-0023-68D9-0)
    - here is a [link to download model english-morphium-wsj-140407.zip](https://lindat.mff.cuni.cz/repository/xmlui/bitstream/handle/11858/00-097C-0000-0023-68D9-0/english-morphium-wsj-140407.zip?sequence=3&isAllowed=y)
    - extract the files
    - set path to the `.tagger` file inside [backend/text-filtering/syntactic/morphodita-config.json](../backend/text-filtering/syntactic/morphodita-config.json)
- note: the model for semantic text filtering will download automatically

- run python server

      python server.py
    - default port is 5000
    - different port can be passed via `--port` argument
    - if you are using our frontend, then make sure that it is sending requests to the corresponding port which can be set [here](https://github.com/Dominik7131/Conceptual-Modeling-LLM-Assistant/blob/7b9048a1d991bae2651bf3fda1d43d55dc8b8eb1/frontend/conceptual-model-editor-assistant/src/definitions/urls.ts#L4-L5) in the `PORT` and the `BASE_URL` variable
    - if you encounter some error, check `logs` directory


<br/>

## How to run LLM server powered by llama.cpp

- clone [llama.cpp repository](https://github.com/ggerganov/llama.cpp):

      git clone https://github.com/ggerganov/llama.cpp.git

- change directory to `llama.cpp` directory

      cd llama.cpp

- [here is a detailed guide on how to build llama.cpp with different configurations](https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#build)
    - we will show only how to run llama.cpp server on Linux with CUDA

- build llama.cpp server:
    - update CUDA to at least version 11.7.1
    - install compatible version of [nvidia-cuda-toolkit](https://developer.nvidia.com/cuda-downloads)

          make llama-server LLAMA_CUDA=1
    - note: this takes a while
    - if this does not work, check the documentation in the [llama.cpp repository](https://github.com/ggerganov/llama.cpp)

- download one of the [supported models](https://github.com/ggerganov/llama.cpp#description) in `GGUF` format
    - make sure that the LLM fits in your GPU (or GPUs) otherwise the LLM will generate the output very slowly

- inside [llm_server.sh](llm_server.sh):
    - set corresponding `MODEL_PATH` variable
    - set corresponding `CHAT_TEMPLATE` variable

- for more information check the [llama.cpp server documentation](https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md)

- change directory back to the `backend` directory

      cd ..

- run the LLM server:

      ./llm_server.sh
    - the default port is 8080 and can be changed via the `PORT` variable
        - when changing the port, make sure that the [LLM Manager](utils/llm_manager.py) works with the corresponding port
    - note: loading a LLM for the first time is slow


<br/>

## How to run test scripts
- you can run these Python scripts without any arguments
- example how to run script [find_original_text_indexes.py](tests/find_original_text_indexes.py):

      python tests/find_original_text_indexes.py


<br/>

## How to run text filtering scripts
- you can run these scripts without any arguments and then a default simple example will be used
    - note that when a sentence starts with a pronoun then it gets a reference to the previous sentence
    - example:
        - inputed class: "student"
        - inputed text: "Students are at school. They are studying."
        - in this case the second sentence won't be removed because it has reference to the first sentence that talks about the students

- how to run the syntactic algorithm with arguments:

      python text-filtering/syntactic/syntactic_text_filterer.py --clss [class name used for filtering] --text [text to filter]

- how to run the semantic algorithm with arguments:

      python text-filtering/semantic/semantic_text_filterer.py --clss [class name used for filtering] --text [text to filter]


<br/>

## How to run data-processing scripts
- these scripts are usually used in the order described [here](../backend/data-processing/README.md)
- only the script [../backend/data-processing/evaluation/evaluate_relevant_text_finder.py](../backend/data-processing/evaluation/evaluate_relevant_text_finder.py) takes any arguments and is run like this:

      python data-processing/evaluation/evaluate_relevant_text_finder.py --filtering [filtering variation: none|syntactic|semantic]