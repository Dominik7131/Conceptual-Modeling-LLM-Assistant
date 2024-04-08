
export const primaryColor = "#2196f3"

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
  TARGET_ENTITY = "target"
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
  CARDINALITY = "Cardinality",
  SOURCE_ENTITY = "Source entity",
  TARGET_ENTITY = "Target entity"
}

export interface summaryObject
{
  entities: any[],
  relationships: any[]
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
  cardinality: string
}

export interface Relationship extends BaseItem
{
  source: string
  target: string
  cardinality: string
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