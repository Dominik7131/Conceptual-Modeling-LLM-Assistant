import { Button, ButtonGroup, IconButton, Stack, Tooltip } from "@mui/material"
import HighlightSingleItemButton from "./HighlightSingleItemButton"
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { Attribute, Field, Item, ItemType, Relationship } from "../../interfaces";
import { domainDescriptionState, edgesState, editedSuggestedItemState, isIgnoreDomainDescriptionState, isItemInConceptualModelState, isShowEditDialogState, isSuggestedItemState, nodesState, selectedSuggestedItemState, sidebarErrorMsgState } from "../../atoms";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { HEADER, SAVE_SUGESTION_URL, SIDEBAR_BUTTON_COLOR, SIDEBAR_BUTTON_SIZE, createErrorMessage, onAddItem } from "../../hooks/useUtility";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { useState } from "react";


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
    const setIsItemInConceptualModel = useSetRecoilState(isItemInConceptualModelState)
    const setIsShowEditDialog = useSetRecoilState(isShowEditDialogState)

    const domainDescription = useRecoilValue(domainDescriptionState)
    const isIgnoreDomainDescription = useRecoilValue(isIgnoreDomainDescriptionState)

    const [isClicked, setIsClicked] = useState(false)


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
        setIsItemInConceptualModel(false)
        setIsShowEditDialog(true)
    }

    const handleSendReaction = (isPositiveReaction: boolean) =>
    {
        const currentDomainDescription = isIgnoreDomainDescription ? "" : domainDescription
        const suggestionData = { domainDescription: currentDomainDescription, isPositive: isPositiveReaction, item: item }

        fetch(SAVE_SUGESTION_URL, { method: 'POST', headers: HEADER, body: JSON.stringify(suggestionData)})

        setIsClicked(true)
    }

    
    return (

        // <Stack direction="row" spacing="30px" marginTop="10px" sx={{ display: 'flex', justifyContent:"left" }}>
        <ButtonGroup
            variant="outlined"
            color={ SIDEBAR_BUTTON_COLOR }
            fullWidth
            size="small"
            sx={{ marginTop: "15px" }}>

            <Tooltip
                title="Add"
                enterDelay={500}
                leaveDelay={200}
                >
                <Button
                    color={ SIDEBAR_BUTTON_COLOR }
                    size={ SIDEBAR_BUTTON_SIZE }
                    sx={{ textTransform: "none" }}
                    onClick={ handleAddItem }
                    >
                        <AddIcon/>
                </Button>
            </Tooltip>
            

            <Tooltip
                title="Edit"
                enterDelay={500}
                leaveDelay={200}
                >
                <Button
                    color={ SIDEBAR_BUTTON_COLOR }
                    size="small"
                    sx={{ textTransform: "none" }}
                    onClick={ handleEditSuggestedItem }
                    >
                        <EditIcon/>
                </Button>
            </Tooltip>


            <HighlightSingleItemButton item={item}/>

            <Tooltip
                title="Like"
                enterDelay={500}
                leaveDelay={200}>

                <Button
                    color={ SIDEBAR_BUTTON_COLOR }
                    size={ SIDEBAR_BUTTON_SIZE }
                    sx={{ textTransform: "none" }}
                    disabled={isClicked}
                    onClick={ () => { handleSendReaction(true) } }
                    >
                        <ThumbUpIcon/>
                </Button>
            </Tooltip>

            <Tooltip
                title="Dislike"
                enterDelay={500}
                leaveDelay={200}>

                <Button
                    color={ SIDEBAR_BUTTON_COLOR }
                    size={ SIDEBAR_BUTTON_SIZE }
                    sx={{ textTransform: "none" }}
                    disabled={isClicked}
                    onClick={ () => { handleSendReaction(false) } }
                    >
                    <ThumbDownIcon/>
                </Button>
            </Tooltip>

        </ButtonGroup>
    )
}

export default ControlButtons