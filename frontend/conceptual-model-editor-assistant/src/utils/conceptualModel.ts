import { Node, Edge, internalsSymbol } from "reactflow";
import { SetterOrUpdater } from "recoil";
import { Class, Attribute, EdgeData, Item, Association, NodeData, ItemsMessage, BLANK_CLASS, CUSTOM_EDGE_MARKER, CUSTOM_ISA_EDGE_MARKER, CUSTOM_NODE_TYPE, CUSTOM_EDGE_TYPE } from "../definitions/conceptualModel";
import { Field, ItemType, UserChoiceItem } from "../definitions/utility";


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


export const createEdgeUniqueID = (source: string, target: string, iri: string): string =>
{
    return `${source}-${iri}-${target}`
}


export const doesNodeAlreadyExist = (nodes: Node[], nodeID: string): boolean =>
{
    return nodes.some(node => node.id === nodeID)
}


export const doesNodeAlreadyExistSetter = (setNodes: SetterOrUpdater<Node[]>, nodeID: string): boolean =>
{
    // It would be more readable to use the following code:
    // `return nodes.some(node => node.id === nodeID)`

    // However, using nodes in any component triggers re-rendering of this component any time some node is moved
    // Reason: each node has position variable that whenever is changed all components working with nodes are re-rendered
    // to work with the newest version of the nodes
    // This can cause performance issues in the debug mode

    // We tried to solve this issue here: https://github.com/Dominik7131/react-flow-render
    // by deriving node data without the position from the nodes
    // However, this leads to a more complicated code

    // So we used the following trick: instead of working with nodes we work with their corresponding setter
    // This does not trigger the re-renderings and we have not encountered any problems with nodes synchronization
    // as we do not care about the newest nodes position

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
    return edges.some(edge => edge.id === edgeID)
}


export const doesEdgeAlreadyExistSetter = (setEdges: SetterOrUpdater<Edge[]>, edgeID: string): boolean =>
{
    // Same trick as in `doesNodeAlreadyExistSetter`

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


export const doesSameEdgeBetweenNodesAlreadyExistSetter = (setEdges: SetterOrUpdater<Edge[]>, newEdgeIRI: string, associationType: string, sourceNodeID: string, targetNodeID: string): boolean =>
{
    // Same trick as in `doesNodeAlreadyExistSetter`

    let isEdgeAlreadyPresent = false

    setEdges((edges: Edge[]) => edges.map(currentEdge => 
    {
        const isEdgeBetweenTheSameNodes = currentEdge.source === sourceNodeID && currentEdge.target === targetNodeID
        const isSameType = associationType === currentEdge.data.association[Field.TYPE]
        const edgeData: EdgeData = currentEdge.data

        if (isEdgeBetweenTheSameNodes && isSameType && edgeData.association[Field.IRI] === newEdgeIRI)
        {
            isEdgeAlreadyPresent = true
        }

        return currentEdge
    }))

    return isEdgeAlreadyPresent
}


export const onAddItem = (item: Item, setNodes: SetterOrUpdater<Node[]>, setEdges: SetterOrUpdater<Edge[]>): boolean =>
{
    if (item[Field.TYPE] === ItemType.CLASS)
    {
        const maxRandomValue = 400
        const randomX = Math.floor(Math.random() * maxRandomValue)
        const randomY = Math.floor(Math.random() * maxRandomValue)
        return onAddClass(item as Class, randomX, randomY, setNodes)
    }
    else if (item[Field.TYPE] === ItemType.ATTRIBUTE)
    {
        return onAddAttribute(item as Attribute, setNodes)
    }
    else if (item[Field.TYPE] === ItemType.ASSOCIATION || item[Field.TYPE] === ItemType.GENERALIZATION)
    {
        return onAddAssociation(item as Association, setNodes, setEdges)
    }
    else
    {
        throw Error("Unknown item type")
    }
}


export const onAddClass = (clss: Class, positionX: number, positionY: number, setNodes: SetterOrUpdater<Node[]>): boolean =>
{
    if (doesNodeAlreadyExistSetter(setNodes, clss[Field.IRI]))
    {
        return false
    }

    const iri = createIRIFromName(clss[Field.NAME])
    clss = { ...clss, [Field.IRI]: iri}

    const nodeData: NodeData = { class: clss, attributes: [] }

    const newNode: Node = {
        id: clss[Field.IRI], type: CUSTOM_NODE_TYPE, position: { x: positionX, y: positionY },
        data: nodeData
    }

    setNodes((previousNodes: Node[]) => {
        return [...previousNodes, newNode]
    })

    return true
}


const onAddAttribute = (attribute : Attribute, setNodes: SetterOrUpdater<Node[]>) =>
{
    const nodeID = attribute[Field.SOURCE_CLASS]
    let isAttributePresent = false
    let isAttributeAdded = false

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
            if (currentAttribute[Field.IRI] === attribute[Field.IRI])
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
        isAttributeAdded = true

        return updatedNode
    }))


    const doesSourceClassExist = isAttributePresent || isAttributeAdded
    if (!doesSourceClassExist)
    {
        const name = createNameFromIRI(nodeID)
        const newClass: Class = { ...BLANK_CLASS, [Field.IRI]: nodeID, [Field.NAME]: name }
        onAddClass(newClass, 100, 100, setNodes)
    }

    return !isAttributePresent
}


