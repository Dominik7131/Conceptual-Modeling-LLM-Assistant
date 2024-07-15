export const FORCE_NO_DOMAIN_DESCRIPTION = true

export const EMPTY_SUMMARY_CONCEPTUAL_MODEL = {
  classes: [], associations: [], generalizations: []
}

export const enum SummaryStyle
{
  NOT_SPECIFIED = "",
  EDUCATIONAL = "educational",
  ANALYTICAL = "analytical",
  FUNNY_STORY = "funny story",
}

export const SUMMARY_PLAIN_TEXT_STYLE_DEFAULT = SummaryStyle.NOT_SPECIFIED
export const SUMMARY_DESCRIPTIONS_STYLE_DEFAULT = SummaryStyle.NOT_SPECIFIED

export interface SummaryConceptualModel
{
  classes: SummaryClass[]
  associations: SummaryAssociation[]
}


export interface SummaryBaseItem
{
  name: string
  description: string
  originalText: string
}


export interface SummaryClass extends SummaryBaseItem
{
  attributes: SummaryAttribute[]
}


export interface SummaryAttribute extends SummaryBaseItem { }

export interface SummaryAssociation extends SummaryBaseItem
{
  source: string
  target: string
}