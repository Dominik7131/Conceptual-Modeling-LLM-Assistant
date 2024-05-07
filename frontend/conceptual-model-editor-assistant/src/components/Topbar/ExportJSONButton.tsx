import { Button } from "@mui/material"
import DownloadIcon from '@mui/icons-material/Download';
import { Attribute, AttributeJson, ConceptualModelJson, EdgeData, Entity, EntityJson, Field, GeneralizationJson, ItemType, NodeData, Relationship, RelationshipJson } from "../../interfaces";
import { Node, Edge } from "reactflow";
import { edgesState, importedFileNameState, modelIDState, nodesState } from "../../atoms";
import { useRecoilValue } from "recoil";


const ExportJSONButton: React.FC = (): JSX.Element =>
{
    const nodes = useRecoilValue(nodesState)
    const edges = useRecoilValue(edgesState)

    const importedFileName = useRecoilValue(importedFileNameState)

    const export_name = `${useRecoilValue(modelIDState)}.json`
    const export_file_name = importedFileName === "" ? export_name : `${importedFileName}-${export_name}`

    const SCHEMA = "https://schemas.dataspecer.com/adapters/simplified-semantic-model.v1.0.schema.json"



    const onExport = () =>
    {
        const conceptualModelJson = convertConceptualModelToJson()
        const content = JSON.stringify(conceptualModelJson)
        console.log(content)
        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = export_file_name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }


    const convertConceptualModelToJson = (): ConceptualModelJson =>
    {
        // "$schema":"https://schemas.dataspecer.com/adapters/simplified-semantic-model.v1.0.schema.json",
        let conceptualModel: ConceptualModelJson = { $schema: SCHEMA, classes: [], attributes: [], relationships: [], generalizations: [] }
    
        for (let i = 0; i < nodes.length; i++)
        {
            const node: Node = nodes[i]
            const nodeData: NodeData = node.data
            const entity: Entity = nodeData.entity
            const attributes: Attribute[] = nodeData.attributes
        
            const newEntityJson: EntityJson = {
                iri: entity[Field.IRI], title: entity[Field.NAME], description: entity[Field.DESCRIPTION]
            }
        
            conceptualModel.classes.push(newEntityJson)
        
            for (let j = 0; j < attributes.length; j++)
            {
                const attribute: Attribute = attributes[j]
        
                const newAttributeJson: AttributeJson = {
                    iri: attribute[Field.IRI], title: attribute[Field.NAME], description: attribute[Field.DESCRIPTION],
                    domain: attribute[Field.SOURCE_ENTITY], domainCardinality: attribute[Field.SOURCE_CARDINALITY],
                    range: "", rangeCardinality: null
                }
        
                conceptualModel.attributes.push(newAttributeJson)
            }
        }
    
        for (let i = 0; i < edges.length; i++)
        {
            const edge: Edge = edges[i]
            const edgeData: EdgeData = edge.data
        
            const relationship: Relationship = edgeData.relationship

            if (relationship[Field.TYPE] !== ItemType.GENERALIZATION)
            {
                // Relationships
                const newRelationshipJson: RelationshipJson = {
                    iri: relationship[Field.IRI], title: relationship[Field.NAME], description: relationship[Field.DESCRIPTION],
                    domain: relationship[Field.SOURCE_ENTITY], domainCardinality: relationship[Field.SOURCE_CARDINALITY],
                    range: relationship[Field.TARGET_ENTITY], rangeCardinality: relationship[Field.TARGET_CARDINALITY]
                }
        
                conceptualModel.relationships.push(newRelationshipJson)
            }
            else
            {
                // Generalizations
                const newGeneralizationJson: GeneralizationJson = {
                    iri: relationship[Field.IRI], title: relationship[Field.NAME], description: relationship[Field.DESCRIPTION],
                    specialClass: relationship[Field.SOURCE_ENTITY], generalClass: relationship[Field.TARGET_ENTITY]
                }
        
                conceptualModel.generalizations.push(newGeneralizationJson)
            }
        }
    
        return conceptualModel
    }


    return (
        <Button
            variant="contained"
            color="secondary"
            disableElevation
            sx={{textTransform: "none"}}
            startIcon={ <DownloadIcon/> }
            onClick={ onExport }>
        Export into JSON
    </Button>
    )
}

export default ExportJSONButton