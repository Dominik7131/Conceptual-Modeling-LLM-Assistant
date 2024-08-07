export const ORIGINAL_TEXT_ID = "highlightedOriginalText"
export const NOTHING_SELECTED_MSG = "Please select some part of your conceptual model."

export const PRIMARY_COLOR = "#2196f3"
export const BLACK_COLOR = "black"
export const GRAY_COLOR = "gray"

export const TOOLTIP_ENTER_DELAY_MS = 500
export const TOOLTIP_LEAVE_DELAY_MS = 200

export const SIDEBAR_BUTTON_SIZE = "small"
export const SIDEBAR_BUTTON_COLOR = "secondary"


export const enum UserChoiceItem
{
  CLASSES = "classes",
  ATTRIBUTES = "attributes",
  ASSOCIATIONS_ONE_KNOWN_CLASS = "associations1",
  ASSOCIATIONS_TWO_KNOWN_CLASSES = "associations2",
}

export const enum UserChoiceSummary
{
  SUMMARY_PLAIN_TEXT = "summaryPlainText",
  SUMMARY_DESCRIPTIONS = "summaryDescriptions",
}

export const enum UserChoiceSingleField
{
  SINGLE_FIELD = "singleField"
}

export type UserChoice = UserChoiceItem | UserChoiceSummary | UserChoiceSingleField


export const enum ItemType
{
  CLASS = "class",
  ATTRIBUTE = "attribute",
  ASSOCIATION = "association",
  GENERALIZATION = "generalization",
}

export const enum Field
{
  IRI = "iri",
  TYPE = "type",
  NAME = "name",
  DESCRIPTION = "description",
  ORIGINAL_TEXT = "originalText",
  ORIGINAL_TEXT_INDEXES = "originalTextIndexes",
  DATA_TYPE = "dataType",
  SOURCE_CLASS = "source",
  TARGET_CLASS = "target",
  SOURCE_CARDINALITY = "sourceCardinality",
  TARGET_CARDINALITY = "targetCardinality",
}


export const enum ItemFieldUIName
{
  ID = "ID",
  TYPE = "Type",
  NAME = "Name",
  DESCRIPTION = "Description",
  ORIGINAL_TEXT = "Original text",
  ORIGINAL_TEXT_INDEXES = "Original text indexes",
  DATA_TYPE = "Data type",
  SOURCE_CLASS = "Source class",
  TARGET_CLASS = "Target class",
  CARDINALITY = "Cardinality",
  SOURCE_CARDINALITY = "Source cardinality",
  TARGET_CARDINALITY = "Target cardinality",
  GENERAl_CLASS = "General class",
  SPECIAL_CLASS = "Special class",
}