import { Node, Edge, MarkerType, EdgeMarker } from 'reactflow';
import { Association, Attribute, Class, EdgeData, Field, Item, ItemType, NodeData } from '../interfaces';


export const CUSTOM_EDGE_TYPE = "custom-edge"
export const CUSTOM_EDGE_MARKER: EdgeMarker = { type: MarkerType.Arrow, width: 50, height: 50, strokeWidth: 1 }
export const CUSTOM_ISA_EDGE_MARKER: EdgeMarker = { type: MarkerType.ArrowClosed, width: 40, height: 40, strokeWidth: 0.8 }


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


export const createEdgeUniqueID = (source: string, target: string, name: string): string =>
{
    return `${source}-${name}-${target}`
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