const onAddAssociation = (association : Association, setNodes: SetterOrUpdater<Node[]>, setEdges: SetterOrUpdater<Edge[]>): boolean =>
{
    // Returns "true" if the operation was successfull otherwise "false"

    if (doesSameEdgeBetweenNodesAlreadyExistSetter(setEdges, association[Field.IRI], association[Field.TYPE], association[Field.SOURCE_CLASS], association[Field.TARGET_CLASS]))
    {
        return false
    }

    const newEdgeID = createEdgeUniqueID(association[Field.SOURCE_CLASS], association[Field.TARGET_CLASS], association[Field.IRI])
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
        id: newEdgeID, type: CUSTOM_EDGE_TYPE, source: association[Field.SOURCE_CLASS], target: association[Field.TARGET_CLASS], data: edgeData,
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

    const newClass: Class = {
        [Field.IRI]: nodeIRI, [Field.NAME]: nodeName, [Field.TYPE]: ItemType.CLASS, [Field.DESCRIPTION]: "",
        [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: [],
    }

    const nodeData: NodeData = { class: newClass, attributes: [] }

    const newNode: Node = { id: nodeIRI, type: CUSTOM_NODE_TYPE, position: { x: positionX, y: positionY }, data: nodeData }

    return newNode
}


export const addNode = (nodeName: string, positionX: number, positionY: number, setNodes: SetterOrUpdater<Node[]>): void =>
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


export const editNodeClass = (newClass: Class, oldClass: Class, setNodes: SetterOrUpdater<Node[]>, setEdges: SetterOrUpdater<Edge[]>): void =>
{
    if (newClass.name !== oldClass.name)
    {
        // Update iri
        const newIRI = createIRIFromName(newClass[Field.NAME])
        newClass = {...newClass, [Field.IRI]: newIRI}

        // Update all edges that connect to the changed source or target class
        setEdges((edges) => edges.map((currentEdge: Edge) =>
        {
            if (currentEdge.source === oldClass.iri)
            {
                const newAssociation: Association = { ...currentEdge.data.association, source: newClass[Field.IRI] }
                const newEdgeData: EdgeData = { ...currentEdge.data, association: newAssociation }
                const edgeID = createEdgeUniqueID(newClass[Field.IRI], currentEdge.target, currentEdge.data.association[Field.IRI])
                const updatedEdge: Edge = {
                    ...currentEdge, id: edgeID, source: newClass[Field.IRI], data: newEdgeData
                }

                return updatedEdge
            }
            else if (currentEdge.target === oldClass.iri)
            {
                const newAssociation: Association = { ...currentEdge.data.association, target: newClass[Field.IRI] }
                const newEdgeData: EdgeData = { ...currentEdge.data, association: newAssociation }
                const edgeID = createEdgeUniqueID(currentEdge.source, newClass[Field.IRI], currentEdge.data.association[Field.IRI])
                const updatedEdge: Edge = {
                    ...currentEdge, id:edgeID, target: newClass[Field.IRI], data: newEdgeData
                }

                console.log(updatedEdge)

                return updatedEdge
            }
            return currentEdge
        }))
    }

    setNodes((nodes: Node[]) => nodes.map((currentNode : Node) =>
    {
        if (currentNode.id === oldClass.iri)
        {
            let newAttributes = currentNode.data.attributes

            // For each attribute update their source class if the iri of the class changed
            if (oldClass.iri !== newClass.iri)
            {                   
                newAttributes = currentNode.data.attributes.map((attribute: Attribute) =>
                {
                    return { ...attribute, [Field.SOURCE_CLASS]: newClass[Field.IRI] }
                })
            }


            const newData: NodeData = { ...currentNode.data, class: newClass, attributes: newAttributes }
            const newNode: Node = {...currentNode, id: newClass[Field.IRI], data: newData}

            return newNode
        }
        else
        {
            return currentNode
        }
    }))
}

    
export const editNodeAttribute = (newAttribute: Attribute, oldAttribute: Attribute, setNodes: SetterOrUpdater<Node[]>): void =>
{
    const id: string = oldAttribute.source

    setNodes((nodes: Node[]) => nodes.map((currentNode: Node) =>
    {
        if (currentNode.id === id)
        {
            const newAttributes = currentNode.data.attributes.map((attribute: Attribute) =>
            {
                if (attribute.name === oldAttribute.name)
                {
                    return newAttribute
                }
                else
                {
                    return attribute
                }
            })

            const newData: NodeData = { ...currentNode.data, attributes: newAttributes}
            const newNode: Node = { ...currentNode, data: newData}
            return newNode
        }
        else
        {
            return currentNode
        }
    }))
}


export const editEdgeAssociation = (newAssociation: Association, oldAssociation : Association, setEdges: SetterOrUpdater<Edge[]>): void =>
{
    // Find the edge to update based on the old ID
    const oldID: string = createEdgeUniqueID(oldAssociation[Field.SOURCE_CLASS], oldAssociation[Field.TARGET_CLASS], oldAssociation[Field.IRI])

    setEdges((edges) => edges.map((currentEdge : Edge) =>
    {
        if (currentEdge.id === oldID)
        {
            const newData: EdgeData = { ...currentEdge.data, association: newAssociation }
            const newID = createEdgeUniqueID(newAssociation[Field.SOURCE_CLASS], newAssociation[Field.TARGET_CLASS], newAssociation[Field.IRI])

            let newEdge: Edge = {
                ...currentEdge, id: newID, source: newAssociation[Field.SOURCE_CLASS], target: newAssociation[Field.TARGET_CLASS], data: newData
            }

            console.log("Edited edge: ", newEdge)

            return newEdge
        }
        else
        {
            return currentEdge
        }
    }))
}



export const onRemove = (item: Item, setNodes: SetterOrUpdater<Node[]>, setEdges: SetterOrUpdater<Edge[]>): void =>
{
    if (item[Field.TYPE] === ItemType.CLASS)
    {
        const nodeID = item[Field.IRI]
        removeNode(nodeID, setNodes)
    }
    else if (item[Field.TYPE] === ItemType.ATTRIBUTE)
    {
        removeNodeAttribute(item as Attribute, setNodes)
    }
    else if (item[Field.TYPE] === ItemType.ASSOCIATION || item[Field.TYPE] === ItemType.GENERALIZATION)
    {
        const association: Association = (item as Association)
        const edgeID = createEdgeUniqueID(association[Field.SOURCE_CLASS], association[Field.TARGET_CLASS], association[Field.NAME])
        removeEdge(edgeID, setEdges)
    }
    else
    {
        alert("Unknown action")
    }
}


export const removeNode = (nodeID: string, setNodes: SetterOrUpdater<Node[]>): void =>
{
    setNodes((previousNodes) => previousNodes.filter(node => node.id !== nodeID))
}


export const removeEdge = (edgeID: string, setEdges: SetterOrUpdater<Edge[]>): void =>
{
    setEdges((edges: Edge[]) => edges.filter(edge => edge.id !== edgeID))
}


export const removeNodeAttribute = (attribute: Attribute, setNodes: SetterOrUpdater<Node[]>): void =>
{
    const nodeID: string = attribute.source

    setNodes((nodes) => nodes.map((currentNode : Node) =>
    {
        if (currentNode.id === nodeID)
        {
            const newAttributes = currentNode.data.attributes.filter((element: Attribute) => element.name !== attribute.name)
            const newData: NodeData = { ...currentNode.data, attributes: newAttributes }
            const newNode = { ...currentNode, data: newData }
            return newNode
        }
        else
        {
            return currentNode
        }
    }))
}


export const createNewAttribute = (sourceClassIRI: string): Attribute =>
{
    const newAttribute: Attribute = {
        [Field.IRI]: "", [Field.NAME]: "", [Field.DESCRIPTION]: "", [Field.DATA_TYPE]: "", [Field.ORIGINAL_TEXT]: "",
        [Field.ORIGINAL_TEXT_INDEXES]: [], [Field.TYPE]: ItemType.ATTRIBUTE, [Field.SOURCE_CARDINALITY]: "",
        [Field.SOURCE_CLASS]: sourceClassIRI
    }

    return newAttribute
}


export const createNewAssociation = (sourceClassIRI: string, targetClassIRI: string): Association =>
{
    const newAssociation: Association = {
        [Field.IRI]: "", [Field.NAME]: "", [Field.DESCRIPTION]: "", [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: [],
        [Field.TYPE]: ItemType.ASSOCIATION, [Field.SOURCE_CARDINALITY]: "", [Field.TARGET_CARDINALITY]: "", [Field.SOURCE_CLASS]: sourceClassIRI,
        [Field.TARGET_CLASS]: targetClassIRI
    }

    return newAssociation
}


export function getLoopPath(sourceNode: Node, targetNode: Node, isGeneralization: boolean)
{
    const sourceHandleID = isGeneralization ? "source-bottom" : "source-top"
    const targetHandleID = "target-right"

    const handleSource = sourceNode[internalsSymbol]?.handleBounds?.source?.find((h) => h.id === sourceHandleID)
    const handleTarget = sourceNode[internalsSymbol]?.handleBounds?.target?.find((h) => h.id === targetHandleID)

    const offsetX = -60
    const offsetY = isGeneralization ? 85 : -55

    const newX = sourceNode.position.x + sourceNode.width! + offsetX
    const newY = sourceNode.position.y + offsetY

    const position = { x: newX, y: newY }

    const path = `M ${sourceNode.position.x + handleSource!.x + 5},${sourceNode.position.y + handleSource!.y + 5} A 1 1 90 0 ${isGeneralization ? 0 : 1} ${
        targetNode.position.x + handleTarget!.x
    } ${targetNode.position.y + handleTarget!.y}`

    return [path, position.x, position.y] as const
}


export const createErrorMessage = (item: Item, setErrorMessage: SetterOrUpdater<string>): void =>
{
    let message = ""

    if (item[Field.TYPE] === ItemType.CLASS)
    {
        message = `Class "${item[Field.NAME]}" already exists`
    }
    else if (item[Field.TYPE] === ItemType.ATTRIBUTE)
    {
        const attribute: Attribute = item as Attribute
        const sourceClassName = createNameFromIRI(attribute[Field.SOURCE_CLASS])

        message = `Class "${sourceClassName}" already contains attribute: "${item[Field.NAME]}"`
    }
    else if (item[Field.TYPE] === ItemType.ASSOCIATION || item[Field.TYPE] === ItemType.GENERALIZATION)
    {
        const association: Association = item as Association
        const sourceClassName = createNameFromIRI(association[Field.SOURCE_CLASS])
        const targetClassName = createNameFromIRI(association[Field.TARGET_CLASS])

        message = `Association "${item[Field.NAME]}" in between source class "${sourceClassName}" and target class "${targetClassName}" already exists`
    }
    else
    {
        throw Error("Received unexpected item type: ", item[Field.TYPE])
    }

    setErrorMessage(message)
}
    
    
export const changeTitle = (userChoice: UserChoiceItem, sourceItemName: string, targetItemName: string, setTitle: SetterOrUpdater<ItemsMessage>): void =>
{
    if (userChoice === UserChoiceItem.CLASSES)
    {
        const message = "All suggested classes: "
        setTitle((title: ItemsMessage) => { return { ...title, classes: message} })
    }
    else if (userChoice === UserChoiceItem.ATTRIBUTES)
    {
        const message = `Selected class: ${sourceItemName}`
        setTitle((title: ItemsMessage) => { return { ...title, attributes: message} })
    }
    else if (userChoice === UserChoiceItem.ASSOCIATIONS_ONE_KNOWN_CLASS)
    {
        const message = `Selected class: ${sourceItemName}`
        setTitle((title: ItemsMessage) => { return { ...title, associations: message} })
    }
    else if (userChoice === UserChoiceItem.ASSOCIATIONS_TWO_KNOWN_CLASSES)
    {
        const message = `Source class: ${sourceItemName}\nTarget class: ${targetItemName}`
        setTitle((title: ItemsMessage) => { return { ...title, associations: message} })
    }
}
    
    
export const onClearSuggestedItems = (itemType: ItemType, setSuggestedClasses: SetterOrUpdater<Class[]>, setSuggestedAttributes: SetterOrUpdater<Attribute[]>, setSuggestedAssociations: SetterOrUpdater<Association[]>): void =>
{
    if (itemType === ItemType.CLASS)
    {
        setSuggestedClasses([])
    }
    else if (itemType === ItemType.ATTRIBUTE)
    {
        setSuggestedAttributes([])
    }
    else if (itemType === ItemType.ASSOCIATION)
    {
        setSuggestedAssociations([])
    }
}