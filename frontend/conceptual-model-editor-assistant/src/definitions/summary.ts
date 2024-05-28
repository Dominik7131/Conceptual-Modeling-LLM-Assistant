import { Association } from "./conceptualModel"


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