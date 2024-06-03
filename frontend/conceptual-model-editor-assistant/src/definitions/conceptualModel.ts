import { EdgeMarker, MarkerType } from "reactflow"
import { Field, ItemType } from "./utility"


export const CUSTOM_NODE_TYPE = "customNode"
export const CUSTOM_EDGE_TYPE = "custom-edge"
export const CUSTOM_EDGE_MARKER: EdgeMarker = { type: MarkerType.Arrow, width: 50, height: 50, strokeWidth: 1 }
export const CUSTOM_ISA_EDGE_MARKER: EdgeMarker = { type: MarkerType.ArrowClosed, width: 40, height: 40, strokeWidth: 0.8 }

export const DEFAULT_CARDINALITY = "many"

export const DATA_TYPE_CHOICES = ["string", "number", "time", "boolean"]

export const BLANK_CLASS: Class = {
  [Field.IRI]: "", [Field.TYPE]: ItemType.CLASS, [Field.NAME]: "", [Field.DESCRIPTION]: "", [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: []
}

export const blankAttribute: Attribute = {
  [Field.IRI]: "", [Field.NAME]: "", [Field.DESCRIPTION]: "", [Field.DATA_TYPE]: "", [Field.ORIGINAL_TEXT]: "",
  [Field.ORIGINAL_TEXT_INDEXES]: [], [Field.TYPE]: ItemType.ATTRIBUTE, [Field.SOURCE_CARDINALITY]: "",
  [Field.SOURCE_CLASS]: ""
}


export const enum NodeHandleID
{
  SOURCE_TOP = "source-top",
  SOURCE_BOTTOM = "source-bottom",
  TARGET_LEFT = "target-left",
  TARGET_RIGHT = "target-right",
}

export const enum NodeHandleType
{
  SOURCE = "source",
  TARGET = "target",
}

export interface NodeData
{
  class: Class
  attributes: Attribute[]
}

export interface EdgeData
{
  association: Association
}

export type Item = Class | Attribute | Association


interface BaseItem
{
  type : ItemType
  iri: string
  name: string
  description: string
  originalText: string
  originalTextIndexes: number[]
}

export interface Class extends BaseItem { }

export interface Attribute extends BaseItem
{
  source: string
  dataType: string
  sourceCardinality: string
}

export interface Association extends BaseItem
{
  source: string
  target: string
  sourceCardinality: string
  targetCardinality: string
}


export interface ItemsMessage
{
  classes: string
  attributes: string
  associations: string
}