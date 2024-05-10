import { Node, Edge } from "reactflow"
import { Association, Attribute, Class, ConceptualModelJson, EdgeData, Field, ItemType, NodeData } from "../interfaces"
import { CUSTOM_EDGE_MARKER, CUSTOM_ISA_EDGE_MARKER, createEdgeUniqueID, onAddItem } from "./utility"
import { SetterOrUpdater } from "recoil"


export const importConceptualModelFromJson = (conceptualModelJson: ConceptualModelJson, setNodes: SetterOrUpdater<Node[]>, setEdges: SetterOrUpdater<Edge[]>) =>
{
    // TODO: Divide into smaller functions
    
    const incrementX = 500
    const incrementY = 200
    let positionX = 100
    let positionY = 100
    let newNodes : Node[] = []
    let newEdges : Edge[] = []

    if (!conceptualModelJson.attributes) { conceptualModelJson.attributes = [] }
    if (!conceptualModelJson.associations) { conceptualModelJson.associations = [] }
    if (!conceptualModelJson.generalizations) { conceptualModelJson.generalizations = [] }


    for (const [, entity] of Object.entries(conceptualModelJson.classes))
    {
        const entityIriLowerCase = entity.iri.toLowerCase()
        const entityTitle = entity.title
    
        const newEntity: Class = {
            [Field.IRI]: entityIriLowerCase, [Field.NAME]: entityTitle, [Field.DESCRIPTION]: entity.description,
            [Field.TYPE]: ItemType.CLASS, [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: []
        }
    
        const nodeData : NodeData = { class: newEntity, attributes: [] }
    
        const maxRandomValue = 400
        const randomX = Math.floor(Math.random() * maxRandomValue)
        const randomY = Math.floor(Math.random() * maxRandomValue)
        const newPositionX = positionX + randomX
        const newPositionY = positionY + randomY

        const newNode : Node = {
            id: entityIriLowerCase, type: "customNode", position: { x: newPositionX, y: newPositionY }, data: nodeData
        }
    
        positionX += incrementX
    
        if (positionX >= 1300)
        {
            positionX = 100
            positionY += incrementY
        }
    
        newNodes.push(newNode)
    }

    setNodes(() => { return newNodes })


    for (const [, attribute] of Object.entries(conceptualModelJson.attributes))
    {
        const sourceEntityLowerCase = attribute.domain.toLowerCase()
        const attributeName = attribute.title

        const domainCardinality = attribute.domainCardinality ?? ""
    
        const newAttribute: Attribute = {
            [Field.IRI]: attribute[Field.IRI], [Field.NAME]: attributeName, [Field.TYPE]: ItemType.ATTRIBUTE, [Field.DESCRIPTION]: attribute.description,
            [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: [], [Field.SOURCE_CLASS]: sourceEntityLowerCase,
            [Field.DATA_TYPE]: "", [Field.SOURCE_CARDINALITY]: domainCardinality
        }
    
    
        for (let i = 0; i < newNodes.length; i++)
        {
            const entityName = newNodes[i].id
    
            if (entityName === newAttribute[Field.SOURCE_CLASS])
            {
                onAddItem(newAttribute, setNodes, setEdges)
            }
        }
    }

    for (const [, relationship] of Object.entries(conceptualModelJson.associations))
    {
        const iriLowerCase = relationship.iri.toLowerCase()
        const sourceEntityLowerCase = relationship.domain.toLowerCase()
        const targetEntityLowerCase = relationship.range.toLowerCase()

        const domainCardinality = relationship.domainCardinality ?? ""
        const rangeCardinality = relationship.rangeCardinality ?? ""
    
        const newRelationship: Association = {
            [Field.IRI]: iriLowerCase, [Field.NAME]: relationship.title, [Field.DESCRIPTION]: relationship.description, [Field.TYPE]: ItemType.ASSOCIATION,
            [Field.SOURCE_CLASS]: sourceEntityLowerCase, [Field.TARGET_CLASS]: targetEntityLowerCase,
            [Field.SOURCE_CARDINALITY]: domainCardinality, [Field.TARGET_CARDINALITY]: rangeCardinality,
            [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: []
        }
    
        const edgeData: EdgeData = { association: newRelationship }
    
        const newID: string = createEdgeUniqueID(sourceEntityLowerCase, targetEntityLowerCase, relationship.title)
        const newEdge : Edge = {
            id: newID, source: sourceEntityLowerCase, target: targetEntityLowerCase, type: "custom-edge",
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
    
        const newID: string = createEdgeUniqueID(sourceEntityLowerCase, targetEntityLowerCase, generalization.title)
        const newEdge : Edge = {
            id: newID, source: sourceEntityLowerCase, target: targetEntityLowerCase, type: "custom-edge",
            data: edgeData, markerEnd: CUSTOM_ISA_EDGE_MARKER
        }
    
        newEdges.push(newEdge)
    }

    setEdges(() => { return newEdges })
}