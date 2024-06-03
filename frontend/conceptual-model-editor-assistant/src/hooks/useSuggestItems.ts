import useFetchSuggestedItems from "./useFetchSuggestedItems"
import { ItemType, UserChoiceItem } from "../definitions/utility"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { snapshotDomainDescription, snapshotTextFilteringVariation } from "../utils/snapshot"
import { ItemSuggestionBody } from "../definitions/fetch"
import { domainDescriptionState, isIgnoreDomainDescriptionState } from "../atoms/domainDescription"
import { sidebarTitlesState, sidebarTabValueState } from "../atoms/sidebar"
import { domainDescriptionSnapshotsState, textFilteringVariationSnapshotsState } from "../atoms/snapshots"
import { suggestedClassesState, suggestedAttributesState, suggestedAssociationsState } from "../atoms/suggestions"
import { textFilteringVariationState } from "../atoms/textFiltering"
import { onClearSuggestedItems, changeTitle } from "../utils/conceptualModel"
import { changeSidebarTab } from "../utils/sidebar"
import { userChoiceToItemType } from "../utils/utility"


const useSuggestItems = () =>
{
  const setSuggestedClasses = useSetRecoilState(suggestedClassesState)
  const setSuggestedAttributes = useSetRecoilState(suggestedAttributesState)
  const setSuggestedAssociations = useSetRecoilState(suggestedAssociationsState)

  const setSidebarTitles = useSetRecoilState(sidebarTitlesState)
  const setSidebarTab = useSetRecoilState(sidebarTabValueState)

  const domainDescription = useRecoilValue(domainDescriptionState)
  const isIgnoreDomainDescription = useRecoilValue(isIgnoreDomainDescriptionState)
  const textFilteringVariation = useRecoilValue(textFilteringVariationState)

  const setDomainDescriptionSnapshot = useSetRecoilState(domainDescriptionSnapshotsState)
  const setTextFilteringVariationSnapshot = useSetRecoilState(textFilteringVariationSnapshotsState)

  const { fetchSuggestedItems } = useFetchSuggestedItems()


  const onSuggestItems = (userChoice: UserChoiceItem, sourceItemName: string | null, targetItemName: string | null): void =>
  {
    const currentDomainDescription = isIgnoreDomainDescription ? "" : domainDescription

    sourceItemName = sourceItemName !== null ? sourceItemName : ""
    targetItemName = targetItemName !== null ? targetItemName : ""

    const itemType: ItemType = userChoiceToItemType(userChoice)

    onClearSuggestedItems(itemType, setSuggestedClasses, setSuggestedAttributes, setSuggestedAssociations)
    changeSidebarTab(itemType, setSidebarTab)
    changeTitle(userChoice, sourceItemName, targetItemName, setSidebarTitles)

    // Snapshot current configuration to know from what parameters the suggestions were generated
    snapshotDomainDescription(userChoice, currentDomainDescription, setDomainDescriptionSnapshot)
    snapshotTextFilteringVariation(userChoice, textFilteringVariation, setTextFilteringVariationSnapshot)


    const bodyData: ItemSuggestionBody = {
      sourceClass: sourceItemName, targetClass: targetItemName, userChoice: userChoice, domainDescription: currentDomainDescription,
      textFilteringVariation: textFilteringVariation
    }

    const bodyDataJSON = JSON.stringify(bodyData)

    fetchSuggestedItems(bodyDataJSON, sourceItemName, itemType)
  }

  return { onSuggestItems }
}

export default useSuggestItems