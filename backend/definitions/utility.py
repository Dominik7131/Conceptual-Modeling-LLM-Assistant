from enum import Enum


CLASSES_BLACK_LIST = ["employee", "department", "manager"]

PRONOUNS_TO_DETECT = ["It", "He", "She", "This", "The", "They"]


class UserChoice(Enum):
    CLASSES = "classes"
    ATTRIBUTES = "attributes"
    ASSOCIATIONS_ONE_KNOWN_CLASS = "associations1"
    ASSOCIATIONS_TWO_KNOWN_CLASSES = "associations2"
    SUMMARY_PLAIN_TEXT = "summaryPlainText"
    SUMMARY_DESCRIPTIONS = "summaryDescriptions"
    SINGLE_FIELD = "singleField"


class TextFilteringVariation(Enum):
    NONE = "none"
    SYNTACTIC = "syntactic"
    SEMANTIC = "semantic"


class SummaryPlainTextStyle(Enum):
    DEFAULT = "default"
    EDUCATIONAL = "educational"
    FUNNY_STORY = "funny story"


class DataType(Enum):
    STRING = "string"
    NUMBER = "number"
    TIME = "time"
    BOOLEAN = "boolean"


DEFINED_DATA_TYPES = [DataType.STRING.value, DataType.NUMBER.value,
                      DataType.TIME.value, DataType.BOOLEAN.value]


class Field(Enum):
    IRI = "iri"
    NAME = "name"
    TITLE = "title"
    DOMAIN = "domain"
    RANGE = "range"
    DESCRIPTION = "description"
    ORIGINAL_TEXT = "originalText"
    ORIGINAL_TEXT_INDEXES = "originalTextIndexes"
    DATA_TYPE = "dataType"
    CARDINALITY = "cardinality"
    SOURCE_CLASS = "source"
    TARGET_CLASS = "target"


class FieldUI(Enum):
    NAME = "name"
    DESCRIPTION = "description"
    ORIGINAL_TEXT = "original text"
    ORIGINAL_TEXT_INDEXES = "original text indexes"
    DATA_TYPE = "data type"
    CARDINALITY = "cardinality"
    SOURCE_CLASS = "source class"
    TARGET_CLASS = "target class"
