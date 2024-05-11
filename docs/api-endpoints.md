# API Endpoints


**POST** /suggest/items

| Parameter | Mandatory  | Data type | Description  |
|---|---|---|---|
| userChoice  | yes |  string (`classes`, `attributes`, `associations1`, `associations2`) | What items the LLM should suggest. `associations1` means associations where the source class is provided, `associations2` means associations where both the source class and the target class is provided. |
| domainDescription  | yes | string | Solely based on this text the LLM will generate random suggestions. If empty string is provided then the LLM will use it's parameters to generate the items. |
| sourceClass  | no | string  | Name of the source class when the userChoice `attributes` or `associations1` or `associations2` is provided. |
| targetClass  | no  | string | Name of the target class when the userChoice `associations2` is provided.  |


<br/>

**Response**
- stream of JSON objects
- warning: when buffering is not disabled multiple JSON objects can be received in one response and then basic json parsing functions such as `json.loads` in Python won't work because first you need to split the received string object by newline character
- each JSON object contains the field `name`
    - if `domainDescription=""` then also `description`
    - else `originalText` and `originalTextIndexes` except for `userChoice=classes`
        - `associations` also contains field `source` as source class and `target` as target class

<br/>
<br/>


**POST** /suggest/single_field

| Parameter | Mandatory | Data type | Description |
|-----------|-----------|-----------|-------------|
| userChoice | yes     | string (`classes`, `attributes`, `associations`) | Type of the item. |
| domainDescription | yes     | string | Solely based on this text the LLM will generate the output.
| name      | yes       | string    | Item name.   |
| field     | yes       | string (`originalText`, `description`, `data type`, `sourceCardinality`, `targetCardinality`) | Item field to suggest. |
| sourceClass  | no | string  | Name of the source class when the userChoice `attribute` or `associations` is provided. |
| targetClass  | no  | string | Name of the target target class when the userChoice `associations` is provided.  |

<br/>

**Response**
- stream of json objects containing a single field named by the `field` parameter


<br/>
<br/>

**POST** /suggest/summary

| Parameter | Mandatory | Data type | Description |
|-----------|-----------|-----------|-------------|
| summaryType | yes     | string (`summaryPlainText`, `summaryDescriptions`) | Type of the summary to suggest. |
| domainDescription | yes     | string | Solely based on this text the LLM will generate the summary.
| conceptual_model | yes | string | TODO: specify json schema. |

<br/>

**Response**
- if `userChoice=summaryPlainText` then a single JSON object with a single field `summary`
- otherwise stream of json objects:
    - first objects with class and attributes descriptions like this:
        - `{"class": "","description": "","attributes": [{"name": "","description": ""}, {...} ...]}`
    - second objects with association description like this:
        - `{"association": "", "sourceClass": "", "targetClass": "", "description": ""}`

<br/>
<br/>


**POST** /merge_original_texts

| Parameter | Mandatory | Data type | Description |
|-----------|-----------|-----------|-------------|
| originalTextIndexesObject          | yes  | string | TODO: specify json schema or just simply describe it. |

<br/>

**Response**
- JSON object like this: `[(x1, x2, label), (x1, x2, label), ...]`
    - `x1` is first original text index
    - `x2` is second origial text index

- TODO: Check

<br/>
<br/>


**POST** /save/suggested_item

| Parameter | Mandatory | Data type | Description |
|-----------|-----------|-----------|-------------|
| userChoice  | yes |  string (`classes`, `attributes`, `associations1`, `associations2`) | What user choice was used to generate this item. |
| domainDescription | yes | string | Type of the item. | The original domain description that the item was generated from
| item          | yes | string | The item to save. |
| isPositive | yes | bool | True if the suggestion was evaluated as good otherwise False.  |

<br/>

**POST** /save/suggested_single_field

| Parameter | Mandatory | Data type | Description |
|-----------|-----------|-----------|-------------|
| userChoice | yes     | string (`classes`, `attributes`, `associations1`, `associations2`) | Type of the original suggestion |
| domainDescription | yes     | string | Type of the item | The original domain description that the field was generated from
| fieldName      | yes       | string (`originalText`, `description`, `data type`, `sourceCardinality`, `targetCardinality`)    | Name of the item's field.   |
| fieldText     | yes       | string    | Generated text of the item field.
| sourceClass  | no | string  | Source class |
| targetClass  | no  | string | Target class  |
| isPositive  | yes | bool | True if the field text is evaluated as good otherwise False.  |

<br/>

**POST** /save/suggested_summary

| Parameter | Mandatory | Data type | Description |
|-----------|-----------|-----------|-------------|
| summaryType | yes     | string (`summaryPlainText`, `summaryDescriptions`) | Type of the summary. |
| domainDescription | yes     | string | Type of the item. | The original domain description that the field was generated from.
| conceptual_model | yes | string | TODO: specify json schema. |
| isPositive  | yes | bool | True if the field text is evaluated as good otherwise False.  |
