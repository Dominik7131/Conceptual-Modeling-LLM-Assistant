import { useEffect } from 'react';
import { Node, Edge, MarkerType, getMarkerEnd } from 'reactflow';

import 'reactflow/dist/style.css';
import { CUSTOM_EDGE_MARKER, CUSTOM_ISA_EDGE_MARKER, capitalizeString, changeSidebarTab, changeTitle, convertConceptualModelToJSON, createEdgeUniqueID, createIRIFromName, onClearSuggestedItems, snapshotDomainDescription, userChoiceToItemType } from '../utils/utility';
import useFetchData from './useFetchData';
import { Attribute, AttributeJson, ConceptualModelJson, EdgeData, Class, Field, ItemType, NodeData, Association, UserChoice } from '../interfaces';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { domainDescriptionSnapshotsState, domainDescriptionState, edgesState, isIgnoreDomainDescriptionState, nodesState, sidebarTabValueState, sidebarTitlesState, suggestedAttributesState, suggestedClassesState, suggestedAssociationsState, topbarTabValueState } from '../atoms';


const useConceptualModel = () =>
{
  const setSuggestedClasses = useSetRecoilState(suggestedClassesState)
  const setSuggestedAttributes = useSetRecoilState(suggestedAttributesState)
  const setSuggestedAssociations = useSetRecoilState(suggestedAssociationsState)

  const setSidebarTitles = useSetRecoilState(sidebarTitlesState)

  const domainDescription = useRecoilValue(domainDescriptionState)
  const isIgnoreDomainDescription = useRecoilValue(isIgnoreDomainDescriptionState)
  const setDomainDescriptionSnapshot = useSetRecoilState(domainDescriptionSnapshotsState)

  const setSidebarTab = useSetRecoilState(sidebarTabValueState)


  const { fetchStreamedData } = useFetchData()


  const onSuggestItems = (userChoice: UserChoice, sourceItemName: string | null, targetItemName: string | null): void =>
  {
    const currentDomainDescription = isIgnoreDomainDescription ? "" : domainDescription

    sourceItemName = sourceItemName !== null ? sourceItemName : ""
    targetItemName = targetItemName !== null ? targetItemName : ""

    const itemType: ItemType = userChoiceToItemType(userChoice)

    onClearSuggestedItems(itemType, setSuggestedClasses, setSuggestedAttributes, setSuggestedAssociations)
    changeSidebarTab(itemType, setSidebarTab)
    changeTitle(userChoice, sourceItemName, targetItemName, setSidebarTitles)

    // Snapshot current domain description to know from what text the suggestions were generated
    snapshotDomainDescription(userChoice, currentDomainDescription, setDomainDescriptionSnapshot)

    const bodyData = JSON.stringify({"sourceClass": sourceItemName, "targetClass": "", "userChoice": userChoice, "domainDescription": currentDomainDescription})

    fetchStreamedData(bodyData, sourceItemName, itemType)
  }

    
  return { onSuggestItems }
}

export default useConceptualModel