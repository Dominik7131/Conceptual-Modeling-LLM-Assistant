import { ItemType, UserChoice } from "../interfaces"
import { Node, Edge, MarkerType, EdgeMarker } from 'reactflow';


const useUtility = () =>
{
    const getUserChoiceSingular = (userChoice : string) =>
    {
      if (!userChoice)
      {
        return ""
      }

      let result : string = ""
      if (userChoice === UserChoice.ENTITIES) { result = "Entity" }
      else if (userChoice === UserChoice.ATTRIBUTES) { result = "Attribute" }
      else if (userChoice === UserChoice.RELATIONSHIPS) { result = "Relationship" }
      return result
    }

    return { capitalizeString, getUserChoiceSingular }
}

export default useUtility


export const createEdgeID = (source: string, target: string, name: string): string =>
{
  return `${source}-${name}-${target}`
}

export const capitalizeString = (inputString : string) =>
{
  if (!inputString)
  {
    return ""
  }

  return inputString.charAt(0).toUpperCase() + inputString.slice(1)
}


export const doesNodeAlreadyExist = (nodes: Node[], nodeID: string): boolean =>
{
  for (let i = 0; i < nodes.length; i++)
  {
    if (nodes[i].id === nodeID)
    {
      return true
    }
  }

  return false
}


export const doesEdgeAlreadyExist = (edges: Edge[], edgeID: string): boolean =>
{
  for (let i = 0; i < edges.length; i++)
  {
    const edge: Edge = edges[i]

    if (edge.id === edgeID)
    {
      return true
    }
  }

  return false
}


export const getNodeByID = (nodes: Node[], nodeID: string): Node | null =>
{
  for (let i = 0; i < nodes.length; i++)
  {
    if (nodes[i].id === nodeID)
    {
      return nodes[i]
    }
  }
  
  return null
}


export const clipName = (name: string): string =>
{
  if (name.length > 18)
  {
      const newName = name.substring(0, 12) + "..."
      return newName
  }
  return name
}


export const userChoiceToItemType = (userChoice: UserChoice): ItemType =>
{
  if (userChoice === UserChoice.ENTITIES)
  {
    return ItemType.ENTITY 
  }

  if (userChoice === UserChoice.ATTRIBUTES)
  {
    return ItemType.ATTRIBUTE
  }

  if (userChoice === UserChoice.RELATIONSHIPS || userChoice === UserChoice.RELATIONSHIPS2)
  {
    return ItemType.RELATIONSHIP
  }

  throw Error(`Unexpected user choice: ${userChoice}`)
}


export const CUSTOM_EDGE_MARKER: EdgeMarker = { type: MarkerType.Arrow, width: 40, height: 40, color: "black", strokeWidth: 0.8 }
export const CUSTOM_ISA_EDGE_MARKER: EdgeMarker = { type: MarkerType.ArrowClosed, width: 40, height: 40, color: "black", strokeWidth: 0.8 }


export const SUMMARY_DESCRIPTIONS_NAME = "Summary: descriptions"
export const SUMMARY_PLAIN_TEXT_NAME = "Summary: plain text"

const BASE_URL = "http://127.0.0.1:5000/"
export const HEADER = { "Content-Type": "application/json" }

const SUGGEST_ITEMS_ENDPOINT = "suggest"
const SUMMARY_PLAIN_TEXT_ENDPOINT = "summary_plain_text"
const SUMMARY_DESCRIPTIONS_ENDPOINT = "summary_descriptions"
const EDIT_ITEM_ENDPOINT = "getOnly"
const MERGE_ORIGINAL_TEXT_ENDPOINT = "merge_original_texts"

export const SUGGEST_ITEMS_URL = BASE_URL + SUGGEST_ITEMS_ENDPOINT
export const SUMMARY_PLAIN_TEXT_URL = BASE_URL + SUMMARY_PLAIN_TEXT_ENDPOINT
export const SUMMARY_DESCRIPTIONS_URL = BASE_URL + SUMMARY_DESCRIPTIONS_ENDPOINT
export const EDIT_ITEM_URL = BASE_URL + EDIT_ITEM_ENDPOINT
export const MERGE_ORIGINAL_TEXT_URL = BASE_URL + MERGE_ORIGINAL_TEXT_ENDPOINT
