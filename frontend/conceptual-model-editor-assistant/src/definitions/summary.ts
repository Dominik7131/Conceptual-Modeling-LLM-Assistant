import { Association } from "./conceptualModel"


export const FORCE_NO_DOMAIN_DESCRIPTION = true

export const EMPTY_SUMMARY_CONCEPTUAL_MODEL = {
  classes: [], associations: []
}

export interface SummaryConceptualModel
{
  classes: SummaryClass[]
  associations: Association[]
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