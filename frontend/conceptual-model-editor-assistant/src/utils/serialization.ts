import { Node, Edge } from "reactflow"
import { NodeData, Class, Attribute, EdgeData, Association } from "../definitions/conceptualModel"
import { ConceptualModelJson, ClassJson, AttributeJson, RelationshipJson, GeneralizationJson, JSON_SCHEMA } from "../definitions/conceptualModelJSON"
import { Field, ItemType } from "../definitions/utility"
import { SummaryAttribute, SummaryClass, SummaryConceptualModel } from "../definitions/summary"


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
    
        const newClassJson: ClassJson = {
            iri: clss[Field.IRI], title: clss[Field.NAME], description: clss[Field.DESCRIPTION]
        }
    
        newClasses.push(newClassJson)
    
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
    
        const association: Association = edgeData.association

        if (association[Field.TYPE] !== ItemType.GENERALIZATION)
        {
            // Process relationships
            const newRelationshipJson: RelationshipJson = {
                iri: association[Field.IRI], title: association[Field.NAME], description: association[Field.DESCRIPTION],
                domain: association[Field.SOURCE_CLASS], domainCardinality: association[Field.SOURCE_CARDINALITY],
                range: association[Field.TARGET_CLASS], rangeCardinality: association[Field.TARGET_CARDINALITY]
            }
    
            newRelationships.push(newRelationshipJson)
        }
        else
        {
            // Process generalizations
            const newGeneralizationJson: GeneralizationJson = {
                iri: association[Field.IRI], title: association[Field.NAME], description: association[Field.DESCRIPTION],
                specialClass: association[Field.SOURCE_CLASS], generalClass: association[Field.TARGET_CLASS]
            }
    
            newGeneralizations.push(newGeneralizationJson)
        }
    }

    return { newRelationships, newGeneralizations }
}


export const convertConceptualModelToObjectSummary = (nodes: Node[], edges: Edge[]): SummaryConceptualModel =>
{
    let result: SummaryConceptualModel = {
        classes: [],
        associations: []
    }

    for (let node of nodes)
    {
        let attributes: SummaryAttribute[] = []
        for (let attribute of node.data.attributes)
        {
            const summaryAttribute: SummaryAttribute = {
                [Field.NAME]: attribute[Field.NAME], [Field.DESCRIPTION]: attribute[Field.DESCRIPTION],
                [Field.ORIGINAL_TEXT]: attribute[Field.ORIGINAL_TEXT]
            }
            attributes.push(summaryAttribute)
        }

        const nodeData: NodeData = node.data
        const originalClass: Class = nodeData.class

        const summaryClass: SummaryClass = {
            [Field.NAME]: originalClass[Field.NAME], [Field.DESCRIPTION]: originalClass[Field.DESCRIPTION],
            [Field.ORIGINAL_TEXT]: originalClass[Field.ORIGINAL_TEXT], attributes: attributes
        }
        result.classes.push(summaryClass)
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