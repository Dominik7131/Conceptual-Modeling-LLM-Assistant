import { Item } from "./conceptualModel"
import { ConceptualModelJson } from "./conceptualModelJSON"
import { OriginalTextIndexesItem } from "./originalTextIndexes"
import { SummaryConceptualModel, SummaryStyle } from "./summary"
import { TextFilteringVariation } from "./textFilteringVariation"
import { UserChoiceItem, UserChoiceSummary } from "./utility"


export interface ItemSuggestionBody
{
  userChoice: UserChoiceItem
  domainDescription: string
  textFilteringVariation: TextFilteringVariation
  sourceClass: string
  targetClass: string
  conceptualModel: ConceptualModelJson
}


export interface SingleFieldSuggestionBody
{
  name: string
  description: string
  originalText: string
  field: string
  domainDescription: string
  userChoice: UserChoiceItem
  textFilteringVariation: TextFilteringVariation
  sourceClass: string
  targetClass: string
}


export interface SummarySuggestionBody
{
  summaryType: UserChoiceSummary
  domainDescription: string
  conceptualModel: SummaryConceptualModel
  style: SummaryStyle
}


export interface OriginalTextIndexesItemBody
{
  originalTextIndexesObject: OriginalTextIndexesItem[]
}


export interface SuggestedItemUserEvaluationBody
{
  item: Item
  userChoice: UserChoiceItem
  domainDescription: string
  textFilteringVariation: TextFilteringVariation
  isPositive: boolean
}


export interface SingleFieldUserEvaluationBody
{
  fieldName: string
  fieldText: string
  userChoice: UserChoiceItem
  domainDescription: string
  sourceClass: string
  isPositive: boolean
  textFilteringVariation: TextFilteringVariation
}


export interface SummaryUserEvaluationBody
{
  summaryType: UserChoiceSummary
  domainDescription: string
  conceptualModel: SummaryConceptualModel
  isPositive: boolean
  style: SummaryStyle
  summary: SummaryConceptualModel | string
}