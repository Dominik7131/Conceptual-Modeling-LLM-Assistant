import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { HEADER, SAVE_SUGESTED_SINGLE_FIELD_URL } from "../definitions/urls"
import { itemTypeToUserChoice } from "../utils/utility"
import { getSnapshotDomainDescription, getSnapshotTextFilteringVariation } from "../utils/snapshot"
import { onClearRegeneratedItem } from "../utils/editItem"
import { SingleFieldUserEvaluationBody } from "../definitions/fetch"
import { regeneratedOriginalTextIndexesState } from "../atoms/originalTextIndexes"
import { domainDescriptionSnapshotsState, textFilteringVariationSnapshotsState } from "../atoms/snapshots"
import { editedSuggestedItemState, regeneratedItemState } from "../atoms/suggestions"
import { Item, Attribute } from "../definitions/conceptualModel"
import { ItemType, UserChoiceSingleField, Field } from "../definitions/utility"


const useConfirmRegeneratedField = () =>
{
    const domainDescriptionSnapshot = useRecoilValue(domainDescriptionSnapshotsState)
    const textFilteringVariationSnapshot = useRecoilValue(textFilteringVariationSnapshotsState)

    const setEditedItem = useSetRecoilState(editedSuggestedItemState)
    const [regeneratedItem, setRegeneratedItem] = useRecoilState(regeneratedItemState)
    const regeneratedOriginalTextIndexes = useRecoilValue(regeneratedOriginalTextIndexesState)

    
    const saveSingleFieldSuggestion = (fieldName: string, fieldText: string, itemType: ItemType, sourceClass: string, isPositive: boolean): void =>
    {
        // Save generated single field to the backend
    
        let currentDomainDescription = getSnapshotDomainDescription(UserChoiceSingleField.SINGLE_FIELD, domainDescriptionSnapshot)

        const isDisableDomainDescription = fieldName === Field.NAME
        if (isDisableDomainDescription)
        {
            currentDomainDescription = ""
        }

        const currentFilteringVariation = getSnapshotTextFilteringVariation(UserChoiceSingleField.SINGLE_FIELD, textFilteringVariationSnapshot)
        const userChoice = itemTypeToUserChoice(itemType)

        const bodyData: SingleFieldUserEvaluationBody = {
            domainDescription: currentDomainDescription, fieldName: fieldName, fieldText: fieldText,
            userChoice: userChoice, sourceClass: sourceClass, isPositive: isPositive, textFilteringVariation: currentFilteringVariation
        }
        const bodyDataJSON = JSON.stringify(bodyData)
    
        fetch(SAVE_SUGESTED_SINGLE_FIELD_URL, { method: "POST", headers: HEADER, body: bodyDataJSON })
    }
    
        
    const onConfirmRegeneratedText = (field: Field): void =>
    {    
        setEditedItem((editedItem: Item) =>
        {
            if (!regeneratedItem.hasOwnProperty(field))
            {
                return editedItem
            }

            if (field === Field.ORIGINAL_TEXT)
            {
                return { ...editedItem, [field]: regeneratedItem[field], [Field.ORIGINAL_TEXT_INDEXES]: regeneratedOriginalTextIndexes }
            }
            else
            {
                return { ...editedItem, [field]: regeneratedItem[field as keyof Item] }
            }
        })
        
        onClearRegeneratedItem(field, setRegeneratedItem)
    }

    return { onConfirmRegeneratedText, saveSingleFieldSuggestion }
}

export default useConfirmRegeneratedField