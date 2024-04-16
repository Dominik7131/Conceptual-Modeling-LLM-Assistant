import { Button } from "@mui/material"
import HighlightIcon from '@mui/icons-material/Highlight';
import { isShowHighlightDialogState, originalTextIndexesListState, selectedSuggestedItemState, suggestedItemsState, tooltipsState } from "../atoms";
import { useSetRecoilState } from "recoil";
import { Attribute, Field, Item, ItemType, Relationship } from "../interfaces";
import { capitalizeString } from "../hooks/useUtility";


interface Props
{
    item: Item
}

const HighlightSingleItemButton: React.FC<Props> = ({ item }):JSX.Element =>
{
    const setSelectedSuggestedItem = useSetRecoilState(selectedSuggestedItemState)
    const setIsShowHighlightDialog = useSetRecoilState(isShowHighlightDialogState)
    const setSuggestedItems = useSetRecoilState(suggestedItemsState)
    const setOriginalTextIndexesList = useSetRecoilState(originalTextIndexesListState)
    const setTooltips = useSetRecoilState(tooltipsState)
    

    const onHighlightSingleItem = (itemID : number) =>
    {
        setIsShowHighlightDialog(_ => true)
    
        let suggestedItem: Item | null = null
    
        // Find the suggested item with ID = itemID
        setSuggestedItems((items: Item[]) => items.map((item: Item) =>
        {
            if (item.ID === itemID)
            {
                suggestedItem = item
            }
        
            return item
        }))
    
    
        if (!suggestedItem)
        {
            throw new Error("Accessed invalid itemID")
        }
    
        suggestedItem = suggestedItem as Item
        
        setSelectedSuggestedItem(_ => suggestedItem as Item)
        setOriginalTextIndexesList(_ => (suggestedItem as Item)[Field.ORIGINAL_TEXT_INDEXES])
    
        // Create tooltips for highlighted original text
        let tooltip = ""
    
        const capitalizedSourceEntity: string = capitalizeString((suggestedItem as Attribute).source)
    
        if (suggestedItem.type === ItemType.ENTITY)
        {
            tooltip = `Entity: ${capitalizedSourceEntity}`
        }
        else if (suggestedItem.type === ItemType.ATTRIBUTE)
        {
            tooltip = `${capitalizedSourceEntity}: ${suggestedItem.name}`
        }
        else if (suggestedItem.type === ItemType.RELATIONSHIP)
        {
            tooltip = `${capitalizedSourceEntity} - ${suggestedItem.name} - ${(suggestedItem as Relationship).target}`
        }
    
        let newTooltips : string[] = Array(suggestedItem.originalTextIndexes.length).fill(tooltip)
        setTooltips(_ => newTooltips)
    }

    return (
        <Button
            startIcon={<HighlightIcon/>}
            onClick={() => onHighlightSingleItem(item.ID)}>
                Highlight
        </Button>
    )
}

export default HighlightSingleItemButton