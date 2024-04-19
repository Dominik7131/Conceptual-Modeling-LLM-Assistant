import { Button, Stack } from "@mui/material"
import DomainDescriptionTextArea from "./DomainDescriptionTextArea";
import AddIcon from '@mui/icons-material/Add';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ExportButton from "./ExportButton";
import HighlightSelectedItemsButton from "./HighlightSelectedItemsButton";
import { UserChoice } from "../../interfaces";
import { SUMMARY_DESCRIPTIONS_NAME, SUMMARY_PLAIN_TEXT_NAME } from "../../hooks/useUtility";
import ImportIRIButton from "./ImportIRIButton";
import ImportJSONButton from "./ImportJSONButton";
import { Attribute, ConceptualModelJson, Entity, Field, ItemType, NodeData, EdgeData, Relationship } from "../../interfaces";
import { edgesState, importedFileNameState, nodesState } from "../../atoms";
import { Node, Edge } from 'reactflow';
import useConceptualModel from "../../hooks/useConceptualModel";
import { CUSTOM_EDGE_MARKER, CUSTOM_ISA_EDGE_MARKER, createEdgeID } from "../../hooks/useUtility";
import { useSetRecoilState } from "recoil";


const ControlButtons: React.FC = (): JSX.Element =>
{
    const { onAddNewEntity, onSuggestItems, onSummaryPlainTextClick, onSummaryDescriptionsClick } = useConceptualModel()

    const setNodes = useSetRecoilState(nodesState)
    const setEdges = useSetRecoilState(edgesState)
    const { onAddAttributesToNode } = useConceptualModel()


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
    
    
        for (const [key, entity] of Object.entries(conceptualModelJson.classes))
        {
            const entityNameLowerCase = entity.title.toLowerCase()
        
            const newEntity: Entity = {
                [Field.TYPE]: ItemType.ENTITY, [Field.ID]: 0, [Field.NAME]: entityNameLowerCase, [Field.DESCRIPTION]: entity.description,
                [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: []
            }
        
            const nodeData : NodeData = { entity: newEntity, attributes: [] }
        
            const newNode : Node = {
                id: entityNameLowerCase, type: "customNode", position: { x: positionX, y: positionY }, data: nodeData
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
    
    
        for (const [_, attribute] of Object.entries(conceptualModelJson.attributes))
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
                    onAddAttributesToNode(newAttribute)
                }
            }
        }
    
        for (const [_, relationship] of Object.entries(conceptualModelJson.relationships))
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
    
        for (const [_, generalization] of Object.entries(conceptualModelJson.generalizations))
        {
            const nameLowerCase = generalization.title.toLowerCase()
            const sourceEntityLowerCase = generalization.specialClass.toLowerCase()
            const targetEntityLowerCase = generalization.generalClass.toLowerCase()
        
            const newRelationship: Relationship = {
                [Field.ID]: 0, [Field.TYPE]: ItemType.RELATIONSHIP, [Field.NAME]: nameLowerCase, [Field.DESCRIPTION]: "",
                [Field.SOURCE_ENTITY]: sourceEntityLowerCase, [Field.TARGET_ENTITY]: targetEntityLowerCase,
                [Field.SOURCE_CARDINALITY]: "", [Field.TARGET_CARDINALITY]: "", [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: []
            }
        
            const edgeData: EdgeData = { relationship: newRelationship }
        
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
        <>
            <DomainDescriptionTextArea/>
            
            <Stack direction="row" justifyContent="space-between" paddingX={1} paddingY={"8px"}>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        sx={{textTransform: "none"}}
                        disableElevation
                        startIcon={<AutoFixHighIcon/>}
                        onClick={() => onSuggestItems(UserChoice.ENTITIES, null, null)}>
                            Suggest entities
                    </Button>

                    <Button
                        variant="contained"
                        sx={{textTransform: "none"}}
                        disableElevation
                        startIcon={<AddIcon/>}
                        onClick={onAddNewEntity}>
                            Add new entity
                    </Button>
                </Stack>

                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        sx={{textTransform: "none"}}
                        disableElevation
                        startIcon={<AutoFixHighIcon/>}
                        onClick={ onSummaryPlainTextClick }>
                            { SUMMARY_PLAIN_TEXT_NAME }
                    </Button>

                    <Button
                        variant="contained"
                        sx={{textTransform: "none"}}
                        disableElevation
                        startIcon={<AutoFixHighIcon/>}
                        onClick={ onSummaryDescriptionsClick }>
                            { SUMMARY_DESCRIPTIONS_NAME }
                    </Button>
                    
                    <HighlightSelectedItemsButton/>
                </Stack>

                <Stack direction="row" spacing={2}>
                    <ImportIRIButton onImport={ onImport }/>
                    <ImportJSONButton onImport={ onImport }/>
                    <ExportButton/>
                </Stack>
            </Stack>
        </>
    )
}

export default ControlButtons