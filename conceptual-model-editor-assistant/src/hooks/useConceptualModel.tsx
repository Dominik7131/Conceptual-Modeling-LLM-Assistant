import { useEffect } from 'react';
import { Node, Edge, MarkerType, getMarkerEnd } from 'reactflow';

import 'reactflow/dist/style.css';
import { CUSTOM_EDGE_MARKER, CUSTOM_ISA_EDGE_MARKER, capitalizeString, changeSidebarTab, changeTitle, convertConceptualModelToJSON, createEdgeUniqueID, createIRIFromName, onClearSuggestedItems, snapshotDomainDescription, userChoiceToItemType } from './useUtility';
import useFetchData from './useFetchData';
import { Attribute, AttributeJson, ConceptualModelJson, EdgeData, Entity, Field, ItemType, NodeData, Relationship, UserChoice } from '../interfaces';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { domainDescriptionSnapshotsState, domainDescriptionState, edgesState, isIgnoreDomainDescriptionState, nodesState, sidebarTabValueState, sidebarTitlesState, suggestedAttributesState, suggestedEntitiesState, suggestedRelationshipsState, topbarTabValueState } from '../atoms';


const useConceptualModel = () =>
{
  const setNodes = useSetRecoilState(nodesState)
  const setEdges = useSetRecoilState(edgesState)

  const setSuggestedEntities = useSetRecoilState(suggestedEntitiesState)
  const setSuggestedAttributes = useSetRecoilState(suggestedAttributesState)
  const setSuggestedRelationships = useSetRecoilState(suggestedRelationshipsState)

  const setSidebarTitles = useSetRecoilState(sidebarTitlesState)

  const domainDescription = useRecoilValue(domainDescriptionState)
  const isIgnoreDomainDescription = useRecoilValue(isIgnoreDomainDescriptionState)
  const setDomainDescriptionSnapshot = useSetRecoilState(domainDescriptionSnapshotsState)

  const setSidebarTab = useSetRecoilState(sidebarTabValueState)


  const { fetchStreamedData } = useFetchData()


  const parseSerializedConceptualModel = (): void =>
  {
    const input = { entities: [
        {name: "Engine", description: "", originalText: "", [Field.ORIGINAL_TEXT_INDEXES]: [], attributes: []},
        {name: "Manufacturer", description: "", originalText: "", [Field.ORIGINAL_TEXT_INDEXES]: [], attributes: []},
        {name: "Natural person", description: "", originalText: "", [Field.ORIGINAL_TEXT_INDEXES]: [], attributes: []},
        {name: "Business natural person", description: "", originalText: "", [Field.ORIGINAL_TEXT_INDEXES]: [], attributes: []},
        {name: "Road vehicle", description: "", originalText: "", [Field.ORIGINAL_TEXT_INDEXES]: [4, 10], attributes: []}],
                  relationships: [
                    {"name": "manufactures", "source": "manufacturer", "target": "road vehicle", "originalText": "s"}]}


    const incrementX = 500
    const incrementY = 200
    let positionX = 100
    let positionY = 100
    let newNodes : Node[] = []
    let newEdges : Edge[] = []

    for (const [, entity] of Object.entries(input["entities"]))
    {
      const nodeIRI = createIRIFromName(entity.name)

      for (let index = 0; index < entity.attributes.length; index++)
      {
        // TODO: Do not use "any"
        (entity.attributes[index] as any)[Field.TYPE] = ItemType.ATTRIBUTE;

        (entity.attributes[index] as any)[Field.SOURCE_ENTITY] = nodeIRI
      }

      const newEntity : Entity = {
        [Field.IRI]: nodeIRI, [Field.NAME]: entity.name, [Field.TYPE]: ItemType.ENTITY, [Field.DESCRIPTION]: "", [Field.ORIGINAL_TEXT]: "",
        [Field.ORIGINAL_TEXT_INDEXES]: entity[Field.ORIGINAL_TEXT_INDEXES]}

      const maxRandomValue = 200
      const randomX = Math.floor(Math.random() * maxRandomValue)
      const randomY = Math.floor(Math.random() * maxRandomValue)

      const newPositionX = positionX + randomX
      const newPositionY = positionY + randomY

      const nodeData : NodeData = { entity: newEntity, attributes: entity.attributes }
      const newNode : Node = { id: nodeIRI, type: "customNode", position: { x: newPositionX, y: newPositionY }, data: nodeData }

      newNodes.push(newNode)

      positionX += incrementX

      if (positionX >= 1300)
      {
        positionX = 100
        positionY += incrementY
      }
    }

    for (const [, relationship] of Object.entries(input["relationships"]))
    {
      const nameIRI = createIRIFromName(relationship.name)
      const sourceIRI = createIRIFromName(relationship.source)
      const targetIRI = createIRIFromName(relationship.target)

      const newID: string = createEdgeUniqueID(sourceIRI, targetIRI, nameIRI)

      const newRelationship: Relationship = {
        [Field.IRI]: nameIRI, [Field.TYPE]: ItemType.RELATIONSHIP, [Field.NAME]: relationship.name, [Field.DESCRIPTION]: "",
        [Field.SOURCE_ENTITY]: sourceIRI, [Field.TARGET_ENTITY]: targetIRI,
        [Field.SOURCE_CARDINALITY]: "", [Field.TARGET_CARDINALITY]: "", [Field.ORIGINAL_TEXT]: relationship.originalText,
        [Field.ORIGINAL_TEXT_INDEXES]: []
      }
      const edgeData: EdgeData = { relationship: newRelationship }

      const newEdge: Edge = {
        id: newID, source: newRelationship[Field.SOURCE_ENTITY], target: newRelationship[Field.TARGET_ENTITY], type: "custom-edge",
        data: edgeData, markerEnd: CUSTOM_EDGE_MARKER
      }

      newEdges.push(newEdge)
    }
    
    setNodes(() => { return newNodes })
    setEdges(() => { return newEdges })
  }


  const onSuggestItems = (userChoice: UserChoice, sourceItemName: string | null, targetItemName: string | null): void =>
  {
    const currentDomainDescription = isIgnoreDomainDescription ? "" : domainDescription

    sourceItemName = sourceItemName !== null ? sourceItemName : ""
    targetItemName = targetItemName !== null ? targetItemName : ""

    const itemType: ItemType = userChoiceToItemType(userChoice)

    onClearSuggestedItems(itemType, setSuggestedEntities, setSuggestedAttributes, setSuggestedRelationships)
    changeSidebarTab(itemType, setSidebarTab)
    changeTitle(userChoice, sourceItemName, targetItemName, setSidebarTitles)

    // Snapshot current domain description to know from what text the suggestions were generated
    snapshotDomainDescription(userChoice, currentDomainDescription, setDomainDescriptionSnapshot)

    const bodyData = JSON.stringify({"sourceEntity": sourceItemName, "targetEntity": targetItemName, "userChoice": userChoice, "domainDescription": currentDomainDescription})

    const sourceItemIRI = createIRIFromName(sourceItemName)
    fetchStreamedData(bodyData, sourceItemIRI, itemType)
  }

    
  return { parseSerializedConceptualModel, onSuggestItems }
}

export default useConceptualModel