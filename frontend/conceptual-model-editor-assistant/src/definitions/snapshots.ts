import { SummaryConceptualModel, SummaryStyle } from "./summary"
import { TextFilteringVariation } from "./textFilteringVariation"
import { UserChoiceItem, UserChoiceSingleField, UserChoiceSummary } from "./utility"


export interface DomainDescriptionSnapshot
{
  [UserChoiceItem.CLASSES]: string
  [UserChoiceItem.ATTRIBUTES]: string
  [UserChoiceItem.ASSOCIATIONS_ONE_KNOWN_CLASS]: string
  [UserChoiceItem.ASSOCIATIONS_TWO_KNOWN_CLASSES]: string
  [UserChoiceSingleField.SINGLE_FIELD]: string
  [UserChoiceSummary.SUMMARY_PLAIN_TEXT]: string
  [UserChoiceSummary.SUMMARY_DESCRIPTIONS]: string
}

export interface TextFilteringVariationSnapshot
{
  [UserChoiceItem.CLASSES]: TextFilteringVariation
  [UserChoiceItem.ATTRIBUTES]: TextFilteringVariation
  [UserChoiceItem.ASSOCIATIONS_ONE_KNOWN_CLASS]: TextFilteringVariation
  [UserChoiceItem.ASSOCIATIONS_TWO_KNOWN_CLASSES]: TextFilteringVariation
  [UserChoiceSingleField.SINGLE_FIELD]: TextFilteringVariation
  [UserChoiceSummary.SUMMARY_PLAIN_TEXT]: TextFilteringVariation
  [UserChoiceSummary.SUMMARY_DESCRIPTIONS]: TextFilteringVariation
}

export interface ConceptualModelSnapshot
{
  [UserChoiceSummary.SUMMARY_PLAIN_TEXT]: SummaryConceptualModel
  [UserChoiceSummary.SUMMARY_DESCRIPTIONS]: SummaryConceptualModel
}


export interface SummaryStyleSnapshot
{
  [UserChoiceSummary.SUMMARY_PLAIN_TEXT]: SummaryStyle
  [UserChoiceSummary.SUMMARY_DESCRIPTIONS]: SummaryStyle
}