import { Button, ButtonGroup } from "@mui/material"
import HighlightSingleItemButton from "./HighlightSingleItemButton"
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import useConceptualModel from "../../hooks/useConceptualModel";
import { Attribute, Field, Item, ItemType, Relationship } from "../../interfaces";
import SaveToDiskButton from "./SaveToDiskButton";
import { edgesState, editedSuggestedItemState, isDisableChangeState, isDisableSaveState, isShowEditDialogState, isSuggestedItemState, nodesState, selectedSuggestedItemState, sidebarErrorMsgState } from "../../atoms";
import { useSetRecoilState } from "recoil";
import { createErrorMessage, onAddItem } from "../../hooks/useUtility";


interface Props
{
    item: Item
}

const ControlButtons: React.FC<Props> = ({ item }): JSX.Element =>
{
    const setNodes = useSetRecoilState(nodesState)
    const setEdges = useSetRecoilState(edgesState)

    const setErrorMessage = useSetRecoilState(sidebarErrorMsgState)
    const setSelectedSuggestedItem = useSetRecoilState(selectedSuggestedItemState)
    const setEditedSuggestedItem = useSetRecoilState(editedSuggestedItemState)
    const setIsSuggestedItem = useSetRecoilState(isSuggestedItemState)
    const setIsDisableSave = useSetRecoilState(isDisableSaveState)
    const setIsDisableChange = useSetRecoilState(isDisableChangeState)
    const setIsShowEditDialog = useSetRecoilState(isShowEditDialogState)


    const handleAddItem = (): void =>
    {
        setErrorMessage("")

        if (item.name === "")
        {
            const message = "Name cannot be empty"
            setErrorMessage(_ => message)
            return
        }

        const isOperationSuccessful = onAddItem(item, setNodes, setEdges)

        if (isOperationSuccessful)
        {
            return
        }

        createErrorMessage(item, setErrorMessage)
    }


    const handleEditSuggestedItem = (): void =>
    {
        setSelectedSuggestedItem(item)
        setEditedSuggestedItem(item)
        setIsSuggestedItem(true)
        setIsDisableSave(true)
        setIsDisableChange(false)
        setIsShowEditDialog(true)
    }

    
    return (
        <ButtonGroup fullWidth sx={{ marginTop: 1, minWidth: "320px" }} variant="outlined" size="small">

            <Button
                color="secondary"
                startIcon={<AddIcon/>}
                sx={{ textTransform: "none" }}
                onClick={ handleAddItem }>
                    Add
            </Button>

            <Button
                color="secondary"
                startIcon={<EditIcon/>}
                sx={{ textTransform: "none" }}
                onClick={ handleEditSuggestedItem }>
                    Edit
            </Button>

            <HighlightSingleItemButton item={item}/>

            <SaveToDiskButton item={item}/>


        </ButtonGroup>
    )
}

export default ControlButtons