import { SetterOrUpdater } from "recoil";
import { Attribute, ConceptualModelSnapshot, DomainDescriptionSnapshot, EdgeData, Class, Field, Item, ItemType, ItemsMessage, NodeData, Association, SidebarTabs, UserChoice } from "../interfaces"
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
      if (userChoice === UserChoice.CLASSES) { result = "Entity" }
      else if (userChoice === UserChoice.ATTRIBUTES) { result = "Attribute" }
      else if (userChoice === UserChoice.ASSOCIATIONS) { result = "Relationship" }
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
  if (userChoice === UserChoice.CLASSES)
  {
    return ItemType.CLASS 
  }

  if (userChoice === UserChoice.ATTRIBUTES)
  {
    return ItemType.ATTRIBUTE
  }

  if (userChoice === UserChoice.ASSOCIATIONS || userChoice === UserChoice.ASSOCIATIONS2)
  {
    return ItemType.ASSOCIATION
  }

  throw Error(`Unexpected user choice: ${userChoice}`)
}


export const createErrorMessage = (item: Item, setErrorMessage: SetterOrUpdater<string>): void =>
{
  let message = ""

  if (item.type === ItemType.CLASS)
  {
    message = `Class "${item.name}" already exists`
  }
  else if (item.type === ItemType.ATTRIBUTE)
  {
    message = `Class "${(item as Attribute)[Field.SOURCE_CLASS]}" already contains attribute "${item.name}"`
  }
  else if (item.type === ItemType.ASSOCIATION)
  {
    message = `Association in between source class "${(item as Association)[Field.SOURCE_CLASS]}" and target class "${(item as Association)[Field.TARGET_CLASS]}" already exists`
  }

  setErrorMessage(message)
}

export const onAddItem = (item: Item, setNodes: any, setEdges: any): boolean =>
{
  if (item.type === ItemType.CLASS)
  {
    return onAddClass(item as Class, 66, 66, setNodes)
  }
  else if (item.type === ItemType.ATTRIBUTE)
  {
    return onAddAttribute(item as Attribute, setNodes)
  }
  else if (item.type === ItemType.ASSOCIATION)
  {
    return onAddAssociation(item as Association, setNodes, setEdges)
  }
  else
  {
    throw Error("Unknown item type")
  }
}


