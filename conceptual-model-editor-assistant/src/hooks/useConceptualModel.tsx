import { useEffect } from 'react';
import { Node, Edge, MarkerType, getMarkerEnd } from 'reactflow';

import 'reactflow/dist/style.css';
import { CUSTOM_EDGE_MARKER, CUSTOM_ISA_EDGE_MARKER, capitalizeString, createEdgeID, userChoiceToItemType } from './useUtility';
import useFetchData from './useFetchData';
import { Attribute, AttributeJson, ConceptualModelJson, EdgeData, Entity, Field, Item, ItemType, ItemsMessage, NodeData, Relationship, SidebarTabs, TopbarTabs, UserChoice } from '../interfaces';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { domainDescriptionState, edgesState, editDialogErrorMsgState, editedSuggestedItemState, isIgnoreDomainDescriptionState, isShowCreateEdgeDialogState, isShowEditDialogState, isSuggestedItemState, nodesState, selectedEdgesState, selectedNodesState, selectedSuggestedItemState, sidebarTabValueState, sidebarTitlesState, suggestedAttributesState, suggestedEntitiesState, suggestedRelationshipsState, topbarTabValueState } from '../atoms';


const useConceptualModel = () =>
{
  const setNodes = useSetRecoilState(nodesState)
  const setEdges = useSetRecoilState(edgesState)

  const selectedNodes = useRecoilValue(selectedNodesState)
  const selectedEdges = useRecoilValue(selectedEdgesState)

  const setSuggestedEntities = useSetRecoilState(suggestedEntitiesState)
  const setSuggestedAttributes = useSetRecoilState(suggestedAttributesState)
  const setSuggestedRelationships = useSetRecoilState(suggestedRelationshipsState)

  const setSidebarTitles = useSetRecoilState(sidebarTitlesState)

  const domainDescription = useRecoilValue(domainDescriptionState)
  const isIgnoreDomainDescription = useRecoilValue(isIgnoreDomainDescriptionState)

  const setTopbarTabValue = useSetRecoilState(topbarTabValueState)
  const setSidebarTab = useSetRecoilState(sidebarTabValueState)


  const { fetchSummaryPlainText, fetchSummaryDescriptions, fetchStreamedData } = useFetchData({ onClearSuggestedItems, onProcessStreamedData })

  let IDToAssign = 0


  const parseSerializedConceptualModel = () =>
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
      const entityNameLowerCase = entity.name.toLowerCase()

      for (let index = 0; index < entity.attributes.length; index++)
      {
        // TODO: Do not use "any"
        (entity.attributes[index] as any).type = ItemType.ATTRIBUTE;

        (entity.attributes[index] as any).source = entityNameLowerCase
      }

      const newEntity : Entity = {
        [Field.ID]: 0, [Field.NAME]: entityNameLowerCase, [Field.TYPE]: ItemType.ENTITY, [Field.DESCRIPTION]: "", [Field.ORIGINAL_TEXT]: "",
        [Field.ORIGINAL_TEXT_INDEXES]: entity[Field.ORIGINAL_TEXT_INDEXES]}

      const maxRandomValue = 200
      const randomX = Math.floor(Math.random() * maxRandomValue)
      const randomY = Math.floor(Math.random() * maxRandomValue)

      const newPositionX = positionX + randomX
      const newPositionY = positionY + randomY

      const nodeData : NodeData = { entity: newEntity, attributes: entity.attributes }
      const newNode : Node = { id: entityNameLowerCase, type: "customNode", position: { x: newPositionX, y: newPositionY }, data: nodeData }

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
      const newID: string = createEdgeID(relationship.source, relationship.target, relationship.name)

      const newRelationship: Relationship = {
        [Field.ID]: 0, [Field.TYPE]: ItemType.RELATIONSHIP, [Field.NAME]: relationship.name, [Field.DESCRIPTION]: "",
        [Field.SOURCE_ENTITY]: relationship.source, [Field.TARGET_ENTITY]: relationship.target,
        [Field.SOURCE_CARDINALITY]: "", [Field.TARGET_CARDINALITY]: "", [Field.ORIGINAL_TEXT]: relationship.originalText,
        [Field.ORIGINAL_TEXT_INDEXES]: [], [Field.IS_GENERALIZATION]: false
      }
      const edgeData: EdgeData = { relationship: newRelationship }

      const newEdge: Edge = {
        id: newID, source: relationship.source, target: relationship.target, type: "custom-edge",
        data: edgeData, markerEnd: CUSTOM_EDGE_MARKER
      }

      newEdges.push(newEdge)
    }
    
    setNodes(() => { return newNodes })
    setEdges(() => { return newEdges })
  }


  const convertConceptualModelToJSON = (isOnlyNames : boolean) =>
  {
    let result: { [key: string]: any } = {
      entities: []
    }

    for (let node of selectedNodes)
    {
      let attributes = []
      for (let attribute of node.data.attributes)
      {
        if (isOnlyNames)
        {
          attributes.push({[Field.NAME]: attribute.name})
        }
        else
        {
          attributes.push({[Field.NAME]: attribute.name, [Field.ORIGINAL_TEXT]: attribute.originalText})
        }
      }

      result.entities.push({[Field.NAME]: node.id, attributes: attributes})
    }


    let relationships = []
    for (let edge of selectedEdges)
    {
      if (isOnlyNames)
      {
        relationships.push({[Field.NAME]: edge.data.relationship.name, "sourceEntity": edge.source, "targetEntity": edge.target})
      }
      else
      {
        relationships.push({[Field.NAME]: edge.data.relationship.name, [Field.ORIGINAL_TEXT]: edge.data.originalText, "sourceEntity": edge.source, "targetEntity": edge.target})
      }
    }

    result.relationships = relationships

    return result
  }


    const assignID = () =>
    {
      const newID = IDToAssign
      IDToAssign += 1
      return newID
    }


    function onProcessStreamedData(value: any, sourceEntityName: string, itemType: ItemType): void
    {
      // Convert the `value` to a string
      var jsonString = new TextDecoder().decode(value)

      // Handle situation when the `jsonString` contains more than one JSON object because of stream buffering
      const jsonStringParts = jsonString.split('\n').filter((string => string !== ''))

      for (let i = 0; i < jsonStringParts.length; i++)
      {
        let item : Item = JSON.parse(jsonStringParts[i])
        item[Field.ID] = assignID()
        item[Field.TYPE] = itemType

        if (itemType === ItemType.ENTITY)
        {
          setSuggestedEntities(previousSuggestedItems => {
            return [...previousSuggestedItems, item]
          })
        }

        if (itemType === ItemType.ATTRIBUTE)
        {
          let attribute: Attribute = item as Attribute
          attribute[Field.SOURCE_ENTITY] = sourceEntityName

          setSuggestedAttributes(previousSuggestedItems => {
            return [...previousSuggestedItems, attribute]
          })
        }
        else if (itemType === ItemType.RELATIONSHIP)
        {
          let relationship: Relationship = item as Relationship
          relationship[Field.SOURCE_ENTITY] = sourceEntityName

          setSuggestedRelationships(previousSuggestedItems => {
            return [...previousSuggestedItems, relationship]
          })
        }
      }
    }
  
  function onClearSuggestedItems(itemType: ItemType): void
  {
    if (itemType === ItemType.ENTITY)
    {
      setSuggestedEntities(_ => [])
    }
    else if (itemType === ItemType.ATTRIBUTE)
    {
      setSuggestedAttributes(_ => [])
    }
    else if (itemType === ItemType.RELATIONSHIP)
    {
      setSuggestedRelationships(_ => [])
    }
  }

  const changeSidebarTab = (itemType: ItemType) =>
  {
    if (itemType === ItemType.ENTITY)
    {
      setSidebarTab(SidebarTabs.ENTITIES)
    }
    else if (itemType === ItemType.ATTRIBUTE)
    {
      setSidebarTab(SidebarTabs.ATTRIBUTES)
    }
    else if (itemType === ItemType.RELATIONSHIP)
    {
      setSidebarTab(SidebarTabs.RELATIONSHIPS)
    }
  }


  const changeSidebarTitles = (userChoice: UserChoice, sourceItemName: string, targetItemName: string): void =>
  {
    if (userChoice === UserChoice.ENTITIES)
    {
      const message = ""
      setSidebarTitles((title: ItemsMessage) => { return { ...title, entities: message} })
    }
    else if (userChoice === UserChoice.ATTRIBUTES)
    {
      const message = `Selected entity: ${sourceItemName}`
      setSidebarTitles((title: ItemsMessage) => { return { ...title, attributes: message} })
    }
    else if (userChoice === UserChoice.RELATIONSHIPS)
    {
      const message = `Selected entity: ${sourceItemName}`
      setSidebarTitles((title: ItemsMessage) => { return { ...title, relationships: message} })
    }
    else if (userChoice === UserChoice.RELATIONSHIPS2)
    {
      const message = `Source entity: ${sourceItemName}\nTarget entity: ${targetItemName}`
      setSidebarTitles((title: ItemsMessage) => { return { ...title, relationships: message} })
    }
  }


  const onSuggestItems = (userChoice: UserChoice, sourceItemName: string | null, targetItemName: string | null): void =>
  {
    const currentDomainDescription = isIgnoreDomainDescription ? "" : domainDescription

    sourceItemName = sourceItemName !== null ? sourceItemName : ""
    targetItemName = targetItemName !== null ? targetItemName : ""

    const itemType: ItemType = userChoiceToItemType(userChoice)

    onClearSuggestedItems(itemType)
    changeSidebarTab(itemType)
    changeSidebarTitles(userChoice, sourceItemName, targetItemName)


    const bodyData = JSON.stringify({"sourceEntity": sourceItemName, "targetEntity": targetItemName, "userChoice": userChoice, "domainDescription": currentDomainDescription})

    fetchStreamedData(bodyData, sourceItemName, itemType)
  }


  const onSummaryPlainTextClick = (): void =>
  {
    if (selectedNodes.length === 0)
    {
      alert("Nothing was selected")
      return
    }

    setTopbarTabValue(TopbarTabs.SUMMARY_PLAIN_TEXT)

    const conceptualModel = convertConceptualModelToJSON(false)
    const bodyData = JSON.stringify({"conceptualModel": conceptualModel, "domainDescription": domainDescription})

    fetchSummaryPlainText(bodyData)
  }


  const onSummaryDescriptionsClick = (): void =>
  {
    if (selectedNodes.length === 0)
    {
      alert("Nothing was selected")
      return
    }

    setTopbarTabValue(TopbarTabs.SUMMARY_DESCRIPTION)

    const conceptualModel = convertConceptualModelToJSON(true)
    const bodyData = JSON.stringify({"conceptualModel": conceptualModel, "domainDescription": domainDescription})

    fetchSummaryDescriptions(bodyData)
    return
  }
    
    
  return { parseSerializedConceptualModel, onSuggestItems, onSummaryPlainTextClick, onSummaryDescriptionsClick }
}

export default useConceptualModel