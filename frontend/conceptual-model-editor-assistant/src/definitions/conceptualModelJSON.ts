export interface ItemJson
{
  iri: string
  title: string
  description: string
}

export interface ClassJson extends ItemJson { }

interface DomainRangeJson
{
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
  classes: ClassJson[]
  attributes: AttributeJson[]
  relationships: RelationshipJson[]
  generalizations: GeneralizationJson[]
}