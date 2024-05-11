# API Endpoints


**POST** /suggest/items

| Parameter | Mandatory  | Data type | Description  |
|---|---|---|---|
| userChoice  | yes |  string (`classes`, `attributes`, `associations1`, `associations2`) | What items the LLM should suggest. `associations1` means associations where the source class is provided, `associations2` means associations where the source class and the target class is provided. |
| domainDescription  | yes | string | Solely based on this text the LLM will generate random suggestions. If empty string is provided then the LLM will use it's parameters to generate the items. |
| sourceClass  | no | string  | Name of the source class when the userChoice `attributes` or `associations1` or `associations2` is provided. |
| targetClass  | no  | string | Name of the target class when the userChoice `associations2` is provided.  |


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


**POST** /suggest/summary

| Parameter | Mandatory | Data type | Description |
|-----------|-----------|-----------|-------------|
| summaryType | yes     | string (`summaryPlainText`, `summaryDescriptions`) | Type of the summary to suggest. |
| domainDescription | yes     | string | Solely based on this text the LLM will generate the summary.
| conceptual_model | yes | string | TODO: specify json schema. |

<br/>


**POST** /merge_original_texts

| Parameter | Mandatory | Data type | Description |
|-----------|-----------|-----------|-------------|
| original_text_indexes_object          | yes  | string | TODO: specify json schema or just simply describe it. |

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
