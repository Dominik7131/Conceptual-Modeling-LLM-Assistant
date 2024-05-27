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

    for (const [, entity] of Object.entries(conceptualModelJson.classes))
    {
        const entityIriLowerCase = entity.iri.toLowerCase()
        const entityTitle = entity.title

        const newClass: Class = {
            [Field.IRI]: entityIriLowerCase, [Field.NAME]: entityTitle, [Field.DESCRIPTION]: entity.description,
            [Field.TYPE]: ItemType.CLASS, [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: []
        }

        const nodeData : NodeData = { class: newClass, attributes: [] }

        const maxRandomValue = 400
        const randomX = Math.floor(Math.random() * maxRandomValue)
        const randomY = Math.floor(Math.random() * maxRandomValue)
        const newPositionX = positionX + randomX
        const newPositionY = positionY + randomY

        const newNode : Node = {
            id: entityIriLowerCase, type: CUSTOM_NODE_TYPE, position: { x: newPositionX, y: newPositionY }, data: nodeData
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
        const sourceEntityLowerCase = attribute.domain.toLowerCase()
        const attributeName = attribute.title

        const rangeCardinality = attribute.rangeCardinality ?? ""

        const newAttribute: Attribute = {
            [Field.IRI]: attribute[Field.IRI], [Field.NAME]: attributeName, [Field.TYPE]: ItemType.ATTRIBUTE, [Field.DESCRIPTION]: attribute.description,
            [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: [], [Field.SOURCE_CLASS]: sourceEntityLowerCase,
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
        const sourceEntityLowerCase = association.domain.toLowerCase()
        const targetEntityLowerCase = association.range.toLowerCase()

        const domainCardinality = association.domainCardinality ?? ""
        const rangeCardinality = association.rangeCardinality ?? ""
    
        const newRelationship: Association = {
            [Field.IRI]: iriLowerCase, [Field.NAME]: association.title, [Field.DESCRIPTION]: association[Field.DESCRIPTION], [Field.TYPE]: ItemType.ASSOCIATION,
            [Field.SOURCE_CLASS]: sourceEntityLowerCase, [Field.TARGET_CLASS]: targetEntityLowerCase,
            [Field.SOURCE_CARDINALITY]: domainCardinality, [Field.TARGET_CARDINALITY]: rangeCardinality,
            [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: []
        }
    
        const edgeData: EdgeData = { association: newRelationship }
    
        const newID: string = createEdgeUniqueID(sourceEntityLowerCase, targetEntityLowerCase, iriLowerCase)
        const newEdge : Edge = {
            id: newID, source: sourceEntityLowerCase, target: targetEntityLowerCase, type: CUSTOM_EDGE_TYPE,
            data: edgeData, markerEnd: CUSTOM_EDGE_MARKER
        }
    
        newEdges.push(newEdge)
    }

    for (const [, generalization] of Object.entries(conceptualModelJson.generalizations))
    {
        const iriLowerCase = generalization.iri.toLowerCase()
        const sourceEntityLowerCase = generalization.specialClass.toLowerCase()
        const targetEntityLowerCase = generalization.generalClass.toLowerCase()
    
        const newGeneralization: Association = {
            [Field.IRI]: iriLowerCase, [Field.NAME]: generalization.title, [Field.DESCRIPTION]: "", [Field.TYPE]: ItemType.GENERALIZATION,
            [Field.SOURCE_CLASS]: sourceEntityLowerCase, [Field.TARGET_CLASS]: targetEntityLowerCase,
            [Field.SOURCE_CARDINALITY]: "", [Field.TARGET_CARDINALITY]: "", [Field.ORIGINAL_TEXT]: "",
            [Field.ORIGINAL_TEXT_INDEXES]: []
        }
    
        const edgeData: EdgeData = { association: newGeneralization }
    
        const newID: string = createEdgeUniqueID(sourceEntityLowerCase, targetEntityLowerCase, iriLowerCase)
        const newEdge : Edge = {
            id: newID, source: sourceEntityLowerCase, target: targetEntityLowerCase, type: CUSTOM_EDGE_TYPE,
            data: edgeData, markerEnd: CUSTOM_ISA_EDGE_MARKER
        }
    
        newEdges.push(newEdge)
    }

    return newEdges
}