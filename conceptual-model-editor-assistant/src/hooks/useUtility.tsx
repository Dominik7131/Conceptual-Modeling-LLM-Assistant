import { SetterOrUpdater } from "recoil";
import { Attribute, ConceptualModelSnapshot, DomainDescriptionSnapshot, EdgeData, Entity, Field, Item, ItemType, ItemsMessage, NodeData, Relationship, SidebarTabs, UserChoice } from "../interfaces"
import { Node, Edge, MarkerType, EdgeMarker, Position, internalsSymbol } from 'reactflow';


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


export const createEdgeUniqueID = (source: string, target: string, name: string): string =>
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


export const doesNodeAlreadyExistSetter = (setNodes: any, nodeID: string): boolean =>
{
  // It would be better more readable to use `doesNodeAlreadyExist` function however, when not using nodes the component
  // using this function does not get updated every time a node is changed

  let isNodeAlreadyPresent = false

  setNodes((nodes: Node[]) => nodes.map(currentNode => 
  {
    if (nodeID === currentNode.id)
    {
      isNodeAlreadyPresent = true
    }
    return currentNode
  }))

  return isNodeAlreadyPresent
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


export const doesEdgeAlreadyExistSetter = (setEdges: any, edgeID: string): boolean =>
{
  let isEdgeAlreadyPresent = false

  setEdges((edges: Edge[]) => edges.map(currentEdge => 
  {
    if (edgeID === currentEdge.id)
    {
      isEdgeAlreadyPresent = true
    }
    return currentEdge
  }))

  return isEdgeAlreadyPresent
}

export const doesEdgeBetweenNodesAlreadyExistSetter = (setEdges: any, sourceNodeID: string, targetNodeID: string): boolean =>
{
  let isEdgeAlreadyPresent = false

  setEdges((edges: Edge[]) => edges.map(currentEdge => 
  {
    if (currentEdge.source === sourceNodeID && currentEdge.target === targetNodeID)
    {
      isEdgeAlreadyPresent = true
    }
    return currentEdge
  }))

  return isEdgeAlreadyPresent
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


export const clipName = (name: string, maxLength: number): string =>
{
  if (name.length > maxLength)
  {
    const newName = name.substring(0, maxLength) + "..."
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


export const createErrorMessage = (item: Item, setErrorMessage: SetterOrUpdater<string>): void =>
{
  let message = ""

  if (item.type === ItemType.ENTITY)
  {
    message = `Entity "${item.name}" already exists`
  }
  else if (item.type === ItemType.ATTRIBUTE)
  {
    message = `Entity "${(item as Attribute)[Field.SOURCE_ENTITY]}" already contains attribute "${item.name}"`
  }
  else if (item.type === ItemType.RELATIONSHIP)
  {
    message = `Relationship in between source entity "${(item as Relationship)[Field.SOURCE_ENTITY]}" and target entity "${(item as Relationship)[Field.TARGET_ENTITY]}" already exists`
  }

  setErrorMessage(message)
}

export const onAddItem = (item: Item, setNodes: any, setEdges: any): boolean =>
{
  if (item.type === ItemType.ENTITY)
  {
    return addEntity(item as Entity, 66, 66, setNodes)
  }
  else if (item.type === ItemType.ATTRIBUTE)
  {
    return onAddAttribute(item as Attribute, setNodes)
  }
  else if (item.type === ItemType.RELATIONSHIP)
  {
    return onAddRelationship(item as Relationship, setNodes, setEdges)
  }
  else
  {
    throw Error("Unknown item type")
  }
}


export const addEntity = (entity: Entity, positionX: number, positionY: number, setNodes: any): boolean =>
{
  if (doesNodeAlreadyExistSetter(setNodes, entity.name))
  {
    return false
  }

  const nodeData: NodeData = { entity: entity, attributes: [] }

  const newNode: Node = {
    id: entity.name, type: "customNode", position: { x: positionX, y: positionY },
    data: nodeData
  }

  setNodes((previousNodes: Node[]) => {
    return [...previousNodes, newNode]
  })

  return true
}


const onAddAttribute = (attribute : Attribute, setNodes: any) =>
{
  const nodeID = attribute.source
  let isAttributePresent = false
  

  setNodes((nodes: Node[]) => nodes.map((currentNode : Node) =>
  {
    // Skip nodes which are not getting a new attribute
    if (currentNode.id !== nodeID)
    {
      return currentNode
    }

    // If the node already contains the selected attribute do not add anything
    currentNode.data.attributes.forEach((currentAttribute : Attribute) =>
    {
      if (currentAttribute.name === attribute.name)
      {
        isAttributePresent = true
      }
    })

    if (isAttributePresent)
    {
      return currentNode 
    }
    const newAttributes = [...currentNode.data.attributes, attribute]  
    const newData : NodeData = { ...currentNode.data, attributes: newAttributes }
    const updatedNode: Node = {...currentNode, data: newData}

    return updatedNode
  }))

  return !isAttributePresent
}


const onAddRelationship = (relationship : Relationship, setNodes: any, setEdges: any): boolean =>
{
  // Returns "true" if the operation was successfull otherwise "false"

  if (doesEdgeBetweenNodesAlreadyExistSetter(setEdges, relationship.source, relationship.target))
  {
    return false
  }

  const newEdgeID = createEdgeUniqueID(relationship.source, relationship.target, relationship.name)
  const isTargetNodeCreated: boolean = doesNodeAlreadyExistSetter(setNodes, relationship.target)

  if (!isTargetNodeCreated)
  {
    // TODO: Try to come up with a better node position
    const newNode: Node = createNode(relationship.target, 500, 100)

    setNodes((previousNodes: Node[]) => 
    {
      return [...previousNodes, newNode]
    })
  }

  const edgeData: EdgeData = { relationship: relationship }

  const markerEnd = relationship[Field.TYPE] === ItemType.GENERALIZATION ? CUSTOM_ISA_EDGE_MARKER : CUSTOM_EDGE_MARKER

  const newEdge : Edge = {
    id: newEdgeID, type: "custom-edge", source: relationship.source, target: relationship.target, label: relationship.name, data: edgeData,
    markerEnd: markerEnd
  }

  setEdges((previousEdges: Edge[]) =>
  {
    return [...previousEdges, newEdge]
  })

  return true
}


export const createNode = (nodeName: string, positionX: number, positionY: number): Node =>
{
  const nodeIRI = createIRIFromName(nodeName)
  const newEntity: Entity = {
    [Field.IRI]: nodeIRI, [Field.NAME]: nodeName, [Field.TYPE]: ItemType.ENTITY, [Field.DESCRIPTION]: "",
    [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: [],
  }

  const nodeData: NodeData = { entity: newEntity, attributes: [] }

  const newNode: Node = { id: nodeName, type: "customNode", position: { x: positionX, y: positionY }, data: nodeData }
  
  return newNode
}


export const addNode = (nodeName: string, positionX: number, positionY: number, setNodes: any) =>
{
  if (!nodeName)
  {
    alert("Node name is empty")
    return
  }

  if (doesNodeAlreadyExistSetter(setNodes, nodeName))
  {
    return
  }

  const newNode: Node = createNode(nodeName, positionX, positionY)

  setNodes((previousNodes: Node[]) => {
    return [...previousNodes, newNode]
  })
}


export const createIRIFromName = (name: string): string =>
{
  const iri = name.split(" ").join("-").toLowerCase()
  return iri
}


export const convertConceptualModelToJSON = (nodes: Node[], edges: Edge[], isOnlyNames : boolean) =>
{
  let result: { [key: string]: any } = {
    entities: []
  }

  for (let node of nodes)
  {
    let attributes = []
    for (let attribute of node.data.attributes)
    {
      if (isOnlyNames)
      {
        attributes.push({[Field.NAME]: attribute.name})
      }
      else
      {
        attributes.push({[Field.NAME]: attribute.name, [Field.ORIGINAL_TEXT]: attribute.originalText})
      }
    }

    result.entities.push({[Field.NAME]: node.id, attributes: attributes})
  }


  let relationships = []
  for (let edge of edges)
  {
    if (isOnlyNames)
    {
      relationships.push({[Field.NAME]: edge.data.relationship.name, "sourceEntity": edge.source, "targetEntity": edge.target})
    }
    else
    {
      relationships.push({[Field.NAME]: edge.data.relationship.name, [Field.ORIGINAL_TEXT]: edge.data.originalText, "sourceEntity": edge.source, "targetEntity": edge.target})
    }
  }

  result.relationships = relationships

  return result
}


export const changeTitle = (userChoice: UserChoice, sourceItemName: string, targetItemName: string, setTitle: any): void =>
{
  if (userChoice === UserChoice.ENTITIES)
  {
    const message = ""
    setTitle((title: ItemsMessage) => { return { ...title, entities: message} })
  }
  else if (userChoice === UserChoice.ATTRIBUTES)
  {
    const message = `Selected entity: ${sourceItemName}`
    setTitle((title: ItemsMessage) => { return { ...title, attributes: message} })
  }
  else if (userChoice === UserChoice.RELATIONSHIPS)
  {
    const message = `Selected entity: ${sourceItemName}`
    setTitle((title: ItemsMessage) => { return { ...title, relationships: message} })
  }
  else if (userChoice === UserChoice.RELATIONSHIPS2)
  {
    const message = `Source entity: ${sourceItemName}\nTarget entity: ${targetItemName}`
    setTitle((title: ItemsMessage) => { return { ...title, relationships: message} })
  }
}


export const onClearSuggestedItems = (itemType: ItemType, setSuggestedEntities: any, setSuggestedAttributes: any, setSuggestedRelationships: any): void =>
{
  if (itemType === ItemType.ENTITY)
  {
    setSuggestedEntities([])
  }
  else if (itemType === ItemType.ATTRIBUTE)
  {
    setSuggestedAttributes([])
  }
  else if (itemType === ItemType.RELATIONSHIP)
  {
    setSuggestedRelationships([])
  }
}


export const changeSidebarTab = (itemType: ItemType, setSidebarTab: any) =>
{
  if (itemType === ItemType.ENTITY)
  {
    setSidebarTab(SidebarTabs.ENTITIES)
  }
  else if (itemType === ItemType.ATTRIBUTE)
  {
    setSidebarTab(SidebarTabs.ATTRIBUTES)
  }
  else if (itemType === ItemType.RELATIONSHIP || itemType === ItemType.GENERALIZATION)
  {
    setSidebarTab(SidebarTabs.RELATIONSHIPS)
  }
  else
  {
    throw Error(`Received unknown item type: ${itemType}`)
  }
}


export const snapshotDomainDescription = (userChoice: UserChoice, domainDescription: string, setSnapshotDomainDescription: any) =>
{
  setSnapshotDomainDescription((previousDomain: DomainDescriptionSnapshot) => ({...previousDomain, [userChoice]: domainDescription}))
}

export const snapshotConceptualModel = (userChoice: UserChoice, conceptualModel: any, setSnapshotConceptualModel: any) =>
{
  setSnapshotConceptualModel((previousModel: ConceptualModelSnapshot) => ({...previousModel, [userChoice]: conceptualModel}))
} 

export const getSnapshotDomainDescription = (userChoice: UserChoice, snapshot: DomainDescriptionSnapshot): string =>
{
  return snapshot[userChoice]
}

export const getSnapshotConceptualModel = (userChoice: UserChoice, snapshot: ConceptualModelSnapshot) =>
{
  if (userChoice === UserChoice.SUMMARY_PLAIN_TEXT || userChoice === UserChoice.SUMMARY_DESCRIPTIONS)
  {
    return snapshot[userChoice]
  }
  throw Error(`Received unexpected user choice: ${userChoice}`)
}

export const itemTypeToUserChoice = (itemType: ItemType): UserChoice =>
{
  if (itemType === ItemType.ENTITY)
  {
    return UserChoice.ENTITIES
  }
  else if (itemType === ItemType.ATTRIBUTE)
  {
    return UserChoice.ATTRIBUTES
  }
  else if (itemType === ItemType.RELATIONSHIP || itemType === ItemType.GENERALIZATION)
  {
    return UserChoice.RELATIONSHIPS
  }

  throw Error(`Received unknown item type: ${itemType}`)
}


export const CUSTOM_EDGE_MARKER: EdgeMarker = { type: MarkerType.Arrow, width: 50, height: 50, strokeWidth: 1 }
export const CUSTOM_ISA_EDGE_MARKER: EdgeMarker = { type: MarkerType.ArrowClosed, width: 40, height: 40, strokeWidth: 0.8 }


export const SUMMARY_DESCRIPTIONS_NAME = "Summary: descriptions"
export const SUMMARY_PLAIN_TEXT_NAME = "Summary: plain text"

const BASE_URL = "http://127.0.0.1:5000/"
export const HEADER = { "Content-Type": "application/json" }

export const SIDEBAR_BUTTON_SIZE = "small"
export const SIDEBAR_BUTTON_COLOR = "secondary"

const SUGGEST_ITEMS_ENDPOINT = "suggest"
const SUMMARY_PLAIN_TEXT_ENDPOINT = "summary_plain_text"
const SUMMARY_DESCRIPTIONS_ENDPOINT = "summary_descriptions"
const EDIT_ITEM_ENDPOINT = "getOnly"
const MERGE_ORIGINAL_TEXT_ENDPOINT = "merge_original_texts"
const SAVE_SUGESTED_ITEM = "save_suggested_item"
const SAVE_SUGESTED_SINGLE_FIELD = "save_suggested_single_field"
const SAVE_SUGESTED_DESCRIPTION = "save_suggested_description"

export const SUGGEST_ITEMS_URL = BASE_URL + SUGGEST_ITEMS_ENDPOINT
export const SUMMARY_PLAIN_TEXT_URL = BASE_URL + SUMMARY_PLAIN_TEXT_ENDPOINT
export const SUMMARY_DESCRIPTIONS_URL = BASE_URL + SUMMARY_DESCRIPTIONS_ENDPOINT
export const EDIT_ITEM_URL = BASE_URL + EDIT_ITEM_ENDPOINT
export const MERGE_ORIGINAL_TEXT_URL = BASE_URL + MERGE_ORIGINAL_TEXT_ENDPOINT
export const SAVE_SUGESTED_ITEM_URL = BASE_URL + SAVE_SUGESTED_ITEM
export const SAVE_SUGESTED_SINGLE_FIELD_URL = BASE_URL + SAVE_SUGESTED_SINGLE_FIELD
export const SAVE_SUGESTED_DESCRIPTION_URL = BASE_URL + SAVE_SUGESTED_DESCRIPTION
export const JSON_MODEL_FROM_IRI_URL = "https://backend.dataspecer.com/simplified-semantic-model?iri="

// TODO: It is probably better to use "null" instead of blank item
export const blankEntity: Entity = {
  [Field.IRI]: "", [Field.TYPE]: ItemType.ENTITY, [Field.NAME]: "", [Field.DESCRIPTION]: "", [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: []
}

export const blankAttribute: Attribute = {
  [Field.IRI]: "", [Field.NAME]: "", [Field.DESCRIPTION]: "", [Field.DATA_TYPE]: "", [Field.ORIGINAL_TEXT]: "",
  [Field.ORIGINAL_TEXT_INDEXES]: [], [Field.TYPE]: ItemType.ATTRIBUTE, [Field.SOURCE_CARDINALITY]: "",
  [Field.SOURCE_ENTITY]: ""
}

// export const blankRelationship: Relationship = {
//   [Field.IRI]: "", [Field.TYPE]: ItemType.ENTITY, [Field.NAME]: "", [Field.DESCRIPTION]: "", [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: []
// }

