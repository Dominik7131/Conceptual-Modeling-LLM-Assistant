import { Node, Edge } from "reactflow"
import { Association, Attribute, Class, Field, Item, ItemType } from "../interfaces"
import { SetterOrUpdater } from "recoil"
import { createIRIFromName, editEdgeAssociation, editNodeAttribute, editNodeClass } from "./conceptualModel"


export const onClose = (setIsOpened: SetterOrUpdater<boolean>, setErrorMessage: SetterOrUpdater<string>, setEditedItem: SetterOrUpdater<Item>, setRegeneratedItem: SetterOrUpdater<Item>): void =>
{
    onClearRegeneratedItem(null, true, setEditedItem, setRegeneratedItem)
    setIsOpened(_ => false)
    setErrorMessage(_ => "")
}


export const onClearRegeneratedItem = (field: Field | null, isClearAll: boolean, setEditedItem: SetterOrUpdater<Item>, setRegeneratedItem: SetterOrUpdater<Item>) : void =>
{
    if (isClearAll)
    {
        setEditedItem({[Field.IRI]: "", [Field.TYPE]: ItemType.CLASS, [Field.NAME]: "", [Field.DESCRIPTION]: "", [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: [], [Field.DATA_TYPE]: "", [Field.SOURCE_CARDINALITY]: "", [Field.TARGET_CARDINALITY]: ""})
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


export const onItemEdit = (field: Field, newValue: string, setEditedItem: SetterOrUpdater<Item>) : void =>
{
    setEditedItem((previousItem: Item) =>
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


export const onSave = (newItem: Item, oldItem: Item, setIsOpened: SetterOrUpdater<boolean>, setErrorMessage: SetterOrUpdater<string>, setNodes: SetterOrUpdater<Node[]>, setEdges: SetterOrUpdater<Edge[]>): void =>
{
    if (!newItem.name)
    {
        setErrorMessage(_ => "Name cannot be empty")
        return
    }

    setIsOpened(_ => false)

    if (newItem.type === ItemType.CLASS)
    {
        editNodeClass(newItem as Class, oldItem as Class, setNodes, setEdges)
    }
    else if (newItem.type === ItemType.ATTRIBUTE)
    {
        editNodeAttribute(newItem as Attribute, oldItem as Attribute, setNodes)
    }
    else if (newItem.type === ItemType.ASSOCIATION)
    {
        editEdgeAssociation(newItem as Association, oldItem as Association, setEdges)
    }
    else
    {
        alert("Unknown action")
    }
}