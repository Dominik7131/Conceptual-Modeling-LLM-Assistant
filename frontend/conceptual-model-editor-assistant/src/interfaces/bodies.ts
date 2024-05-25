import { ConceptualModelObject, Item, SummaryObject, TextFilteringVariation, UserChoice } from "./interfaces"


export interface ItemSuggestionBody
{
  sourceClass: string
  targetClass: string
  userChoice: UserChoice
  domainDescription: string
  textFilteringVariation: TextFilteringVariation
}


export interface SummarySuggestionBody
{
  summaryType: UserChoice,
  conceptualModelJSON: ConceptualModelObject
  domainDescription: string
}


export interface SingleFieldSuggestionBody
{
  name: string
  sourceClass: string
  targetClass: string
  field: string
  userChoice: UserChoice
  domainDescription: string
  textFilteringVariation: TextFilteringVariation
}


export interface SuggestedItemUserEvaluationBody
{
  domainDescription: string
  isPositive: boolean
  item: Item
  userChoice: UserChoice
  textFilteringVariation: TextFilteringVariation
}


export interface SingleFieldUserEvaluationBody
{
  domainDescription: string
  fieldName: string
  fieldText: string
  userChoice: UserChoice
  sourceClass: string
  isPositive: boolean
  textFilteringVariation: TextFilteringVariation
}


export interface SummaryUserEvaluationBody
{
  domainDescription: string
  isPositive: boolean
  summary: SummaryObject | string
  conceptualModel: ConceptualModelObject
  summaryType: UserChoice
}