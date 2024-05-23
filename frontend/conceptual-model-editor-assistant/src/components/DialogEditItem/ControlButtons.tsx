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

    const [changedDataType, setChangedDataType] = useState("")
    
    const [item, setItem] = useRecoilState(selectedSuggestedItemState)
    const editedItem = useRecoilValue(editedSuggestedItemState)

    const setIsOpened = useSetRecoilState(isShowEditDialogState)

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
        // Let only generalizations to have an empty name
        const isGeneralization = item[Field.TYPE] === ItemType.GENERALIZATION
        if (item[Field.NAME] === "" && !isGeneralization)
        {
            const message = "Name cannot be empty"
            setErrorMessage(_ => message)
            return
        }

        const isOperationSuccessful = onAddItem(item, setNodes, setEdges)

        if (isOperationSuccessful)
        {
            onClose(setIsOpened, setErrorMessage)
            return
        }

        createErrorMessage(item, setErrorMessage)
    }


    const handleClose = (): void =>
    {
        onClose(setIsOpened, setErrorMessage)
    }


    const changeAttributeToAssociation = (attribute: Attribute): Association =>
    {
        const oldAttribute = item as Attribute
        
        const association : Association = {
            [Field.IRI]: oldAttribute[Field.IRI], [Field.TYPE]: ItemType.ASSOCIATION, [Field.NAME]: oldAttribute[Field.NAME],
            [Field.DESCRIPTION]: oldAttribute[Field.DESCRIPTION], [Field.ORIGINAL_TEXT]: oldAttribute[Field.ORIGINAL_TEXT],
            [Field.ORIGINAL_TEXT_INDEXES]: oldAttribute[Field.ORIGINAL_TEXT_INDEXES],
            [Field.SOURCE_CLASS]: oldAttribute[Field.SOURCE_CLASS], [Field.TARGET_CLASS]: oldAttribute[Field.IRI],
            [Field.SOURCE_CARDINALITY]: "", [Field.TARGET_CARDINALITY]: ""
        }

        setChangedDataType(oldAttribute[Field.DATA_TYPE])
        setItem(association)
        setEditedSuggestedItem(association)

        return association
    }


    const changeAssociationToAttribute = (association: Association): Attribute =>
    {
        const attributeName = createNameFromIRI(association[Field.TARGET_CLASS])

        const attribute : Attribute = {
            [Field.IRI]: association[Field.TARGET_CLASS], [Field.TYPE]: ItemType.ATTRIBUTE, [Field.NAME]: attributeName, [Field.DESCRIPTION]: association[Field.DESCRIPTION],
            [Field.DATA_TYPE]: changedDataType, [Field.ORIGINAL_TEXT]: association[Field.ORIGINAL_TEXT], [Field.ORIGINAL_TEXT_INDEXES]: association[Field.ORIGINAL_TEXT_INDEXES],
            [Field.SOURCE_CARDINALITY]: "", [Field.SOURCE_CLASS]: association[Field.SOURCE_CLASS]
        }

        setItem(attribute)
        setEditedSuggestedItem(attribute)

        return attribute
    }


    const onChangeItemType = (item: Item): void =>
    {
        // If the item is attribute then transform it into association
        // Otherwise transform association into attribute

        setErrorMessage(_ => "")
    
        if (item.type === ItemType.ATTRIBUTE)
        {
            changeAttributeToAssociation(item as Attribute)
        }
        else
        {
            changeAssociationToAttribute(item as Association)
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