export const onAddClass = (clss: Class, positionX: number, positionY: number, setNodes: any): boolean =>
{
  if (doesNodeAlreadyExistSetter(setNodes, clss[Field.IRI]))
  {
    return false
  }

  const iri = createIRIFromName(clss[Field.NAME])
  clss = { ...clss, [Field.IRI]: iri}

  const nodeData: NodeData = { class: clss, attributes: [] }

  const newNode: Node = {
    id: clss[Field.IRI], type: "customNode", position: { x: positionX, y: positionY },
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
      if (currentAttribute.iri === attribute.iri)
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


const onAddAssociation = (association : Association, setNodes: any, setEdges: any): boolean =>
{
  // Returns "true" if the operation was successfull otherwise "false"
  console.log("Adding: ", association)

  if (doesEdgeBetweenNodesAlreadyExistSetter(setEdges, association.source, association.target))
  {
    return false
  }

  const newEdgeID = createEdgeUniqueID(association[Field.SOURCE_CLASS], association[Field.TARGET_CLASS], association[Field.NAME])
  const isTargetNodeCreated: boolean = doesNodeAlreadyExistSetter(setNodes, association[Field.TARGET_CLASS])

  if (!isTargetNodeCreated)
  {
    const associationName = createNameFromIRI(association[Field.TARGET_CLASS])
    const newNode: Node = createNode(associationName, 500, 100)

    setNodes((previousNodes: Node[]) => 
    {
      return [...previousNodes, newNode]
    })
  }

  const isSourceNodeCreated: boolean = doesNodeAlreadyExistSetter(setNodes, association[Field.SOURCE_CLASS])
  if (!isSourceNodeCreated)
  {
    const associationName = createNameFromIRI(association[Field.SOURCE_CLASS])
    const newNode: Node = createNode(associationName, 500, 200)

    setNodes((previousNodes: Node[]) =>
    {
      return [...previousNodes, newNode]
    })
  }


  const edgeData: EdgeData = { association: association }

  const markerEnd = association[Field.TYPE] === ItemType.GENERALIZATION ? CUSTOM_ISA_EDGE_MARKER : CUSTOM_EDGE_MARKER

  const newEdge : Edge = {
    id: newEdgeID, type: "custom-edge", source: association[Field.SOURCE_CLASS], target: association[Field.TARGET_CLASS], data: edgeData,
    markerEnd: markerEnd
  }

  console.log("New edge: ", newEdge)

  setEdges((previousEdges: Edge[]) =>
  {
    return [...previousEdges, newEdge]
  })

  return true
}


export const createNode = (nodeName: string, positionX: number, positionY: number): Node =>
{
  const nodeIRI = createIRIFromName(nodeName)

  const newEntity: Class = {
    [Field.IRI]: nodeIRI, [Field.NAME]: nodeName, [Field.TYPE]: ItemType.CLASS, [Field.DESCRIPTION]: "",
    [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: [],
  }

  const nodeData: NodeData = { class: newEntity, attributes: [] }

  const newNode: Node = { id: nodeIRI, type: "customNode", position: { x: positionX, y: positionY }, data: nodeData }

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
  // Replace one or more whitespace characters with only one whitespace
  // global ('g') flag is used so the regex does not stop after the first match
  name = name.replace(/\s+/g, ' ')

  const iri = name.split(' ').join('-').toLowerCase() // Replace every whitespace character with '-'
  return iri
}


export const createNameFromIRI = (iri: string): string =>
{
  const name = iri.split('-').join(' ').toLowerCase()
  return name
}


export const convertConceptualModelToJSON = (nodes: Node[], edges: Edge[], isOnlyNames : boolean) =>
{
  let result: { [key: string]: any } = {
    classes: []
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

    result.classes.push({[Field.NAME]: node.id, attributes: attributes})
  }


  let associations = []
  for (let edge of edges)
  {
    if (isOnlyNames)
    {
      associations.push({[Field.NAME]: edge.data.relationship.name, "sourceEntity": edge.source, "targetEntity": edge.target})
    }
    else
    {
      associations.push({[Field.NAME]: edge.data.relationship.name, [Field.ORIGINAL_TEXT]: edge.data.originalText, "sourceEntity": edge.source, "targetEntity": edge.target})
    }
  }

  result.associations = associations

  return result
}


export const changeTitle = (userChoice: UserChoice, sourceItemName: string, targetItemName: string, setTitle: any): void =>
{

  if (userChoice === UserChoice.CLASSES)
  {
    const message = ""
    setTitle((title: ItemsMessage) => { return { ...title, entities: message} })
  }
  else if (userChoice === UserChoice.ATTRIBUTES)
  {
    const message = `Selected class: ${sourceItemName}`
    setTitle((title: ItemsMessage) => { return { ...title, attributes: message} })
  }
  else if (userChoice === UserChoice.ASSOCIATIONS)
  {
    const message = `Selected class: ${sourceItemName}`
    setTitle((title: ItemsMessage) => { return { ...title, associations: message} })
  }
  else if (userChoice === UserChoice.ASSOCIATIONS2)
  {
    const message = `Source class: ${sourceItemName}\nTarget class: ${targetItemName}`
    setTitle((title: ItemsMessage) => { return { ...title, associations: message} })
  }
}


export const onClearSuggestedItems = (itemType: ItemType, setSuggestedEntities: any, setSuggestedAttributes: any, setSuggestedRelationships: any): void =>
{
  if (itemType === ItemType.CLASS)
  {
    setSuggestedEntities([])
  }
  else if (itemType === ItemType.ATTRIBUTE)
  {
    setSuggestedAttributes([])
  }
  else if (itemType === ItemType.ASSOCIATION)
  {
    setSuggestedRelationships([])
  }
}


export const changeSidebarTab = (itemType: ItemType, setSidebarTab: any) =>
{
  if (itemType === ItemType.CLASS)
  {
    setSidebarTab(SidebarTabs.CLASSES)
  }
  else if (itemType === ItemType.ATTRIBUTE)
  {
    setSidebarTab(SidebarTabs.ATTRIBUTES)
  }
  else if (itemType === ItemType.ASSOCIATION || itemType === ItemType.GENERALIZATION)
  {
    setSidebarTab(SidebarTabs.ASSOCIATIONS)
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
  if (itemType === ItemType.CLASS)
  {
    return UserChoice.CLASSES
  }
  else if (itemType === ItemType.ATTRIBUTE)
  {
    return UserChoice.ATTRIBUTES
  }
  else if (itemType === ItemType.ASSOCIATION || itemType === ItemType.GENERALIZATION)
  {
    return UserChoice.ASSOCIATIONS
  }

  throw Error(`Received unknown item type: ${itemType}`)
}


export const CUSTOM_EDGE_MARKER: EdgeMarker = { type: MarkerType.Arrow, width: 50, height: 50, strokeWidth: 1 }
export const CUSTOM_ISA_EDGE_MARKER: EdgeMarker = { type: MarkerType.ArrowClosed, width: 40, height: 40, strokeWidth: 0.8 }


export const SUMMARY_DESCRIPTIONS_NAME = "Summary: descriptions"
export const SUMMARY_PLAIN_TEXT_NAME = "Summary: plain text"

const BASE_URL = "http://127.0.0.1:5000/" // https://llm-backend.opendata.cz/
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
export const blankEntity: Class = {
  [Field.IRI]: "", [Field.TYPE]: ItemType.CLASS, [Field.NAME]: "", [Field.DESCRIPTION]: "", [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: []
}

export const blankAttribute: Attribute = {
  [Field.IRI]: "", [Field.NAME]: "", [Field.DESCRIPTION]: "", [Field.DATA_TYPE]: "", [Field.ORIGINAL_TEXT]: "",
  [Field.ORIGINAL_TEXT_INDEXES]: [], [Field.TYPE]: ItemType.ATTRIBUTE, [Field.SOURCE_CARDINALITY]: "",
  [Field.SOURCE_CLASS]: ""
}

// export const blankRelationship: Relationship = {
//   [Field.IRI]: "", [Field.TYPE]: ItemType.ENTITY, [Field.NAME]: "", [Field.DESCRIPTION]: "", [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: []
// }

