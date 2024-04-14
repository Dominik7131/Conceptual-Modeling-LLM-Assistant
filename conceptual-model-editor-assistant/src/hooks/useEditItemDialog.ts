import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { domainDescriptionState, edgesState, editedSuggestedItemState, fieldToLoadState, isLoadingEditState, isShowEditDialogState, nodesState, regeneratedItemState, selectedSuggestedItemState, suggestedItemsState } from "../atoms"
import { Attribute, EdgeData, Entity, Field, Item, ItemType, NodeData, Relationship, UserChoice } from "../interfaces"
import { Node, Edge } from 'reactflow';
import { BASE_URL, HEADER, createEdgeID } from "./useUtility";
import useConceptualModel from "./useConceptualModel";


const useEditItemDialog = () =>
{
    const setIsOpened = useSetRecoilState(isShowEditDialogState)
    const setSuggestedItems = useSetRecoilState(suggestedItemsState)
    const setSelectedSuggestedItem = useSetRecoilState(selectedSuggestedItemState)
    const setEditedSuggestedItem = useSetRecoilState(editedSuggestedItemState)
    const [regeneratedItem, setRegeneratedItem] = useRecoilState(regeneratedItemState)

    const setNodes = useSetRecoilState(nodesState)
    const setEdges = useSetRecoilState(edgesState)

    const domainDescription = useRecoilValue(domainDescriptionState)
    const setFieldToLoad = useSetRecoilState(fieldToLoadState)

    const setIsLoadingEdit = useSetRecoilState(isLoadingEditState)

    const { onAddItem } = useConceptualModel()

    const EDIT_ITEM_ENDPOINT = "getOnly"
    const EDIT_ITEM_URL = BASE_URL + EDIT_ITEM_ENDPOINT


    const onClose = (): void =>
    {
        onClearRegeneratedItem(null, true)
        setIsOpened(_ => false)
    }

    const onSave = (newItem: Item, oldItem: Item, isSuggestedItem: boolean): void =>
    {
        if (!newItem.name)
        {
            alert("Name cannot be empty")
            return
        }
    
        setIsOpened(_ => false)
    
        if (isSuggestedItem)
        {
            // TODO: instead of selectedSuggestedItem have only ID saved
            setSelectedSuggestedItem(_ => newItem)
        
            setSuggestedItems((previousItems: Item[]) => previousItems.map((item: Item) =>
            {
                if (item.ID === newItem.ID)
                {
                    return newItem
                }
                return item
            }))
            
            return
        }
    
        if (newItem.type === ItemType.ENTITY)
        {
            editNodeEntity(newItem as Entity, oldItem as Entity)
        }
        else if (newItem.type === ItemType.ATTRIBUTE)
        {
            editNodeAttribute(newItem as Attribute, oldItem as Attribute)
        }
        else if (newItem.type === ItemType.RELATIONSHIP)
        {
            editEdgeRelationship(newItem as Relationship, oldItem as Relationship)
        }
        else
        {
            alert("Unknown action")
        }
    }

    const onItemEdit = (field: Field, newValue : string) : void =>
    {
        setEditedSuggestedItem((previousItem: Item) =>
        { 
            return { ...previousItem, [field]: newValue }
        })
    }


    const editNodeEntity = (newEntity: Entity, oldEntity: Entity): void =>
    {
        const id: string = oldEntity.name    
    
        if (newEntity.name !== oldEntity.name)
        {
            // Update all edges that connect to the changed source or target entity
            setEdges((edges) => edges.map((currentEdge: Edge) =>
            {
                if (currentEdge.source === oldEntity.name)
                {
                    return { ...currentEdge, id: createEdgeID(newEntity.name, currentEdge.target, currentEdge.data.label), source: newEntity.name }
                }
                else if (currentEdge.target === oldEntity.name)
                {
                    return { ...currentEdge, id: createEdgeID(currentEdge.source, newEntity.name, currentEdge.data.label), target: newEntity.name }
                }
                    return currentEdge
            }))
        }
    
        setNodes((nodes: Node[]) => nodes.map((currentNode : Node) =>
        {
            if (currentNode.id === id)
            {
                const newData : NodeData = {
                    ...currentNode.data, description: newEntity.description, originalText: newEntity.originalText, originalTextIndexes: newEntity.originalTextIndexes
                }
                const newNode: Node = {...currentNode, id: newEntity.name, data: newData}

                return newNode
            }
            else
            {
                return currentNode
            }
        }))
    }
      
      
    const editNodeAttribute = (newAttribute: Attribute, oldAttribute: Attribute): void =>
    {
        const id: string = oldAttribute.source
    
        setNodes((nodes: Node[]) => nodes.map((currentNode: Node) =>
        {
            if (currentNode.id === id)
            {
                const newAttributes = currentNode.data.attributes.map((attribute: Attribute) =>
                {
                    if (attribute.name === oldAttribute.name)
                    {
                        return newAttribute
                    }
                    else
                    {
                        return attribute
                    }
                })

                const newData: NodeData = { ...currentNode.data, attributes: newAttributes}
                const newNode: Node = { ...currentNode, data: newData}
                return newNode
            }
            else
            {
                return currentNode
            }
        }))
    }
    
    
    const editEdgeRelationship = (newRelationship: Relationship, oldRelationship : Relationship): void =>
    {
        // Find the right edge based on the old ID
        const oldID: string = createEdgeID(oldRelationship.source, oldRelationship.target, oldRelationship.name)
        // let oldEdge = edges.find(edge => edge.id === oldID)
    
        // if (!oldEdge)
        // {
        //     return
        // }
    

    
        setEdges((edges) => edges.map((currentEdge : Edge) =>
        {
            if (currentEdge.id === oldID)
            {
                const newData: EdgeData = {
                    ...currentEdge.data, description: newRelationship.description, cardinality: newRelationship.cardinality,
                    originalText: newRelationship.originalText
                }
                
                const newID = createEdgeID(newRelationship.source, newRelationship.target, newRelationship.name)
                
                // TODO: Is the user allowed to change source and target?
                // If the source/target does not exist we need to create a new node
                let newEdge: Edge = {
                    ...currentEdge, id: newID, label: newRelationship.name, source: newRelationship.source, target: newRelationship.target, data: newData
                }

                return newEdge
            }
            else
            {
                return currentEdge
            }
        }))
    }

    const onClearRegeneratedItem = (field: Field | null, isClearAll: boolean) : void=>
    {
        if (isClearAll)
        {
            setEditedSuggestedItem({ID: -1, type: ItemType.ENTITY, name: "", description: "", originalText: "", originalTextIndexes: [], dataType: "", cardinality: ""})
            setRegeneratedItem({ID: -1, type: ItemType.ENTITY, name: "", description: "", originalText: "", originalTextIndexes: [], dataType: "", cardinality: ""})
        }

        if (!field)
        {
            return
        }

        setRegeneratedItem((previousRegeneratedItem: Item) =>
        {
            if (previousRegeneratedItem.hasOwnProperty(field))
            {
                return { ...previousRegeneratedItem, [field]: ""}   
            }
            
            return previousRegeneratedItem
        })
    }
    
    
    const onConfirmRegeneratedText = (field : Field) =>
    {
        setEditedSuggestedItem((editedItem: Item) =>
        {
            // Set type to "any" because Typescript doesn't recognise that we already did the check
            // Otherwise we need to write an if-statement for each field of type Item
            if (regeneratedItem.hasOwnProperty(field))
            {
                return {...editedItem, [field]: (regeneratedItem as any)[field]}
            }
            return editedItem
        })

        onClearRegeneratedItem(field, false)
    }
    

    const onGenerateField = (itemType: ItemType, name: string, sourceEntity: string, targetEntity: string, field: Field) =>
    {
        let userChoice = UserChoice.ENTITIES

        if (itemType === ItemType.ATTRIBUTE)
        {
            userChoice = UserChoice.ATTRIBUTES 
        }
        else if (itemType === ItemType.RELATIONSHIP)
        {
            userChoice = UserChoice.RELATIONSHIPS
        }

        if (userChoice === UserChoice.ENTITIES)
        {
            sourceEntity = name
        }

        if (!sourceEntity) { sourceEntity = "" }
        if (!targetEntity) { targetEntity = "" }

        const bodyData = JSON.stringify({
            "name": name, "sourceEntity": sourceEntity, "targetEntity": targetEntity, "field": field, "userChoice": userChoice,
            "domainDescription": domainDescription
        })

        setFieldToLoad(field)
        fetchStreamedDataGeneral(bodyData, name, field)
    }

    // TODO: Put this fetch-function into a separate file
    const fetchStreamedDataGeneral = (bodyData: any, attributeName: string, field: Field) =>
    {
        setIsLoadingEdit(_ => true)

        fetch(EDIT_ITEM_URL, { method: "POST", headers: HEADER, body: bodyData })
        .then(response =>
        {
            const stream = response.body; // Get the readable stream from the response body

            if (stream === null)
            {
                console.log("Stream is null")
                setIsLoadingEdit(_ => false)
                return
            }

            const reader = stream.getReader();

            const readChunk = () =>
            {
                reader.read()
                    .then(({value, done}) =>
                    {
                        if (done)
                        {
                            console.log("Stream finished")
                            setIsLoadingEdit(_ => false)
                            return
                        }

                        onProcessStreamedDataGeneral(value, field)
                        
                        readChunk(); 
                    })
                    .catch(error =>
                    {
                        console.error(error);
                    });
            };
            readChunk(); // Start reading the first chunk
        })
        .catch(error =>
        {
            console.error(error);
            setIsLoadingEdit(_ => false)
            alert("Error: request failed")
        });
    }


    function onProcessStreamedDataGeneral(value: any, field: Field): void
    {
        // Convert the `value` to a string
        var jsonString = new TextDecoder().decode(value)
        console.log(jsonString)
        console.log("\n")

        const parsedData = JSON.parse(jsonString)
        setRegeneratedItem((regeneratedItem) =>
        {
            return {...regeneratedItem, [field]: parsedData[field]}
        })
    }


    const onChangeItemType = (item: Item): void =>
    {
        // If the item is attribute then transform it into relationship
        // Otherwise transform relationsip into attribute
    
        if (item.type === ItemType.ATTRIBUTE)
        {
        const oldAttribute = item as Attribute
    
        const relationship : Relationship = {
            ID: oldAttribute.ID, type: ItemType.RELATIONSHIP, name: "", description: oldAttribute.description,
            originalText: oldAttribute.originalText, originalTextIndexes: oldAttribute.originalTextIndexes, source: oldAttribute.source,
            target: oldAttribute.name, cardinality: ""}
    
        setSelectedSuggestedItem(_ => relationship)
        setEditedSuggestedItem(_ => relationship)
        }
        else
        {
        const oldRelationship = item as Relationship
    
        const attribute : Attribute = {
            ID: oldRelationship.ID, type: ItemType.ATTRIBUTE, name: oldRelationship.target, description: oldRelationship.description,
            dataType: "string", originalText: oldRelationship.originalText, originalTextIndexes: oldRelationship.originalTextIndexes,
            cardinality: "", source: oldRelationship.source
        }
    
        setSelectedSuggestedItem(_ => attribute)
        setEditedSuggestedItem(_ => attribute)
        }
    }
    

    const onRemove = (item: Item): void =>
    {
        if (item.type === ItemType.ENTITY)
        {
            const nodeID = item.name
            removeNode(nodeID)
        }
        else if (item.type === ItemType.ATTRIBUTE)
        {
            removeNodeAttribute(item as Attribute)
        }
        else if (item.type === ItemType.RELATIONSHIP)
        {
            const relationship: Relationship = (item as Relationship)
            const edgeID = createEdgeID(relationship.source, relationship.target, relationship.name)
            removeEdge(edgeID)
        }
        else
        {
            alert("Unknown action")
        }
    }

    const removeNode = (nodeID: string): void =>
    {
        setNodes((previousNodes) => previousNodes.filter(node => node.id !== nodeID))
    }
    
    
    const removeEdge = (edgeID: string): void =>
    {
        setEdges((edges: Edge[]) => edges.filter(edge => edge.id !== edgeID))
    }
    
    
    const removeNodeAttribute = (attribute: Attribute): void =>
    {
        const nodeID: string = attribute.source
    
        setNodes((nodes) => nodes.map((currentNode : Node) =>
        {
            if (currentNode.id === nodeID)
            {
                const newAttributes = currentNode.data.attributes.filter((element: Attribute) => element.name !== attribute.name)
                const newData: NodeData = { ...currentNode.data, attributes: newAttributes }
                const newNode = { ...currentNode, data: newData }
                return newNode
            }
            else
            {
                return currentNode
            }
        }))
    }

    return { onAddItem, onSave, onClose, onGenerateField, onRemove, onItemEdit, onConfirmRegeneratedText, onChangeItemType, onClearRegeneratedItem }
}

export default useEditItemDialog