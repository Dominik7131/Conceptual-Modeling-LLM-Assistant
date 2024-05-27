import { Node, Edge } from "reactflow"
import { SetterOrUpdater } from "recoil"
import { NodeData, Attribute, EdgeData } from "../definitions/conceptualModel"
import { Field } from "../definitions/utility"


export const invalidateAllOriginalTextIndexes = (setNodes: SetterOrUpdater<Node[]>, setEdges: SetterOrUpdater<Edge[]>) =>
{   
    invalidateAllOriginalTextIndexesNodes(setNodes)
    invalidateAllOriginalTextIndexesEdges(setEdges)
}


export const invalidateAllOriginalTextIndexesNodes = (setNodes: SetterOrUpdater<Node[]>) =>
{
    setNodes((nodes: Node[]) => nodes.map(currentNode => 
    {
        const currentNodeData: NodeData = currentNode.data

        let newNode: Node = { ...currentNode }

        if (currentNodeData.class.hasOwnProperty(Field.ORIGINAL_TEXT_INDEXES))
        {
            newNode = {...currentNode, data: { ...currentNodeData, class: { ...currentNodeData.class, [Field.ORIGINAL_TEXT_INDEXES]: [] }}}
        }

        let newAttributes: Attribute[] = []
        const currentAttributes: Attribute[] = currentNodeData.attributes

        for (let i = 0; i < currentAttributes.length; i++)
        {
            if (currentAttributes[i].hasOwnProperty(Field.ORIGINAL_TEXT_INDEXES))
            {
                newAttributes.push( {...currentAttributes[i], [Field.ORIGINAL_TEXT_INDEXES]: [] })
            }
            else
            {
                newAttributes.push(currentAttributes[i])
            }
        }

        newNode = { ...newNode, data: { ...newNode.data, attributes: newAttributes }}

        return newNode
    }))
}


export const invalidateAllOriginalTextIndexesEdges = (setEdges: SetterOrUpdater<Edge[]>) =>
{
    setEdges((edges: Edge[]) => edges.map(currentEdge => 
    {
        const currentEdgeData: EdgeData = currentEdge.data

        if (currentEdgeData.association.hasOwnProperty(Field.ORIGINAL_TEXT_INDEXES))
        {
            const newEdge: Edge = {...currentEdge, data: { ...currentEdgeData, association: { ...currentEdgeData.association, [Field.ORIGINAL_TEXT_INDEXES]: [] }}}
            return newEdge
        }

        return currentEdge
    }))
}