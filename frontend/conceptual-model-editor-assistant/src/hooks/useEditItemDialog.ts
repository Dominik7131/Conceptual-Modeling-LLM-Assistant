import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { domainDescriptionSnapshotsState, domainDescriptionState, edgesState, editDialogErrorMsgState, editedSuggestedItemState, fieldToLoadState, isIgnoreDomainDescriptionState, isLoadingEditState, isShowEditDialogState, nodesState, regeneratedItemState, selectedSuggestedItemState } from "../atoms"
import { Attribute, EdgeData, Class, Field, Item, ItemType, NodeData, Association, UserChoice } from "../interfaces"
import { Node, Edge } from 'reactflow';
import { createEdgeUniqueID, createIRIFromName, createNameFromIRI, getSnapshotDomainDescription, itemTypeToUserChoice, snapshotDomainDescription } from "../utils/utility";
import { useState } from "react";
import { EDIT_ITEM_URL, HEADER, SAVE_SUGESTED_SINGLE_FIELD_URL } from "../utils/urls";


const useEditItemDialog = () =>
{
    const setIsOpened = useSetRecoilState(isShowEditDialogState)
    const setSelectedSuggestedItem = useSetRecoilState(selectedSuggestedItemState)
    const setEditedSuggestedItem = useSetRecoilState(editedSuggestedItemState)
    const [regeneratedItem, setRegeneratedItem] = useRecoilState(regeneratedItemState)

    const [changedItemName, setChangedItemName] = useState("")
    const [changedDataType, setChangedDataType] = useState("")

    const setNodes = useSetRecoilState(nodesState)
    const setEdges = useSetRecoilState(edgesState)

    const domainDescription = useRecoilValue(domainDescriptionState)
    const isIgnoreDomainDescription = useRecoilValue(isIgnoreDomainDescriptionState)
    const setFieldToLoad = useSetRecoilState(fieldToLoadState)

    const setErrorMessage = useSetRecoilState(editDialogErrorMsgState)

    const [domainDescriptionSnapshot, setSnapshotDomainDescription] = useRecoilState(domainDescriptionSnapshotsState)


    const onClose = (): void =>
    {
        onClearRegeneratedItem(null, true)
        setIsOpened(_ => false)
        setErrorMessage(_ => "")
    }

    const onSave = (newItem: Item, oldItem: Item): void =>
    {
        if (!newItem.name)
        {
            setErrorMessage(_ => "Name cannot be empty")
            return
        }
    
        setIsOpened(_ => false)
    
        if (newItem.type === ItemType.CLASS)
        {
            editNodeEntity(newItem as Class, oldItem as Class)
        }
        else if (newItem.type === ItemType.ATTRIBUTE)
        {
            editNodeAttribute(newItem as Attribute, oldItem as Attribute)
        }
        else if (newItem.type === ItemType.ASSOCIATION)
        {
            editEdgeRelationship(newItem as Association, oldItem as Association)
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
            if (field === Field.NAME)
            {
                const newIRI = createIRIFromName(newValue)
                return { ...previousItem, [field]: newValue, [Field.IRI]: newIRI }
            }
            else
            {
                return { ...previousItem, [field]: newValue }
            }
        })
    }


    const editNodeEntity = (newEntity: Class, oldEntity: Class): void =>
    {

        if (newEntity.name !== oldEntity.name)
        {
            // Update iri
            const newIRI = createIRIFromName(newEntity[Field.NAME])
            newEntity = {...newEntity, [Field.IRI]: newIRI}

            // Update all edges that connect to the changed source or target class
            setEdges((edges) => edges.map((currentEdge: Edge) =>
            {
                if (currentEdge.source === oldEntity.iri)
                {
                    const newRelationship: Association = { ...currentEdge.data.relationship, source: newEntity[Field.IRI] }
                    const newEdgeData: EdgeData = { ...currentEdge.data, association: newRelationship }
                    const edgeID = createEdgeUniqueID(newEntity[Field.IRI], currentEdge.target, currentEdge.data.relationship[Field.IRI])
                    const updatedEdge: Edge = {
                        ...currentEdge, id: edgeID, source: newEntity[Field.IRI], data: newEdgeData
                    }

                    return updatedEdge
                }
                else if (currentEdge.target === oldEntity.iri)
                {
                    const newRelationship: Association = { ...currentEdge.data.relationship, target: newEntity[Field.IRI] }
                    const newEdgeData: EdgeData = { ...currentEdge.data, association: newRelationship }
                    const edgeID = createEdgeUniqueID(currentEdge.source, newEntity[Field.IRI], currentEdge.data.relationship[Field.IRI])
                    const updatedEdge: Edge = {
                        ...currentEdge, id:edgeID, target: newEntity[Field.IRI], data: newEdgeData
                    }

                    console.log(updatedEdge)

                    return updatedEdge
                }
                return currentEdge
            }))
        }

        setNodes((nodes: Node[]) => nodes.map((currentNode : Node) =>
        {
            if (currentNode.id === oldEntity.iri)
            {
                let newAttributes = currentNode.data.attributes

                // For each attribute update their source entity if the iri of the entity changed
                if (oldEntity.iri !== newEntity.iri)
                {                   
                    newAttributes = currentNode.data.attributes.map((attribute: Attribute) =>
                    {
                        return { ...attribute, [Field.SOURCE_CLASS]: newEntity[Field.IRI] }
                    })
                }


                const newData: NodeData = { ...currentNode.data, class: newEntity, attributes: newAttributes }
                const newNode: Node = {...currentNode, id: newEntity[Field.IRI], data: newData}

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
    
    
    const editEdgeRelationship = (newRelationship: Association, oldRelationship : Association): void =>
    {
        // Find the edge to update based on the old ID
        const oldID: string = createEdgeUniqueID(oldRelationship.source, oldRelationship.target, oldRelationship[Field.IRI])

        setEdges((edges) => edges.map((currentEdge : Edge) =>
        {
            if (currentEdge.id === oldID)
            {
                const newData: EdgeData = { ...currentEdge.data, association: newRelationship }
                const newID = createEdgeUniqueID(newRelationship.source, newRelationship.target, newRelationship[Field.IRI])
                
                // TODO: Is the user allowed to change source and target?
                // If the source/target does not exist we need to create a new node
                let newEdge: Edge = {
                    ...currentEdge, id: newID, source: newRelationship.source, target: newRelationship.target, data: newData
                }

                console.log("Edited edge: ", newEdge)

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
            setEditedSuggestedItem({[Field.IRI]: "", [Field.TYPE]: ItemType.CLASS, [Field.NAME]: "", [Field.DESCRIPTION]: "", [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: [], [Field.DATA_TYPE]: "", [Field.SOURCE_CARDINALITY]: "", [Field.TARGET_CARDINALITY]: ""})
            setRegeneratedItem({[Field.IRI]: "", [Field.TYPE]: ItemType.CLASS, [Field.NAME]: "", [Field.DESCRIPTION]: "", [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: [], [Field.DATA_TYPE]: "", [Field.SOURCE_CARDINALITY]: "", [Field.TARGET_CARDINALITY]: ""})
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

    const getSourceEntityFromItem = (item: Item) =>
    {
        if (item[Field.TYPE] === ItemType.CLASS)
        {
            return item[Field.NAME]
        }
        else
        {
            return (item as Association)[Field.SOURCE_CLASS]
        }
    }


    const saveSingleFieldSuggestion = (fieldName: string, fieldText: string, itemType: ItemType, sourceClass: string): void =>
    {
        // Save generated single field to backend

        const currentDomainDescription = getSnapshotDomainDescription(UserChoice.SINGLE_FIELD, domainDescriptionSnapshot)
        const userChoice = itemTypeToUserChoice(itemType)

        const suggestionData = {
            domainDescription: currentDomainDescription, fieldName: fieldName, fieldText: fieldText,
            userChoice: userChoice, sourceClass: sourceClass, isPositive: true
        }

        fetch(SAVE_SUGESTED_SINGLE_FIELD_URL, { method: 'POST', headers: HEADER, body: JSON.stringify(suggestionData)})
    }

    
    const onConfirmRegeneratedText = (field : Field) =>
    {
        let itemType = ItemType.CLASS
        let sourceClass = ""

        setEditedSuggestedItem((editedItem: Item) =>
        {
            // Set type to "any" because Typescript doesn't recognise that we already did the check
            // Otherwise we need to write an if-statement for each field of type Item
            if (regeneratedItem.hasOwnProperty(field))
            {
                itemType = editedItem[Field.TYPE]

                if (itemType === ItemType.CLASS)
                {
                    sourceClass = editedItem[Field.NAME]
                }
                else
                {
                    sourceClass = (editedItem as Attribute)[Field.SOURCE_CLASS]
                }

                return {...editedItem, [field]: (regeneratedItem as any)[field]}
            }
            return editedItem
        })

        saveSingleFieldSuggestion(field, (regeneratedItem as any)[field], itemType, sourceClass)

        onClearRegeneratedItem(field, false)
    }
    

    const onGenerateField = (itemType: ItemType, name: string, sourceEntity: string, targetEntity: string, field: Field) =>
    {
        const currentDomainDescription = isIgnoreDomainDescription ? "" : domainDescription
        snapshotDomainDescription(UserChoice.SINGLE_FIELD, currentDomainDescription, setSnapshotDomainDescription)

        let userChoice = UserChoice.CLASSES

        if (itemType === ItemType.ATTRIBUTE)
        {
            userChoice = UserChoice.ATTRIBUTES 
        }
        else if (itemType === ItemType.ASSOCIATION)
        {
            userChoice = UserChoice.ASSOCIATIONS
        }

        if (userChoice === UserChoice.CLASSES)
        {
            sourceEntity = name
        }

        if (!sourceEntity) { sourceEntity = "" }
        if (!targetEntity) { targetEntity = "" }

        const bodyData = JSON.stringify({
            "name": name, "sourceEntity": sourceEntity, "targetEntity": targetEntity, "field": field, "userChoice": userChoice,
            "domainDescription": currentDomainDescription
        })

        setErrorMessage("")
        setFieldToLoad(fieldsToLoad => [...fieldsToLoad, field])
        fetchStreamedDataGeneral(bodyData, field)
    }

    // TODO: Put this fetch-function into a separate file
    const fetchStreamedDataGeneral = (bodyData: any, field: Field) =>
    {
        fetch(EDIT_ITEM_URL, { method: "POST", headers: HEADER, body: bodyData })
        .then(response =>
        {
            const stream = response.body; // Get the readable stream from the response body

            if (stream === null)
            {
                console.log("Stream is null")
                setFieldToLoad(fields => fields.filter(currentField => currentField !== field))
                return
            }

            const reader = stream.getReader()

            const readChunk = () =>
            {
                reader.read()
                    .then(({value, done}) =>
                    {
                        if (done)
                        {
                            console.log("Stream finished")
                            setFieldToLoad(fields => fields.filter(currentField => currentField !== field))
                            return
                        }

                        onProcessStreamedDataGeneral(value, field)
                        
                        readChunk()
                    })
                    .catch(error =>
                    {
                        console.error(error)
                        setFieldToLoad(fields => fields.filter(currentField => currentField !== field))
                    })
            }
            readChunk() // Start reading the first chunk
        })
        .catch(error =>
        {
            console.error(error)
            const message = "Server is not responding"
            setErrorMessage(message)
            setFieldToLoad(fields => fields.filter(currentField => currentField !== field))
        })
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

        setErrorMessage(_ => "")
    
        if (item.type === ItemType.ATTRIBUTE)
        {
            const oldAttribute = item as Attribute
        
            const relationship : Association = {
                [Field.IRI]: oldAttribute[Field.IRI], [Field.TYPE]: ItemType.ASSOCIATION, [Field.NAME]: changedItemName,
                [Field.DESCRIPTION]: oldAttribute[Field.DESCRIPTION], [Field.ORIGINAL_TEXT]: oldAttribute[Field.ORIGINAL_TEXT],
                [Field.ORIGINAL_TEXT_INDEXES]: oldAttribute[Field.ORIGINAL_TEXT_INDEXES],
                [Field.SOURCE_CLASS]: oldAttribute[Field.SOURCE_CLASS], [Field.TARGET_CLASS]: oldAttribute[Field.IRI],
                [Field.SOURCE_CARDINALITY]: "", [Field.TARGET_CARDINALITY]: ""
            }
        
            setChangedItemName("")
            setChangedDataType(oldAttribute[Field.DATA_TYPE])
            setSelectedSuggestedItem(relationship)
            setEditedSuggestedItem(relationship)
        }
        else
        {
            const oldRelationship = item as Association
            setChangedItemName(oldRelationship[Field.NAME])
            const newTarget = createNameFromIRI(oldRelationship.target)

            const attribute : Attribute = {
                [Field.IRI]: oldRelationship[Field.IRI], [Field.TYPE]: ItemType.ATTRIBUTE, [Field.NAME]: newTarget, [Field.DESCRIPTION]: oldRelationship.description,
                [Field.DATA_TYPE]: changedDataType, [Field.ORIGINAL_TEXT]: oldRelationship.originalText, [Field.ORIGINAL_TEXT_INDEXES]: oldRelationship.originalTextIndexes,
                [Field.SOURCE_CARDINALITY]: "", [Field.SOURCE_CLASS]: oldRelationship.source
            }
        
            setSelectedSuggestedItem(attribute)
            setEditedSuggestedItem(attribute)
        }
    }
    

    const onRemove = (item: Item): void =>
    {
        if (item.type === ItemType.CLASS)
        {
            const nodeID = item.name
            removeNode(nodeID)
        }
        else if (item.type === ItemType.ATTRIBUTE)
        {
            removeNodeAttribute(item as Attribute)
        }
        else if (item.type === ItemType.ASSOCIATION)
        {
            const relationship: Association = (item as Association)
            const edgeID = createEdgeUniqueID(relationship.source, relationship.target, relationship.name)
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

    return { onSave, onClose, onGenerateField, onRemove, onItemEdit, onConfirmRegeneratedText, onChangeItemType, onClearRegeneratedItem }
}

export default useEditItemDialog