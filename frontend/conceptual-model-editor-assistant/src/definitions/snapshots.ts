import { TextFilteringVariation } from "./textFilteringVariation"
import { UserChoice } from "./utility"


export interface DomainDescriptionSnapshot
{
  [UserChoice.CLASSES]: string
  [UserChoice.ATTRIBUTES]: string
  [UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS]: string
  [UserChoice.ASSOCIATIONS_TWO_KNOWN_CLASSES]: string
  [UserChoice.SINGLE_FIELD]: string
  [UserChoice.SUMMARY_PLAIN_TEXT]: string
  [UserChoice.SUMMARY_DESCRIPTIONS]: string
}

export interface TextFilteringVariationSnapshot
{
  [UserChoice.CLASSES]: TextFilteringVariation
  [UserChoice.ATTRIBUTES]: TextFilteringVariation
  [UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS]: TextFilteringVariation
  [UserChoice.ASSOCIATIONS_TWO_KNOWN_CLASSES]: TextFilteringVariation
  [UserChoice.SINGLE_FIELD]: TextFilteringVariation
  [UserChoice.SUMMARY_PLAIN_TEXT]: TextFilteringVariation
  [UserChoice.SUMMARY_DESCRIPTIONS]: TextFilteringVariation
}

export interface ConceptualModelSnapshot
{
  // TODO: Fill in the correct type
  [UserChoice.SUMMARY_PLAIN_TEXT]: any
  [UserChoice.SUMMARY_DESCRIPTIONS]: any
}