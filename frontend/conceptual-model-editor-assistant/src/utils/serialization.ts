import { Node, Edge } from "reactflow"
import { NodeData, Class, Attribute, EdgeData, Association, ConceptualModelObject } from "../definitions/conceptualModel"
import { ConceptualModelJson, ClassJson, AttributeJson, RelationshipJson, GeneralizationJson, JSON_SCHEMA } from "../definitions/conceptualModelJSON"
import { Field, ItemType } from "../definitions/utility"


export const convertConceptualModelToJSON = (nodes: Node[], edges: Edge[]): ConceptualModelJson =>
{
    let conceptualModel: ConceptualModelJson = { $schema: JSON_SCHEMA, classes: [], attributes: [], relationships: [], generalizations: [] }

    let { newClasses, newAttributes } = convertNodesToJSON(nodes)

    conceptualModel.classes.push(...newClasses)
    conceptualModel.attributes.push(...newAttributes)

    let { newRelationships, newGeneralizations } = convertEdgesToJSON(edges)
    
    conceptualModel.relationships.push(...newRelationships)
    conceptualModel.generalizations.push(...newGeneralizations)

    return conceptualModel
}


const convertNodesToJSON = (nodes: Node[]) =>
{
    let newClasses: ClassJson[] = []
    let newAttributes: AttributeJson[] = []

    for (let i = 0; i < nodes.length; i++)
    {
        const node: Node = nodes[i]
        const nodeData: NodeData = node.data
        const clss: Class = nodeData.class
        const attributes: Attribute[] = nodeData.attributes
    
        const newEntityJson: ClassJson = {
            iri: clss[Field.IRI], title: clss[Field.NAME], description: clss[Field.DESCRIPTION]
        }
    
        newClasses.push(newEntityJson)
    
        for (let j = 0; j < attributes.length; j++)
        {
            const attribute: Attribute = attributes[j]

            const newAttributeJson: AttributeJson = {
                iri: attribute[Field.IRI], title: attribute[Field.NAME], description: attribute[Field.DESCRIPTION],
                domain: attribute[Field.SOURCE_CLASS], domainCardinality: "many",
                range: "", rangeCardinality: convertCardinality(attribute[Field.SOURCE_CARDINALITY])
            }
    
            newAttributes.push(newAttributeJson)
        }
    }

    return { newClasses, newAttributes }
}


const convertEdgesToJSON = (edges: Edge[]) =>
{
    let newRelationships: RelationshipJson[] = []
    let newGeneralizations: GeneralizationJson[] = []

    for (let i = 0; i < edges.length; i++)
    {
        const edge: Edge = edges[i]
        const edgeData: EdgeData = edge.data
    
        const relationship: Association = edgeData.association

        if (relationship[Field.TYPE] !== ItemType.GENERALIZATION)
        {
            // Process relationships
            const newRelationshipJson: RelationshipJson = {
                iri: relationship[Field.IRI], title: relationship[Field.NAME], description: relationship[Field.DESCRIPTION],
                domain: relationship[Field.SOURCE_CLASS], domainCardinality: relationship[Field.SOURCE_CARDINALITY],
                range: relationship[Field.TARGET_CLASS], rangeCardinality: relationship[Field.TARGET_CARDINALITY]
            }
    
            newRelationships.push(newRelationshipJson)
        }
        else
        {
            // Process generalizations
            const newGeneralizationJson: GeneralizationJson = {
                iri: relationship[Field.IRI], title: relationship[Field.NAME], description: relationship[Field.DESCRIPTION],
                specialClass: relationship[Field.SOURCE_CLASS], generalClass: relationship[Field.TARGET_CLASS]
            }
    
            newGeneralizations.push(newGeneralizationJson)
        }
    }

    return { newRelationships, newGeneralizations }
}


export const convertConceptualModelToObjectSummary = (nodes: Node[], edges: Edge[], isOnlyNames : boolean): ConceptualModelObject =>
{
    let result: ConceptualModelObject = {
        classes: [],
        associations: []
    }

    for (let node of nodes)
    {
        let attributes = []
        for (let attribute of node.data.attributes)
        {
            if (isOnlyNames)
            {
                attributes.push({ [Field.NAME]: attribute[Field.NAME] })
            }
            else
            {
                attributes.push({ [Field.NAME]: attribute[Field.NAME], [Field.ORIGINAL_TEXT]: attribute[Field.ORIGINAL_TEXT] })
            }
        }

        const nodeData: NodeData = node.data
        result.classes.push({ [Field.NAME]: nodeData.class[Field.NAME], attributes: attributes })
    }


    let associations: Association[] = []
    for (let edge of edges)
    {
        const edgeData: EdgeData = edge.data
        associations.push(edgeData.association)
    }

    result.associations = associations

    return result
}


export const convertCardinality = (cardinality: string): string =>
{
    if (cardinality === "optional-one" || cardinality === "one" || cardinality === "many")
    {
        return cardinality
    }

    const defaultCardinality = "many"
    return defaultCardinality
}