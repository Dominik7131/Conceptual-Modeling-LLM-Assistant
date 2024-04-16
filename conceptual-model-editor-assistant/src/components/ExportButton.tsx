import { Button } from "@mui/material"
import DownloadIcon from '@mui/icons-material/Download';
import { Attribute, AttributeJson, ConceptualModelJson, EdgeData, Entity, EntityJson, GeneralizationJson, NodeData, Relationship, RelationshipJson } from "../interfaces";
import { Node, Edge } from "reactflow";
import { edgesState, nodesState } from "../atoms";
import { useRecoilValue } from "recoil";


const ExportButton: React.FC = (): JSX.Element =>
{
    const nodes = useRecoilValue(nodesState)
    const edges = useRecoilValue(edgesState)


    const onExport = () =>
    {
        const conceptualModelJson = convertConceptualModelToJson()
        const content = JSON.stringify(conceptualModelJson)
        console.log(content)
        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = "export.json"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }


    const convertConceptualModelToJson = (): ConceptualModelJson =>
    {
        let conceptualModel: ConceptualModelJson = { classes: [], attributes: [], relationships: [], generalizations: [] }
    
        // TODO: Iterate over each node to get all "classes" and "attributes"
        for (let i = 0; i < nodes.length; i++)
        {
            const node: Node = nodes[i]
            const nodeData: NodeData = node.data
            const entity: Entity = nodeData.entity
            const attributes: Attribute[] = nodeData.attributes
        
            const newEntityJson: EntityJson = {
                iri: "", title: entity.name, description: entity.description
            }
        
            conceptualModel.classes.push(newEntityJson)
        
            for (let j = 0; j < attributes.length; j++)
            {
                const attribute: Attribute = attributes[j]
        
                const newAttributeJson: AttributeJson = {
                iri: "", title: attribute.name, description: attribute.description, domain: attribute.source, domainCardinality: "optional-one",
                range: "", rangeCardinality: "optional-one"
                }
        
                conceptualModel.attributes.push(newAttributeJson)
            }
        }
    
        for (let i = 0; i < edges.length; i++)
        {
            const edge: Edge = edges[i]
            const edgeData: EdgeData = edge.data
        
            const relationship: Relationship = edgeData.relationship
        
            // TODO: Probably add new field into Relationships to remember if the relationship is a relationship or a generalization
            if (relationship.name !== "is-a")
            {
                const newRelationshipJson: RelationshipJson = {
                iri: "", title: relationship.name, description: relationship.description,
                domain: relationship.source, domainCardinality: "optional-one", range: "", rangeCardinality: "optional-one"
                }
        
                conceptualModel.relationships.push(newRelationshipJson)
            }
            else
            {
                const newGeneralizationJson: GeneralizationJson = {
                iri: "", title: relationship.name, description: relationship.description,
                specialClass: relationship.source, generalClass: "optional-one"
                }
        
                conceptualModel.generalizations.push(newGeneralizationJson)
            }
        }
    
        return conceptualModel
    }


    return (
        <Button
            variant="contained"
            disableElevation
            sx={{textTransform: "none"}}
            startIcon={<DownloadIcon/>}
            onClick={onExport}>
        Export
    </Button>
    )
}

export default ExportButton