import { UserChoice } from "../interfaces"
import { Node, Edge } from 'reactflow';


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
    if (nodes[i].id === nodeID.toLowerCase())
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


export const BASE_URL = "http://127.0.0.1:5000/"
export const HEADER = { "Content-Type": "application/json" }