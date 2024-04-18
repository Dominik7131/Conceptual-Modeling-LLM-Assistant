
export const PRIMARY_COLOR = "#2196f3"

export const enum UserChoice
{
  ENTITIES = "entities",
  ATTRIBUTES = "attributes",
  RELATIONSHIPS = "relationships",
  RELATIONSHIPS2 = "relationships2"
}

export const enum ItemType
{
  ENTITY = "entity",
  ATTRIBUTE = "attribute",
  RELATIONSHIP = "relationship"
}

export const enum Field
{
  ID = "ID",
  TYPE = "type",
  NAME = "name",
  DESCRIPTION = "description",
  ORIGINAL_TEXT = "originalText",
  ORIGINAL_TEXT_INDEXES = "originalTextIndexes",
  DATA_TYPE = "dataType",
  CARDINALITY = "cardinality",
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
}


export interface SummaryObject
{
  entities: any[]
  relationships: any[]
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
  ID: number
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
  // Optional-one: 0..1
  // One: 1..1
  // Many: 1..*
  // Is optional-many (0..*) missing?
  // Is many-many (*..*) missing
  domain: string
  domainCardinality: "optional-one" | "one" | "many"
  range: string
  rangeCardinality: "optional-one" | "one" | "many"
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