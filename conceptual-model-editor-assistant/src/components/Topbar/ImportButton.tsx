import { ChangeEvent } from "react";
import Button from "@mui/material/Button";
import UploadIcon from '@mui/icons-material/Upload';
import { Attribute, ConceptualModelJson, Entity, Field, ItemType, NodeData, EdgeData, Relationship } from "../../interfaces";
import { useSetRecoilState } from "recoil";
import { edgesState, nodesState } from "../../atoms";
import { Node, Edge } from 'reactflow';
import useConceptualModel from "../../hooks/useConceptualModel";
import { CUSTOM_EDGE_MARKER, CUSTOM_ISA_EDGE_MARKER, createEdgeID } from "../../hooks/useUtility";


const ImportButton: React.FC = () =>
{
    const setNodes = useSetRecoilState(nodesState)
    const setEdges = useSetRecoilState(edgesState)

    const { onAddAttributesToNode } = useConceptualModel()


    const onImport = (conceptualModelJson: ConceptualModelJson) =>
    {
        console.log("Importing")

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
    

    const handleFileUpload = (changeEvent: ChangeEvent<HTMLInputElement>) =>
    {
        console.log("Uploading")
        if (!changeEvent.target.files)
        {
            console.log("Return")
            return
        }
        const file = changeEvent.target.files[0]

        const reader = new FileReader()
        reader.onload = (event) =>
        {
            if (!event?.target?.result)
            {
                return
            }

            const { result } = event.target
            let jsonObject = JSON.parse(result as string)
            onImport(jsonObject)
        }
        reader.readAsText(file)

        // Clear the file name so the "onChange" handler fires again even when the same file is uploaded more than once
        changeEvent.target.value = ""
    }

    return (
        <Button
            variant="contained"
            disableElevation
            sx={{ textTransform: "capitalize" }}
            startIcon={ <UploadIcon/> }
            component="label"
        >
            Import
            <input
                type="file"
                accept=".json"
                hidden
                onChange={ handleFileUpload }
            />
        </Button>
    )
}

export default ImportButton