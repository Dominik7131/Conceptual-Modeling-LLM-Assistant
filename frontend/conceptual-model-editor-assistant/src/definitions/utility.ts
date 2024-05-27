import { TextFilteringVariation } from "./textFilteringVariation"


export const ORIGINAL_TEXT_ID = "highlightedOriginalText"
export const NOTHING_SELECTED_MSG = "Please select some part of your conceptual model."

export const TEXT_FILTERING_VARIATION_DEFAULT_VALUE = TextFilteringVariation.SYNTACTIC

export const PRIMARY_COLOR = "#2196f3"
export const BLACK_COLOR = "black"
export const GRAY_COLOR = "gray"

export const TOOLTIP_ENTER_DELAY_MS = 500
export const TOOLTIP_LEAVE_DELAY_MS = 200


export const enum UserChoice
{
  CLASSES = "classes",
  ATTRIBUTES = "attributes",
  ASSOCIATIONS_ONE_KNOWN_CLASS = "associations1",
  ASSOCIATIONS_TWO_KNOWN_CLASSES = "associations2",
  SUMMARY_PLAIN_TEXT = "summaryPlainText",
  SUMMARY_DESCRIPTIONS = "summaryDescriptions",
  SINGLE_FIELD = "singleField"
}

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