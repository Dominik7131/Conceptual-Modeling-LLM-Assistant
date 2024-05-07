import { Stack } from "@mui/material"
import ImportIRIButton from "./ImportFromDataspecerButton"
import ImportJSONButton from "./ImportJSONButton"
import ExportButton from "./ExportJSONButton"
import { Attribute, ConceptualModelJson, Entity, Field, ItemType, NodeData, EdgeData, Relationship } from "../../interfaces";
import { edgesState, importedFileNameState, nodesState } from "../../atoms";
import { Node, Edge } from 'reactflow';
import { CUSTOM_EDGE_MARKER, CUSTOM_ISA_EDGE_MARKER, createEdgeUniqueID, onAddItem } from "../../hooks/useUtility";
import { useSetRecoilState } from "recoil";
import ExportIntoDataspecerButton from "./ExportIntoDataspecerButton";
import ExportJSONButton from "./ExportJSONButton";
import ImportFromDataspecerButton from "./ImportFromDataspecerButton";


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
            const entityIriLowerCase = entity.iri.toLowerCase()
            const entityTitle = entity.title
        
            const newEntity: Entity = {
                [Field.IRI]: entityIriLowerCase, [Field.NAME]: entityTitle, [Field.DESCRIPTION]: entity.description,
                [Field.TYPE]: ItemType.ENTITY, [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: []
            }
        
            const nodeData : NodeData = { entity: newEntity, attributes: [] }
        
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
                [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: [], [Field.SOURCE_ENTITY]: sourceEntityLowerCase,
                [Field.DATA_TYPE]: "", [Field.SOURCE_CARDINALITY]: domainCardinality
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
            const iriLowerCase = relationship.iri.toLowerCase()
            const sourceEntityLowerCase = relationship.domain.toLowerCase()
            const targetEntityLowerCase = relationship.range.toLowerCase()

            const domainCardinality = relationship.domainCardinality ?? ""
            const rangeCardinality = relationship.rangeCardinality ?? ""
        
            const newRelationship: Relationship = {
                [Field.IRI]: iriLowerCase, [Field.NAME]: relationship.title, [Field.DESCRIPTION]: relationship.description, [Field.TYPE]: ItemType.RELATIONSHIP,
                [Field.SOURCE_ENTITY]: sourceEntityLowerCase, [Field.TARGET_ENTITY]: targetEntityLowerCase,
                [Field.SOURCE_CARDINALITY]: domainCardinality, [Field.TARGET_CARDINALITY]: rangeCardinality,
                [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: []
            }
        
            const edgeData: EdgeData = { relationship: newRelationship }
        
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
        
            const newGeneralization: Relationship = {
                [Field.IRI]: iriLowerCase, [Field.NAME]: generalization.title, [Field.DESCRIPTION]: "", [Field.TYPE]: ItemType.GENERALIZATION,
                [Field.SOURCE_ENTITY]: sourceEntityLowerCase, [Field.TARGET_ENTITY]: targetEntityLowerCase,
                [Field.SOURCE_CARDINALITY]: "", [Field.TARGET_CARDINALITY]: "", [Field.ORIGINAL_TEXT]: "",
                [Field.ORIGINAL_TEXT_INDEXES]: []
            }
        
            const edgeData: EdgeData = { relationship: newGeneralization }
        
            const newID: string = createEdgeUniqueID(sourceEntityLowerCase, targetEntityLowerCase, generalization.title)
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
            <ImportFromDataspecerButton onImport={ onImport }/>
            <ImportJSONButton onImport={ onImport }/>

            <ExportJSONButton/>
            <ExportIntoDataspecerButton/>
            
        </Stack>
    )
}

export default ImportTab