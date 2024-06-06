import { Button, ButtonGroup, Tooltip } from "@mui/material"
import HighlightSingleItemButton from "./HighlightSingleItemButton"
import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import { useRecoilValue, useSetRecoilState } from "recoil"
import ThumbUpIcon from "@mui/icons-material/ThumbUp"
import ThumbDownIcon from "@mui/icons-material/ThumbDown"
import { useState } from "react"
import { HEADER, SAVE_SUGESTED_ITEM_URL } from "../../definitions/urls"
import { createErrorMessage, onAddItem } from "../../utils/conceptualModel"
import { getSnapshotDomainDescription, getSnapshotTextFilteringVariation } from "../../utils/snapshot"
import { SuggestedItemUserEvaluationBody } from "../../definitions/fetch"
import { nodesState, edgesState, isItemInConceptualModelState } from "../../atoms/conceptualModel"
import { isShowEditDialogState } from "../../atoms/dialogs"
import { sidebarErrorMsgState } from "../../atoms/sidebar"
import { domainDescriptionSnapshotsState, textFilteringVariationSnapshotsState } from "../../atoms/snapshots"
import { selectedSuggestedItemState, editedSuggestedItemState, isSuggestedItemState } from "../../atoms/suggestions"
import { Item } from "../../definitions/conceptualModel"
import { Field, SIDEBAR_BUTTON_COLOR, SIDEBAR_BUTTON_SIZE, TOOLTIP_ENTER_DELAY_MS, TOOLTIP_LEAVE_DELAY_MS } from "../../definitions/utility"
import { itemTypeToUserChoice } from "../../utils/utility"


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

    const domainDescriptionSnapshot = useRecoilValue(domainDescriptionSnapshotsState)
    const textFilteringVariationSnapshot = useRecoilValue(textFilteringVariationSnapshotsState)

    const [isClicked, setIsClicked] = useState(false)

    const textTransform = "none"


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


    const handleSaveSuggestion = (isPositiveReaction: boolean) =>
    {
        const userChoice = itemTypeToUserChoice(item[Field.TYPE])
        const currentDomainDescription = getSnapshotDomainDescription(userChoice, domainDescriptionSnapshot)
        const currentTextFilteringVariation = getSnapshotTextFilteringVariation(userChoice, textFilteringVariationSnapshot)

        const suggestionData: SuggestedItemUserEvaluationBody = {
            domainDescription: currentDomainDescription, isPositive: isPositiveReaction, item: item, userChoice: userChoice,
            textFilteringVariation: currentTextFilteringVariation
        }

        const bodyDataJSON = JSON.stringify(suggestionData)

        fetch(SAVE_SUGESTED_ITEM_URL, { method: "POST", headers: HEADER, body: bodyDataJSON })

        setIsClicked(true)
    }

    
    return (
        <ButtonGroup
            variant="outlined"
            color={ SIDEBAR_BUTTON_COLOR }
            fullWidth
            size="small"
            sx={{ marginTop: "15px" }}>

            <Tooltip title="Like" enterDelay={TOOLTIP_ENTER_DELAY_MS} leaveDelay={TOOLTIP_LEAVE_DELAY_MS}>
                <Button
                    size={ SIDEBAR_BUTTON_SIZE }
                    sx={{ textTransform: textTransform }}
                    disabled={isClicked}
                    onClick={ () => { handleSaveSuggestion(true) } }
                    >
                        <ThumbUpIcon/>
                </Button>
            </Tooltip>

            <Tooltip title="Add" enterDelay={TOOLTIP_ENTER_DELAY_MS} leaveDelay={TOOLTIP_LEAVE_DELAY_MS}>
                <Button
                    size={ SIDEBAR_BUTTON_SIZE }
                    sx={{ textTransform: textTransform }}
                    onClick={ handleAddItem }
                    >
                        <AddIcon/>
                </Button>
            </Tooltip>
            

            <Tooltip title="Edit" enterDelay={TOOLTIP_ENTER_DELAY_MS} leaveDelay={TOOLTIP_LEAVE_DELAY_MS}>
                <Button
                    size="small"
                    sx={{ textTransform: textTransform }}
                    onClick={ handleEditSuggestedItem }
                    >
                        <EditIcon/>
                </Button>
            </Tooltip>


            <HighlightSingleItemButton item={item} tooltipEnterDelay={TOOLTIP_ENTER_DELAY_MS} tooltipLeaveDelay={TOOLTIP_LEAVE_DELAY_MS} textTransform={textTransform}/>

            <Tooltip title="Dislike" enterDelay={TOOLTIP_ENTER_DELAY_MS} leaveDelay={TOOLTIP_LEAVE_DELAY_MS}>
                <Button
                    size={ SIDEBAR_BUTTON_SIZE }
                    sx={{ textTransform: textTransform }}
                    disabled={isClicked}
                    onClick={ () => { handleSaveSuggestion(false) } }
                    >
                    <ThumbDownIcon/>
                </Button>
            </Tooltip>

        </ButtonGroup>
    )
}

export default ControlButtons