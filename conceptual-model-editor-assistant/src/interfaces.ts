
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

export interface SummaryObject
{
  entities: any[]
  relationships: any[]
}

export interface NodeData
{
  [Field.DESCRIPTION]: string
  [Field.ORIGINAL_TEXT]: string
  [Field.ORIGINAL_TEXT_INDEXES]: number[]
  attributes: Attribute[]
  onEdit: (item: Item) => void
  onSuggestItems: (userChoice: UserChoice, sourceItemName: string | null, targetItemName: string | null) => void
  onAddNewAttribute: (sourceEntity: Entity) => void
}

export interface EdgeData
{
  [Field.ID]: number
  [Field.DESCRIPTION]: string
  [Field.ORIGINAL_TEXT]: string
  [Field.ORIGINAL_TEXT_INDEXES]: number[]
  [Field.CARDINALITY]: string
  onEdit: (item: Item) => void
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

export interface ItemJson
{
  iri: string
  title: string
  description: string
}

interface ClassesJson extends ItemJson { }

interface DomainRangeJson
{
  // TODO: Why do we have "target entity" in attributes?
  // Isn't that going to be always empty string?
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
  classes: ClassesJson[]
  attributes: AttributeJson[]
  relationships: RelationshipJson[]
  generalizations: GeneralizationJson[]
}