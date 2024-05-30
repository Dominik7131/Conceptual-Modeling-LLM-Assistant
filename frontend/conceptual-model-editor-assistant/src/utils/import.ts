import { Node, Edge } from "reactflow"
import { SetterOrUpdater } from "recoil"
import { Class, NodeData, Attribute, Association, EdgeData, CUSTOM_NODE_TYPE, CUSTOM_EDGE_MARKER, CUSTOM_EDGE_TYPE, CUSTOM_ISA_EDGE_MARKER } from "../definitions/conceptualModel"
import { ConceptualModelJson } from "../definitions/conceptualModelJSON"
import { Field, ItemType } from "../definitions/utility"
import { onAddItem, createEdgeUniqueID } from "./conceptualModel"


export const importConceptualModelFromJSON = (conceptualModelJson: ConceptualModelJson, setNodes: SetterOrUpdater<Node[]>, setEdges: SetterOrUpdater<Edge[]>) =>
{
    if (!conceptualModelJson.attributes) { conceptualModelJson.attributes = [] }
    if (!conceptualModelJson.relationships) { conceptualModelJson.relationships = [] }
    if (!conceptualModelJson.generalizations) { conceptualModelJson.generalizations = [] }


    const newNodes: Node[] = importClassesFromJSON(conceptualModelJson)
    setNodes(newNodes)

    importAttributesFromJSON(conceptualModelJson, newNodes, setNodes, setEdges)

    const newEdges: Edge[] = importAssociationsFromJSON(conceptualModelJson)
    setEdges(newEdges)
}


const importClassesFromJSON = (conceptualModelJson: ConceptualModelJson): Node[] =>
{
    const incrementX = 500
    const incrementY = 200
    let positionX = 100
    let positionY = 100

    let newNodes : Node[] = []

    for (const [, clss] of Object.entries(conceptualModelJson.classes))
    {
        const classIriLowerCase = clss.iri.toLowerCase()
        const classTitle = clss.title

        const newClass: Class = {
            [Field.IRI]: classIriLowerCase, [Field.NAME]: classTitle, [Field.DESCRIPTION]: clss.description,
            [Field.TYPE]: ItemType.CLASS, [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: []
        }

        const nodeData : NodeData = { class: newClass, attributes: [] }

        const maxRandomValue = 400
        const randomX = Math.floor(Math.random() * maxRandomValue)
        const randomY = Math.floor(Math.random() * maxRandomValue)
        const newPositionX = positionX + randomX
        const newPositionY = positionY + randomY

        const newNode : Node = {
            id: classIriLowerCase, type: CUSTOM_NODE_TYPE, position: { x: newPositionX, y: newPositionY }, data: nodeData
        }

        positionX += incrementX

        if (positionX >= 1300)
        {
            positionX = 100
            positionY += incrementY
        }

        newNodes.push(newNode)
    }

    return newNodes
}


const importAttributesFromJSON = (conceptualModelJson: ConceptualModelJson, newNodes: Node[], setNodes: SetterOrUpdater<Node[]>, setEdges: SetterOrUpdater<Edge[]>) =>
{
    for (const [, attribute] of Object.entries(conceptualModelJson.attributes))
    {
        const sourceClassLowerCase = attribute.domain.toLowerCase()
        const attributeName = attribute.title

        const rangeCardinality = attribute.rangeCardinality ?? ""

        const newAttribute: Attribute = {
            [Field.IRI]: attribute[Field.IRI], [Field.NAME]: attributeName, [Field.TYPE]: ItemType.ATTRIBUTE, [Field.DESCRIPTION]: attribute.description,
            [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: [], [Field.SOURCE_CLASS]: sourceClassLowerCase,
            [Field.DATA_TYPE]: "",
            [Field.SOURCE_CARDINALITY]: rangeCardinality // Set to rangeCardinality because domainCardinality right now should be always "many"
        }

        for (let i = 0; i < newNodes.length; i++)
        {
            const className = newNodes[i].id
    
            if (className === newAttribute[Field.SOURCE_CLASS])
            {
                onAddItem(newAttribute, setNodes, setEdges)
            }
        }
    }
}


const importAssociationsFromJSON = (conceptualModelJson: ConceptualModelJson): Edge[] =>
{
    let newEdges : Edge[] = []

    for (const [, association] of Object.entries(conceptualModelJson.relationships))
    {
        const iriLowerCase = association[Field.IRI]
        const sourceClassLowerCase = association.domain.toLowerCase()
        const targetClassLowerCase = association.range.toLowerCase()

        const domainCardinality = association.domainCardinality ?? ""
        const rangeCardinality = association.rangeCardinality ?? ""
    
        const newAssociation: Association = {
            [Field.IRI]: iriLowerCase, [Field.NAME]: association.title, [Field.DESCRIPTION]: association[Field.DESCRIPTION], [Field.TYPE]: ItemType.ASSOCIATION,
            [Field.SOURCE_CLASS]: sourceClassLowerCase, [Field.TARGET_CLASS]: targetClassLowerCase,
            [Field.SOURCE_CARDINALITY]: domainCardinality, [Field.TARGET_CARDINALITY]: rangeCardinality,
            [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: []
        }
    
        const edgeData: EdgeData = { association: newAssociation }
    
        const newID: string = createEdgeUniqueID(sourceClassLowerCase, targetClassLowerCase, iriLowerCase)
        const newEdge : Edge = {
            id: newID, source: sourceClassLowerCase, target: targetClassLowerCase, type: CUSTOM_EDGE_TYPE,
            data: edgeData, markerEnd: CUSTOM_EDGE_MARKER
        }
    
        newEdges.push(newEdge)
    }

    for (const [, generalization] of Object.entries(conceptualModelJson.generalizations))
    {
        const iriLowerCase = generalization.iri.toLowerCase()
        const sourceClassLowerCase = generalization.specialClass.toLowerCase()
        const targetClassLowerCase = generalization.generalClass.toLowerCase()
    
        const newGeneralization: Association = {
            [Field.IRI]: iriLowerCase, [Field.NAME]: generalization.title, [Field.DESCRIPTION]: "", [Field.TYPE]: ItemType.GENERALIZATION,
            [Field.SOURCE_CLASS]: sourceClassLowerCase, [Field.TARGET_CLASS]: targetClassLowerCase,
            [Field.SOURCE_CARDINALITY]: "", [Field.TARGET_CARDINALITY]: "", [Field.ORIGINAL_TEXT]: "",
            [Field.ORIGINAL_TEXT_INDEXES]: []
        }
    
        const edgeData: EdgeData = { association: newGeneralization }
    
        const newID: string = createEdgeUniqueID(sourceClassLowerCase, targetClassLowerCase, iriLowerCase)
        const newEdge : Edge = {
            id: newID, source: sourceClassLowerCase, target: targetClassLowerCase, type: CUSTOM_EDGE_TYPE,
            data: edgeData, markerEnd: CUSTOM_ISA_EDGE_MARKER
        }
    
        newEdges.push(newEdge)
    }

    return newEdges
}