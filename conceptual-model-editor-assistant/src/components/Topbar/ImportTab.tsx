import { Stack } from "@mui/material"
import ImportIRIButton from "./ImportIRIButton"
import ImportJSONButton from "./ImportJSONButton"
import ExportButton from "./ExportButton"
import { Attribute, ConceptualModelJson, Entity, Field, ItemType, NodeData, EdgeData, Relationship } from "../../interfaces";
import { edgesState, importedFileNameState, nodesState } from "../../atoms";
import { Node, Edge } from 'reactflow';
import { CUSTOM_EDGE_MARKER, CUSTOM_ISA_EDGE_MARKER, createEdgeID, onAddItem } from "../../hooks/useUtility";
import { useSetRecoilState } from "recoil";
import useConceptualModel from "../../hooks/useConceptualModel";


const ImportTab: React.FC = (): JSX.Element =>
{
    const setNodes = useSetRecoilState(nodesState)
    const setEdges = useSetRecoilState(edgesState)


    const onImport = (conceptualModelJson: ConceptualModelJson) =>
    {
        const incrementX = 500
        const incrementY = 200
        let positionX = 100
        let positionY = 100
        let newNodes : Node[] = []
        let newEdges : Edge[] = []
    
        if (!conceptualModelJson.attributes) { conceptualModelJson.attributes = [] }
        if (!conceptualModelJson.relationships) { conceptualModelJson.relationships = [] }
        if (!conceptualModelJson.generalizations) { conceptualModelJson.generalizations = [] }
    
    
        for (const [, entity] of Object.entries(conceptualModelJson.classes))
        {
            const entityNameLowerCase = entity.title.toLowerCase()
        
            const newEntity: Entity = {
                [Field.TYPE]: ItemType.ENTITY, [Field.ID]: 0, [Field.NAME]: entityNameLowerCase, [Field.DESCRIPTION]: entity.description,
                [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: []
            }
        
            const nodeData : NodeData = { entity: newEntity, attributes: [] }
        
            const maxRandomValue = 400
            const randomX = Math.floor(Math.random() * maxRandomValue)
            const randomY = Math.floor(Math.random() * maxRandomValue)
            const newPositionX = positionX + randomX
            const newPositionY = positionY + randomY

            const newNode : Node = {
                id: entityNameLowerCase, type: "customNode", position: { x: newPositionX, y: newPositionY }, data: nodeData
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
            const attributeNameLowerCase = attribute.title.toLowerCase()
        
            const newAttribute: Attribute = {
                [Field.ID]: 0, [Field.NAME]: attributeNameLowerCase, [Field.TYPE]: ItemType.ATTRIBUTE, [Field.DESCRIPTION]: attribute.description,
                [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: [], [Field.SOURCE_ENTITY]: sourceEntityLowerCase,
                [Field.DATA_TYPE]: "", [Field.SOURCE_CARDINALITY]: attribute.domainCardinality
            }
        
        
            for (let i = 0; i < newNodes.length; i++)
            {
                const entityName = newNodes[i].id
        
                if (entityName === newAttribute[Field.SOURCE_ENTITY])
                {
                    onAddItem(newAttribute, setNodes, setEdges)
                }
            }
        }
    
        for (const [, relationship] of Object.entries(conceptualModelJson.relationships))
        {
            const nameLowerCase = relationship.title.toLowerCase()
            const sourceEntityLowerCase = relationship.domain.toLowerCase()
            const targetEntityLowerCase = relationship.range.toLowerCase()
        
            const newRelationship: Relationship = {
                [Field.ID]: 0, [Field.TYPE]: ItemType.RELATIONSHIP, [Field.NAME]: nameLowerCase, [Field.DESCRIPTION]: relationship.description,
                [Field.SOURCE_ENTITY]: sourceEntityLowerCase, [Field.TARGET_ENTITY]: targetEntityLowerCase,
                [Field.SOURCE_CARDINALITY]: relationship.domainCardinality, [Field.TARGET_CARDINALITY]: relationship.rangeCardinality,
                [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: []
            }
        
            const edgeData: EdgeData = { relationship: newRelationship }
        
            const newID: string = createEdgeID(sourceEntityLowerCase, targetEntityLowerCase, nameLowerCase)
            const newEdge : Edge = {
                id: newID, source: sourceEntityLowerCase, target: targetEntityLowerCase, type: "custom-edge",
                data: edgeData, markerEnd: CUSTOM_EDGE_MARKER
            }
        
            newEdges.push(newEdge)
        }
    
        for (const [, generalization] of Object.entries(conceptualModelJson.generalizations))
        {
            const nameLowerCase = generalization.title.toLowerCase()
            const sourceEntityLowerCase = generalization.specialClass.toLowerCase()
            const targetEntityLowerCase = generalization.generalClass.toLowerCase()
        
            const newGeneralization: Relationship = {
                [Field.ID]: 0, [Field.TYPE]: ItemType.GENERALIZATION, [Field.NAME]: nameLowerCase, [Field.DESCRIPTION]: "",
                [Field.SOURCE_ENTITY]: sourceEntityLowerCase, [Field.TARGET_ENTITY]: targetEntityLowerCase,
                [Field.SOURCE_CARDINALITY]: "", [Field.TARGET_CARDINALITY]: "", [Field.ORIGINAL_TEXT]: "",
                [Field.ORIGINAL_TEXT_INDEXES]: []
            }
        
            const edgeData: EdgeData = { relationship: newGeneralization }
        
            const newID: string = createEdgeID(sourceEntityLowerCase, targetEntityLowerCase, nameLowerCase)
            const newEdge : Edge = {
                id: newID, source: sourceEntityLowerCase, target: targetEntityLowerCase, type: "custom-edge",
                data: edgeData, markerEnd: CUSTOM_ISA_EDGE_MARKER
            }
        
            newEdges.push(newEdge)
        }
    
        setEdges(() => { return newEdges })
    }


    return (
        <Stack direction="row" spacing={2} sx={{ display: 'flex', justifyContent:"center" }}>
            <ImportIRIButton onImport={ onImport }/>
            <ImportJSONButton onImport={ onImport }/>
            <ExportButton/>
        </Stack>
    )
}

export default ImportTab