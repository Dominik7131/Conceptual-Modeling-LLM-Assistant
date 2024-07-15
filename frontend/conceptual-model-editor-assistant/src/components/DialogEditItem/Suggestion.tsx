import AutoFixNormalIcon from "@mui/icons-material/AutoFixNormal"
import { Button, CircularProgress, IconButton, Stack, Tooltip } from "@mui/material"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import useGenerateSingleField from "../../hooks/useGenerateSingleField"
import CheckIcon from "@mui/icons-material/Check"
import CloseIcon from "@mui/icons-material/Close"
import useConfirmRegeneratedField from "../../hooks/useConfirmRegeneratedField"
import { onClearRegeneratedItem } from "../../utils/editItem"
import { useEffect, useState } from "react"
import { fieldToLoadState, regeneratedItemState } from "../../atoms/suggestions"
import { Item, Association, Attribute } from "../../definitions/conceptualModel"
import { Field, ItemType, TOOLTIP_ENTER_DELAY_MS, TOOLTIP_LEAVE_DELAY_MS } from "../../definitions/utility"
import { createNameFromIRI } from "../../utils/conceptualModel"
import ThumbUpIcon from "@mui/icons-material/ThumbUp"
import ThumbDownIcon from "@mui/icons-material/ThumbDown"


interface Props
{
    item: Item
    field: Field
    isRegeneratedText: boolean
    isDisabledFieldSuggestion: boolean
}


const Suggestion: React.FC<Props> = ({ item, field, isRegeneratedText, isDisabledFieldSuggestion }) =>
{
    const fieldToLoad = useRecoilValue(fieldToLoadState)
    const [regeneratedItem, setRegeneratedItem] = useRecoilState(regeneratedItemState)
    const [isReactionButtonClicked, setIsReactionButtonClicked] = useState(false)
    
    const { onGenerateField } = useGenerateSingleField()
    const { onConfirmRegeneratedText, saveSingleFieldSuggestion } = useConfirmRegeneratedField()


    const handleGenerateField = (): void =>
    {
        let sourceClass = (item as Association)[Field.SOURCE_CLASS]

        if (item[Field.TYPE] === ItemType.CLASS)
        {
            sourceClass = item[Field.IRI]
        }

        if (sourceClass)
        {
            sourceClass = createNameFromIRI(sourceClass)
        }

        let targetClass = (item as Association)[Field.TARGET_CLASS]

        if (targetClass)
        {
            targetClass = createNameFromIRI(targetClass)
        }

        sourceClass = sourceClass ?? ""
        targetClass = targetClass ?? ""

        const description = item[Field.DESCRIPTION] ?? ""
        const originalText = item[Field.ORIGINAL_TEXT] ?? ""

        onGenerateField(item[Field.TYPE], item[Field.NAME], description, originalText, sourceClass, targetClass, field)
    }


    const handleSuggestionConfirmation = (): void =>
    {
        setIsReactionButtonClicked(false)
        onConfirmRegeneratedText(field)
    }


    const handleSuggestionRejection = (): void =>
    {
        setIsReactionButtonClicked(false)
        onClearRegeneratedItem(field, setRegeneratedItem)
    }


    const handleSaveSuggestion = (isPositive: boolean): void =>
    {
        setIsReactionButtonClicked(true)

        const itemType = item[Field.TYPE]
        let sourceClass = ""

        if (itemType === ItemType.CLASS)
        {
            sourceClass = item[Field.NAME]
        }
        else
        {
            sourceClass = (item as Attribute)[Field.SOURCE_CLASS]
        }

        saveSingleFieldSuggestion(field, regeneratedItem[field as keyof Item] as string, itemType, sourceClass, isPositive)
    }


    // Clear the generated suggestion when the component is unmounted
    useEffect(() =>
    {
        return () => { onClearRegeneratedItem(field, setRegeneratedItem) }
    }, [field, setRegeneratedItem])


    const reactionIconsColor = "inherit"
    const reactionIconsSize = "20px"
    const reactionButtonsMinSize = "20px"
    const tooltipPlacement = "top"

    // Let user confirm or reject given suggestion
    if (isRegeneratedText)
    {
        return (
            <Stack direction="row">

                <Tooltip title="Like" enterDelay={TOOLTIP_ENTER_DELAY_MS} leaveDelay={TOOLTIP_LEAVE_DELAY_MS} placement={tooltipPlacement}>
                    <IconButton
                        size={ "small" }
                        color={ reactionIconsColor }
                        sx={{ minWidth: reactionButtonsMinSize, minHeight: reactionButtonsMinSize }}
                        disabled={ isReactionButtonClicked }
                        onClick={ () => { handleSaveSuggestion(true) } }
                        >
                            <ThumbUpIcon sx={{ width: reactionIconsSize, height: reactionIconsSize }}/>
                    </IconButton>
                </Tooltip>

                <Tooltip title="Confirm" enterDelay={TOOLTIP_ENTER_DELAY_MS} leaveDelay={TOOLTIP_LEAVE_DELAY_MS} placement={tooltipPlacement}>
                    <IconButton onClick={ handleSuggestionConfirmation }>
                        <CheckIcon color="success"/>
                    </IconButton>
                </Tooltip>

                <Tooltip title="Reject" enterDelay={TOOLTIP_ENTER_DELAY_MS} leaveDelay={TOOLTIP_LEAVE_DELAY_MS} placement={tooltipPlacement}>
                    <IconButton onClick={ handleSuggestionRejection }>
                        <CloseIcon color="error"/>
                    </IconButton>
                </Tooltip>

                <Tooltip title="Dislike" enterDelay={TOOLTIP_ENTER_DELAY_MS} leaveDelay={TOOLTIP_LEAVE_DELAY_MS} placement={tooltipPlacement}>
                    <IconButton
                        color={ reactionIconsColor }
                        size={ "small" }
                        sx={{ minWidth: reactionButtonsMinSize, minHeight: reactionButtonsMinSize }}
                        disabled={ isReactionButtonClicked }
                        onClick={ () => { handleSaveSuggestion(false) } }
                        >
                            <ThumbDownIcon sx={{ width: reactionIconsSize, height: reactionIconsSize }}/>
                    </IconButton>
                </Tooltip>

            </Stack>
        )
    }


    const isShowLoadingIndicator = fieldToLoad.includes(field)
    if (isShowLoadingIndicator)
    {
        return (
            <CircularProgress sx={{ position: "relative", right: "3px", top: "5px" }} size={ "30px" } />
        )
    }


    // Show icon for generating new suggestion
    return (
        <IconButton
            disabled={isDisabledFieldSuggestion}
            color="primary"
            size="small"
            onClick={ handleGenerateField }>
                <AutoFixNormalIcon/>
        </IconButton>
    )
}

export default Suggestion