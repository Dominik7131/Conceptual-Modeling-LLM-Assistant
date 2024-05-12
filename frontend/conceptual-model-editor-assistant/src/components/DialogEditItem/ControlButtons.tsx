import { Button } from "@mui/material";
import { Item, ItemType } from "../../interfaces"
import { useRecoilValue, useSetRecoilState } from "recoil";
import { edgesState, editDialogErrorMsgState, editedSuggestedItemState, isItemInConceptualModelState, isSuggestedItemState, nodesState, regeneratedItemState, selectedSuggestedItemState } from "../../atoms";
import { onAddItem } from '../../utils/conceptualModel';
import { createErrorMessage } from "../../utils/utility";
import useEditItemDialog from "../../hooks/useEditItemDialog";


const ControlButtons: React.FC = () =>
{
    const setNodes = useSetRecoilState(nodesState)
    const setEdges = useSetRecoilState(edgesState)
    
    const item = useRecoilValue(selectedSuggestedItemState)
    const editedItem = useRecoilValue(editedSuggestedItemState)

    const isItemInConceptualModel = useRecoilValue(isItemInConceptualModelState)
    const isSuggestedItem = useRecoilValue(isSuggestedItemState)
    const setErrorMessage = useSetRecoilState(editDialogErrorMsgState)


    const isAttribute = item.type === ItemType.ATTRIBUTE
    const isAssociation = item.type === ItemType.ASSOCIATION
    
    const isDisableSave = !isItemInConceptualModel
    const isDisableChange = !isSuggestedItem

    const { onSave, onClose, onRemove, onChangeItemType } = useEditItemDialog()


    const handleAddItem = (item: Item): void =>
    {
        if (item.name === "")
        {
            const message = "Name cannot be empty"
            setErrorMessage(_ => message)
            return
        }

        const isOperationSuccessful = onAddItem(item, setNodes, setEdges)

        if (isOperationSuccessful)
        {
            onClose()
            return
        }

        createErrorMessage(item, setErrorMessage)
    }


    return (
        <>
            {
                isItemInConceptualModel ?
                <Button
                    variant="contained"
                    color="error"
                    sx={{ textTransform: "none" }}
                    onClick={() => { onRemove(item); onClose()}}>
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
                        Change to relationship
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
                    onClick={() => {onSave(editedItem, item)}}>
                    Save
                </Button>
            }

            <Button
                variant="contained"
                sx={{ textTransform: "none" }}
                onClick={() => onClose()}>
                Cancel
            </Button>
        </>
    )
}
    
export default ControlButtons