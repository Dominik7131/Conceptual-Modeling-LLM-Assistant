
export const PRIMARY_COLOR = "#2196f3"

export const enum UserChoice
{
  ENTITIES = "entities",
  ATTRIBUTES = "attributes",
  RELATIONSHIPS = "relationships",
  RELATIONSHIPS2 = "relationships2",
  SUMMARY_PLAIN_TEXT = "summary-plain-text",
  SUMMARY_DESCRIPTIONS = "summary-descriptions",
  SINGLE_FIELD = "single-field"
}

export const enum ItemType
{
  ENTITY = "entity",
  ATTRIBUTE = "attribute",
  RELATIONSHIP = "relationship",
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
  SOURCE_ENTITY = "source",
  TARGET_ENTITY = "target",
  SOURCE_CARDINALITY = "sourceCardinality",
  TARGET_CARDINALITY = "targetCardinality",
}


export const enum ItemFieldUIName
{
  ID = "ID",
  TYPE = "Ttype",
  NAME = "Name",
  DESCRIPTION = "Description",
  ORIGINAL_TEXT = "Original text",
  ORIGINAL_TEXT_INDEXES = "Original text indexes",
  DATA_TYPE = "Data type",
  SOURCE_ENTITY = "Source entity",
  TARGET_ENTITY = "Target entity",
  CARDINALITY = "Cardinality",
  SOURCE_CARDINALITY = "Source cardinality",
  TARGET_CARDINALITY = "Target cardinality",
  GENERAl_ENTITY = "General entity",
  SPECIAL_ENTITY = "Special entity",
}


export const enum TopbarTabs
{
  MAIN = "0",
  SUMMARY_PLAIN_TEXT = "1",
  SUMMARY_DESCRIPTION = "2",
  IMPORT_EXPORT = "3",
  SETTINGS = "4"
}

export const enum SidebarTabs
{
  ENTITIES = "0",
  ATTRIBUTES = "1",
  RELATIONSHIPS = "2",
}


export interface SummaryObject
{
  entities: any[]
  relationships: any[]
}

export interface DomainDescriptionSnapshot
{
  [UserChoice.ENTITIES]: string
  [UserChoice.ATTRIBUTES]: string
  [UserChoice.RELATIONSHIPS]: string
  [UserChoice.RELATIONSHIPS2]: string
  [UserChoice.SINGLE_FIELD]: string
  [UserChoice.SUMMARY_PLAIN_TEXT]: string
  [UserChoice.SUMMARY_DESCRIPTIONS]: string
}

export interface ConceptualModelSnapshot
{
  // TODO: Fill in the correct type
  [UserChoice.SUMMARY_PLAIN_TEXT]: any
  [UserChoice.SUMMARY_DESCRIPTIONS]: any
}


export interface NodeData
{
  entity: Entity
  attributes: Attribute[]
}


export interface EdgeData
{
  relationship: Relationship
}


export type Item = Entity | Attribute | Relationship


export type ItemFieldsUnification = keyof Entity | keyof Attribute | keyof Relationship


interface BaseItem
{
  type : ItemType
  iri: string
  name: string
  description: string
  originalText: string
  originalTextIndexes: number[]
}

export interface Entity extends BaseItem { }

export interface Attribute extends BaseItem
{
  source: string
  dataType: string
  sourceCardinality: string
}

export interface Relationship extends BaseItem
{
  source: string
  target: string
  sourceCardinality: string
  targetCardinality: string
}

export interface OriginalTextIndexesItem
{
  indexes: [number, number]
  label: string
}


export interface SerializedConceptualModel
{
  entities: any[] // TODO: Provide correct type
  relationships: Relationship[]
}

export interface ItemJson
{
  iri: string
  title: string
  description: string
}

export interface EntityJson extends ItemJson { }

interface DomainRangeJson
{
  // TODO: Why do we have "target entity" in attributes?
  // Isn't that going to be always empty string?

  // Possible cardinalities: "optional-one" | "optional-many" | "one-one" | "one-many" | null
  domain: string
  domainCardinality: string | null
  range: string
  rangeCardinality: string | null
}

export interface AttributeJson extends ItemJson, DomainRangeJson { }

export interface RelationshipJson extends ItemJson, DomainRangeJson { }

export interface GeneralizationJson extends ItemJson
{
  generalClass: string
  specialClass: string
}

export interface ConceptualModelJson
{
  $schema: string
  classes: EntityJson[]
  attributes: AttributeJson[]
  relationships: RelationshipJson[]
  generalizations: GeneralizationJson[]
}


export interface ItemsMessage
{
  entities: string
  attributes: string
  relationships: string
}