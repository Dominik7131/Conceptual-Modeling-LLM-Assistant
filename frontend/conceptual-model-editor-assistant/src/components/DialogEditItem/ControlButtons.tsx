import { Button } from "@mui/material";
import { Association, Attribute, Field, Item, ItemType } from "../../interfaces"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { edgesState, editDialogErrorMsgState, editedSuggestedItemState, isItemInConceptualModelState, isShowEditDialogState, isSuggestedItemState, nodesState, regeneratedItemState, selectedSuggestedItemState } from "../../atoms";
import { createNameFromIRI, onAddItem, onRemove } from '../../utils/conceptualModel';
import { createErrorMessage } from "../../utils/utility";
import { onClose, onSave } from "../../utils/editItem";
import { useState } from "react";


const ControlButtons: React.FC = () =>
{
    const setNodes = useSetRecoilState(nodesState)
    const setEdges = useSetRecoilState(edgesState)

    const [changedItemName, setChangedItemName] = useState("")
    const [changedDataType, setChangedDataType] = useState("")
    
    const [item, setItem] = useRecoilState(selectedSuggestedItemState)
    const [editedItem, setEditedItem] = useRecoilState(editedSuggestedItemState)

    const setIsOpened = useSetRecoilState(isShowEditDialogState)

    const setRegeneratedItem = useSetRecoilState(editedSuggestedItemState)

    const setEditedSuggestedItem = useSetRecoilState(editedSuggestedItemState)

    const isItemInConceptualModel = useRecoilValue(isItemInConceptualModelState)
    const isSuggestedItem = useRecoilValue(isSuggestedItemState)
    const setErrorMessage = useSetRecoilState(editDialogErrorMsgState)


    const isAttribute = item.type === ItemType.ATTRIBUTE
    const isAssociation = item.type === ItemType.ASSOCIATION
    
    const isDisableSave = !isItemInConceptualModel
    const isDisableChange = !isSuggestedItem


    const handleAddItem = (item: Item): void =>
    {
        if (item[Field.NAME] === "")
        {
            const message = "Name cannot be empty"
            setErrorMessage(_ => message)
            return
        }

        const isOperationSuccessful = onAddItem(item, setNodes, setEdges)

        if (isOperationSuccessful)
        {
            onClose(setIsOpened, setErrorMessage, setEditedItem, setRegeneratedItem)
            return
        }

        createErrorMessage(item, setErrorMessage)
    }


    const handleClose = (): void =>
    {
        onClose(setIsOpened, setErrorMessage, setEditedItem, setRegeneratedItem)
    }


    const onChangeItemType = (item: Item): void =>
    {
        // If the item is attribute then transform it into association
        // Otherwise transform association into attribute

        setErrorMessage(_ => "")
    
        if (item.type === ItemType.ATTRIBUTE)
        {
            const oldAttribute = item as Attribute
        
            const association : Association = {
                [Field.IRI]: oldAttribute[Field.IRI], [Field.TYPE]: ItemType.ASSOCIATION, [Field.NAME]: changedItemName,
                [Field.DESCRIPTION]: oldAttribute[Field.DESCRIPTION], [Field.ORIGINAL_TEXT]: oldAttribute[Field.ORIGINAL_TEXT],
                [Field.ORIGINAL_TEXT_INDEXES]: oldAttribute[Field.ORIGINAL_TEXT_INDEXES],
                [Field.SOURCE_CLASS]: oldAttribute[Field.SOURCE_CLASS], [Field.TARGET_CLASS]: oldAttribute[Field.IRI],
                [Field.SOURCE_CARDINALITY]: "", [Field.TARGET_CARDINALITY]: ""
            }
        
            setChangedItemName("")
            setChangedDataType(oldAttribute[Field.DATA_TYPE])
            setItem(association)
            setEditedSuggestedItem(association)
        }
        else
        {
            const oldAssociation = item as Association
            setChangedItemName(oldAssociation[Field.NAME])
            const newTarget = createNameFromIRI(oldAssociation.target)

            const attribute : Attribute = {
                [Field.IRI]: oldAssociation[Field.IRI], [Field.TYPE]: ItemType.ATTRIBUTE, [Field.NAME]: newTarget, [Field.DESCRIPTION]: oldAssociation[Field.DESCRIPTION],
                [Field.DATA_TYPE]: changedDataType, [Field.ORIGINAL_TEXT]: oldAssociation[Field.ORIGINAL_TEXT], [Field.ORIGINAL_TEXT_INDEXES]: oldAssociation[Field.ORIGINAL_TEXT_INDEXES],
                [Field.SOURCE_CARDINALITY]: "", [Field.SOURCE_CLASS]: oldAssociation[Field.SOURCE_CLASS]
            }
        
            setItem(attribute)
            setEditedSuggestedItem(attribute)
        }
    }


    return (
        <>
            {
                isItemInConceptualModel ?
                <Button
                    variant="contained"
                    color="error"
                    sx={{ textTransform: "none" }}
                    onClick={() => { onRemove(item, setNodes, setEdges); handleClose() }}>
                        Remove
                </Button>
                :
                <Button
                    variant="contained"
                    color="success"
                    sx={{ textTransform: "none" }}
                    onClick={() => { handleAddItem(editedItem) }}>
                        Add
                </Button>

            }
            

            {
                isSuggestedItem && !isDisableChange && isAttribute &&
                    <Button
                        variant="contained"
                        sx={{ textTransform: "none" }}
                        onClick={ () => onChangeItemType(item)}>
                        Change to association
                    </Button>
            }

            {
                isSuggestedItem && !isDisableChange && isAssociation &&
                    <Button
                        variant="contained"
                        sx={{ textTransform: "none" }}
                        onClick={ () => onChangeItemType(item)}>
                        Change to attribute
                    </Button>
            }
            
            { !isDisableSave &&
                <Button
                    variant="contained"
                    color="success"
                    sx={{ textTransform: "none" }}
                    onClick={() => { onSave(editedItem, item, setIsOpened, setErrorMessage, setNodes, setEdges) }}>
                    Save
                </Button>
            }

            <Button
                variant="contained"
                sx={{ textTransform: "none" }}
                onClick={() => handleClose() }>
                Cancel
            </Button>
        </>
    )
}
    
export default ControlButtons