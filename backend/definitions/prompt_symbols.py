from enum import Enum


class PromptSymbols(Enum):
    SOURCE_CLASS = "{source_class}"
    TARGET_CLASS = "{target_class}"
    DOMAIN_DESCRIPTION = "{domain_description}"
    ITEMS_COUNT_TO_SUGGEST = "{items_count}"
    CONCEPTUAL_MODEL = "{conceptual_model}"
    ATTRIBUTE_NAME = "{attribute_name}"
    ASSOCIATION_NAME = "{association_name}"
    DESCRIPTION = "{description}"
    ORIGINAL_TEXT = "{original_text}"
