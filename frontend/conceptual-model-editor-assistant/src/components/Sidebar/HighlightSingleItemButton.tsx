import { Button, IconButton, Tooltip } from "@mui/material"
import HighlightIcon from '@mui/icons-material/Highlight';
import { isShowHighlightDialogState, isShowTitleDialogDomainDescriptionState, originalTextIndexesListState, selectedSuggestedItemState, tooltipsState } from "../../atoms";
import { useSetRecoilState } from "recoil";
import { Attribute, Field, Item, ItemType, Association } from "../../interfaces";
import { capitalizeString } from "../../utils/utility";
import { useState } from "react";
import { SIDEBAR_BUTTON_SIZE } from "../../utils/urls";


interface Props
{
    item: Item
}

const HighlightSingleItemButton: React.FC<Props> = ({ item }): JSX.Element =>
{
    const isDisabled = !item.hasOwnProperty(Field.ORIGINAL_TEXT_INDEXES)
    const setSelectedSuggestedItem = useSetRecoilState(selectedSuggestedItemState)
    const setIsShowHighlightDialog = useSetRecoilState(isShowHighlightDialogState)
    const setOriginalTextIndexesList = useSetRecoilState(originalTextIndexesListState)
    const setTooltips = useSetRecoilState(tooltipsState)
    const setIsShowTitleDialogDomainDescription = useSetRecoilState(isShowTitleDialogDomainDescriptionState)


    const onHighlightSingleItem = () =>
    {
        if (!item.hasOwnProperty(Field.ORIGINAL_TEXT_INDEXES))
        {
            item = { ...item, [Field.ORIGINAL_TEXT_INDEXES]: [] }
        }

        setIsShowTitleDialogDomainDescription(true)
        setIsShowHighlightDialog(_ => true)
        setSelectedSuggestedItem(_ => item)
        setOriginalTextIndexesList(_ => item[Field.ORIGINAL_TEXT_INDEXES])
    
        // Create tooltips for highlighted original text
        let tooltip = ""
        const capitalizedSourceEntity: string = capitalizeString((item as Attribute).source)
    
        if (item.type === ItemType.CLASS)
        {
            tooltip = `Entity: ${item.name}`
        }
        else if (item.type === ItemType.ATTRIBUTE)
        {
            tooltip = `${capitalizedSourceEntity}: ${item.name}`
        }
        else if (item.type === ItemType.ASSOCIATION)
        {
            tooltip = `${capitalizedSourceEntity} - ${item.name} - ${(item as Association).target}`
        }
    
        let newTooltips : string[] = Array(item.originalTextIndexes.length).fill(tooltip)
        setTooltips(_ => newTooltips)
    }

    return (
        <Tooltip
            title="Highlight in domain description"
            enterDelay={500}
            leaveDelay={200}>

            <Button
                disabled={isDisabled}
                size={ SIDEBAR_BUTTON_SIZE }
                sx={{ textTransform: "none" }}
                onClick={() => onHighlightSingleItem()}>
                    <HighlightIcon/>
            </Button>
        </Tooltip>
    )
}

export default HighlightSingleItemButton