API Endpoints


**POST** /suggest/items

| Parameter | Mandatory  | Data type | Description  |
|---|---|---|---|
| user_choice  | yes  |  string (classes, attributes, association1, association2) | Association1 means associations with one given class, Associations 2 means associations with two given classes |
| domain_description  | yes  | string | Text that LLM will use to suggest items |
| source_class  |  yes | string  | Source class  |
| target_class  | no  | string | Target class  |
