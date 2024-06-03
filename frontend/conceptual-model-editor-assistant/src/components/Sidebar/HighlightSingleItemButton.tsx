import { Button, Tooltip } from "@mui/material"
import HighlightIcon from "@mui/icons-material/Highlight"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { SIDEBAR_BUTTON_SIZE } from "../../definitions/urls"
import { createNameFromIRI } from "../../utils/conceptualModel"
import { isShowHighlightDialogState, isShowTitleDialogDomainDescriptionState } from "../../atoms/dialogs"
import { domainDescriptionState, isIgnoreDomainDescriptionState } from "../../atoms/domainDescription"
import { originalTextIndexesListState, tooltipsState } from "../../atoms/originalTextIndexes"
import { selectedSuggestedItemState } from "../../atoms/suggestions"
import { Item, Attribute, Association } from "../../definitions/conceptualModel"
import { Field, ItemType } from "../../definitions/utility"


interface Props
{
    item: Item
    tooltipEnterDelay: number
    tooltipLeaveDelay: number
    textTransform: string
}

const HighlightSingleItemButton: React.FC<Props> = ({ item, tooltipEnterDelay, tooltipLeaveDelay, textTransform }): JSX.Element =>
{
    const domainDescription = useRecoilValue(domainDescriptionState)
    const isIgnoreDomainDescription = useRecoilValue(isIgnoreDomainDescriptionState)
    const isDisabled = (!item.hasOwnProperty(Field.ORIGINAL_TEXT_INDEXES)) || domainDescription === "" || isIgnoreDomainDescription

    const setSelectedSuggestedItem = useSetRecoilState(selectedSuggestedItemState)
    const setIsShowHighlightDialog = useSetRecoilState(isShowHighlightDialogState)
    const setOriginalTextIndexesList = useSetRecoilState(originalTextIndexesListState)
    const setTooltips = useSetRecoilState(tooltipsState)
    const setIsShowTitleDialogDomainDescription = useSetRecoilState(isShowTitleDialogDomainDescriptionState)


    const createTooltip = (): string =>
    {
        let tooltip = ""
    
        if (item[Field.TYPE] === ItemType.CLASS)
        {
            tooltip = `Class: ${item[Field.NAME]}`
        }
        else if (item[Field.TYPE] === ItemType.ATTRIBUTE)
        {
            const attribute: Attribute = item as Attribute
            const sourceName = createNameFromIRI(attribute[Field.SOURCE_CLASS])
            
            tooltip = `${sourceName}: ${item.name}`
        }
        else if (item[Field.TYPE] === ItemType.ASSOCIATION)
        {
            const association: Association = item as Association
            const sourceName = createNameFromIRI(association[Field.SOURCE_CLASS])
            const targetName = createNameFromIRI(association[Field.TARGET_CLASS])

            tooltip = `${sourceName} - ${item[Field.NAME]} - ${targetName}`
        }

        return tooltip
    }


    const onHighlightSingleItem = () =>
    {
        if (!item.hasOwnProperty(Field.ORIGINAL_TEXT_INDEXES))
        {
            item = { ...item, [Field.ORIGINAL_TEXT_INDEXES]: [] }
        }

        setIsShowTitleDialogDomainDescription(true)
        setIsShowHighlightDialog(true)
        setSelectedSuggestedItem(item)
        setOriginalTextIndexesList(item[Field.ORIGINAL_TEXT_INDEXES])
    
        const tooltip = createTooltip()
        let newTooltips : string[] = Array(item.originalTextIndexes.length).fill(tooltip)
        setTooltips(newTooltips)
    }


    if (isDisabled)
    {
        return <></>
    }


    return (
        <Tooltip title="Highlight in domain description" enterDelay={tooltipEnterDelay} leaveDelay={tooltipLeaveDelay}>

            <Button
                disabled={isDisabled}
                size={ SIDEBAR_BUTTON_SIZE }
                sx={{ textTransform: textTransform }}
                onClick={ () => onHighlightSingleItem() }>
                    <HighlightIcon/>
            </Button>
        </Tooltip>
    )
}

export default HighlightSingleItemButton
