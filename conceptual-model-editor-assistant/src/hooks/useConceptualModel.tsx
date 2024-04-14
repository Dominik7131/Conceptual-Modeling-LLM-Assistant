import { useCallback, useEffect, useState } from 'react';
import { Node, Edge, useOnSelectionChange } from 'reactflow';

import 'reactflow/dist/style.css';
import useUtility, { BASE_URL, HEADER, createEdgeID } from './useUtility';
import useDomainDescription from './useDomainDescription';
import useFetchData from './useFetchData';
import { Attribute, EdgeData, Entity, Field, Item, ItemType, NodeData, OriginalTextIndexesItem, Relationship, UserChoice } from '../interfaces';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { domainDescriptionState, edgesState, editedSuggestedItemState, fieldToLoadState, isDisableChangeState, isDisableSaveState, isIgnoreDomainDescriptionState, isLoadingSuggestedItemsState, isShowCreateEdgeDialogState, isShowEditDialogState, isShowHighlightDialogState, isSuggestedItemState, nodesState, originalTextIndexesListState, regeneratedItemState, selectedEdgesState, selectedNodesState, selectedSuggestedItemState, suggestedItemsState, tooltipsState } from '../atoms';


const useConceptualModel = () =>
{
  const setNodes = useSetRecoilState(nodesState)
  const setEdges = useSetRecoilState(edgesState)

  const setSuggestedItems = useSetRecoilState(suggestedItemsState)
  const setSelectedSuggestedItem = useSetRecoilState(selectedSuggestedItemState)
  const setEditedSuggestedItem = useSetRecoilState(editedSuggestedItemState)

  const setIsSuggestedItem = useSetRecoilState(isSuggestedItemState)
  const setIsDisableSave = useSetRecoilState(isDisableSaveState)
  const setIsDisableChange = useSetRecoilState(isDisableChangeState)

  const isLoadingSuggestedItems = useRecoilValue(isLoadingSuggestedItemsState)

  const nodes = useRecoilValue(nodesState)
  const selectedNodes = useRecoilValue(selectedNodesState)
  const selectedEdges = useRecoilValue(selectedEdgesState)

  const setIsShowEditDialog = useSetRecoilState(isShowEditDialogState)
  const setIsShowHighlightDialog = useSetRecoilState(isShowHighlightDialogState)
  const setIsShowCreateEdgeDialog = useSetRecoilState(isShowCreateEdgeDialogState)

  const setoriginalTextIndexesList = useSetRecoilState(originalTextIndexesListState)
  const setTooltips = useSetRecoilState(tooltipsState)

  const domainDescription = useRecoilValue(domainDescriptionState)
  const isIgnoreDomainDescription = useRecoilValue(isIgnoreDomainDescriptionState)
  const { onDomainDescriptionChange, onIgnoreDomainDescriptionChange } = useDomainDescription()

  const { capitalizeString } = useUtility()

  const { fetchSummary, fetchSummaryDescriptions, fetchStreamedData, fetchMergedOriginalTexts }
          = useFetchData({ onProcessStreamedData, onProcessMergedOriginalTexts })

  let IDToAssign = 0

  const SUGGEST_ITEMS_ENDPOINT = "suggest"
  const SUGGEST_ITEMS_URL = BASE_URL + SUGGEST_ITEMS_ENDPOINT
  

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

    // const input: SerializedConceptualModel = { "entities": [
    //   {name: "Student", "description": "", originalTextIndexes: [], "attributes": [
    //     {"ID": 0, "name": "name1", "originalText": "student has a name", "dataType": "string", "description": "The name of the student."},
    //     {"ID": 1, "name": "name2", "originalText": "student has a name", "dataType": "string", "description": "The name of the student."},
    //     {"ID": 2, "name": "name3", "originalText": "student has a name", "dataType": "string", "description": "The name of the student."},
    //   ]}],
    //   "relationships": []
    // }
      
    // const input : SerializedConceptualModel = { "entities": [
    //     {name: "Student", "description": "A student entity representing individuals enrolled in courses.", originalTextIndexes: [], "attributes": [{"ID": 0, "name": "name", "originalText": "student has a name", "dataType": "string", "description": "The name of the student."}]},
    //     {name: "Course", "description": "A course entity representing educational modules.", originalTextIndexes: [], "attributes": [{"ID": 1, "name": "name", "originalText": "courses have a name", "dataType": "string", "description": "The name of the course."}, {"ID": 2, "name": "number of credits", "originalText": "courses have a specific number of credits", "dataType": "string", "description": "The number of credits assigned to the course."}]},
    //     {name: "Dormitory", "description": "A professor entity representing instructors teaching courses.", originalTextIndexes: [], "attributes": [{"ID": 3,"name": "price", "originalText": "each dormitory has a price", "dataType": "number", "description": "The price of staying in the dormitory."}]},
    //     {name: "Professor", "description": "A dormitory entity representing residential facilities for students.", originalTextIndexes: [], "attributes": [{"ID": 4, "name": "name", "originalText": "professors, who have a name", "dataType": "string", "description": "The name of the professor."}]}],
    //   "relationships": [{ID: 0, type: ItemType.RELATIONSHIP, name: "enrolled in", description: "", originalText: "Students can be enrolled in any number of courses", originalTextIndexes: [], "source": "student", "target": "course", cardinality: ""},
    //                     {ID: 1, type: ItemType.RELATIONSHIP, "name": "accommodated in", description: "", "originalText": "students can be accommodated in dormitories", originalTextIndexes: [], "source": "student", "target": "dormitory", cardinality: ""},
    //                     {ID: 2, type: ItemType.RELATIONSHIP, "name": "has", description: "", originalText: "each course can have one or more professors", originalTextIndexes: [], "source": "course", "target": "professor", cardinality: ""},
    //                     {ID: 3, type: ItemType.RELATIONSHIP, "name": "is-a", description: "", originalText: "", originalTextIndexes: [], "source": "student", "target": "person", cardinality: ""}
    //                   ]}

    const incrementX = 500
    const incrementY = 200
    let positionX = 100
    let positionY = 100
    let newNodes : Node[] = []
    let newEdges : Edge[] = []

    for (const [key, entity] of Object.entries(input["entities"]))
    {
      const entityNameLowerCase = entity.name.toLowerCase()

      for (let index = 0; index < entity.attributes.length; index++)
      {
        // TODO: Do not use "any"
        (entity.attributes[index] as any).type = ItemType.ATTRIBUTE;
        (entity.attributes[index] as any).source = entityNameLowerCase
      }

      const entityObject : Entity = {
        [Field.ID]: 0, [Field.NAME]: entityNameLowerCase, [Field.TYPE]: ItemType.ENTITY, [Field.DESCRIPTION]: "", [Field.ORIGINAL_TEXT]: "",
        [Field.ORIGINAL_TEXT_INDEXES]: entity[Field.ORIGINAL_TEXT_INDEXES]}

      const nodeData : NodeData = {
        [Field.DESCRIPTION]: entity.description, [Field.ORIGINAL_TEXT]: entity.originalText,
        [Field.ORIGINAL_TEXT_INDEXES]: entity.originalTextIndexes, attributes: entity.attributes,
        onEdit: onEditItem, onSuggestItems: onSuggestItems, onAddNewAttribute: onAddNewAttribute 
      }
      const newNode : Node = {
        id: entityNameLowerCase, type: "customNode", position: { x: positionX, y: positionY }, data: nodeData
      }

      newNodes.push(newNode)

      positionX += incrementX

      if (positionX >= 1300)
      {
        positionX = 100
        positionY += incrementY
      }
    }

    for (const [key, relationship] of Object.entries(input["relationships"]))
    {
      const newID: string = createEdgeID(relationship.source, relationship.target, relationship.name)
      const newEdge : Edge = {
        id: newID, source: relationship.source, target: relationship.target, label: relationship.name, type: "custom-edge",
        data: { description: "", originalText: relationship.originalText, onEdit: onEditItem }
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
    };

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
        relationships.push({[Field.NAME]: edge.label, "sourceEntity": edge.source, "targetEntity": edge.target})
      }
      else
      {
        relationships.push({[Field.NAME]: edge.label, [Field.ORIGINAL_TEXT]: edge.data.originalText, "sourceEntity": edge.source, "targetEntity": edge.target})
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
      console.log(jsonString)
      console.log("\n")

      // Handle situation when the `jsonString` contains more than one JSON object because of stream buffering
      const jsonStringParts = jsonString.split('\n').filter((string => string !== ''))

      for (let i = 0; i < jsonStringParts.length; i++)
      {
        let item : Item = JSON.parse(jsonStringParts[i])
        item[Field.ID] = assignID()
        item[Field.TYPE] = itemType

        if (itemType === ItemType.ATTRIBUTE)
        {
          (item as Attribute)[Field.SOURCE_ENTITY] = sourceEntityName
        }
        else if (itemType === ItemType.RELATIONSHIP)
        {
          (item as Relationship)[Field.SOURCE_ENTITY] = sourceEntityName
        }

        setSuggestedItems(previousSuggestedItems => {
          return [...previousSuggestedItems, item]
        })
      }
    }

    function onProcessMergedOriginalTexts(data: any): void
    {
      let tooltips : string[] = []
      let originalTextIndexes : number[] = []

      for (let index = 0; index < data.length; index++)
      {
        const element = data[index];
        originalTextIndexes.push(element[0])
        originalTextIndexes.push(element[1])
        tooltips.push(element[2])
      }

      setoriginalTextIndexesList(_ => originalTextIndexes)
      setTooltips(_ => tooltips)
    }


  const onImportButtonClick = () =>
  {
    parseSerializedConceptualModel()
  }


  const onSuggestItems = (userChoice: UserChoice, sourceItemName: string | null, targetItemName: string | null): void =>
  {
    // TODO: isLoadingSuggestedItems is not being set correctly
    // Possible reason: useConceptualModel hook is being instantiated more than 1 time and the instances are probably not synchronized?
    if (isLoadingSuggestedItems)
    {
      alert("Another request is already being processed")
      return
    }

    // Reset all suggested items
    setSuggestedItems(_ => [])

    const currentDomainDescription = isIgnoreDomainDescription ? "" : domainDescription

    let itemType = ItemType.ENTITY
    if (userChoice === UserChoice.ATTRIBUTES)
    {
      itemType = ItemType.ATTRIBUTE
    }
    else if (userChoice === UserChoice.RELATIONSHIPS || userChoice === UserChoice.RELATIONSHIPS2)
    {
      itemType = ItemType.RELATIONSHIP
    }

    sourceItemName = sourceItemName !== null ? sourceItemName : ""
    targetItemName = targetItemName !== null ? targetItemName : ""
    const bodyData = JSON.stringify({"sourceEntity": sourceItemName, "targetEntity": targetItemName, "userChoice": userChoice, "domainDescription": currentDomainDescription})
    console.log("Body data: ", bodyData)

    fetchStreamedData(SUGGEST_ITEMS_URL, HEADER, bodyData, sourceItemName, itemType)
  }


  const onAddNewEntity = () : void =>
  {
    const blankEntity: Entity = {
      [Field.ID]: -1, [Field.NAME]: "", [Field.DESCRIPTION]: "", [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: [],
      [Field.TYPE]: ItemType.ENTITY,
    }

    setIsSuggestedItem(_ => true)
    setIsDisableSave(_ => true)
    setIsDisableChange(_ => true)
    setSelectedSuggestedItem(_ => blankEntity)
    setEditedSuggestedItem(_ => blankEntity)

    setIsShowEditDialog(true)
  }


  const onAddNewAttribute = (sourceEntity: Entity) : void =>
  {
    const blankAttribute: Attribute = {
      [Field.ID]: -1, [Field.NAME]: "", [Field.DESCRIPTION]: "", [Field.DATA_TYPE]: "", [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: [],
      [Field.TYPE]: ItemType.ATTRIBUTE, [Field.CARDINALITY]: "", [Field.SOURCE_ENTITY]: sourceEntity.name
    }

    setIsSuggestedItem(_ => true)
    setIsDisableSave(_ => true)
    setIsDisableChange(_ => true)
    setSelectedSuggestedItem(_ => blankAttribute)
    setEditedSuggestedItem(_ => blankAttribute)

    setIsShowEditDialog(true)
  }


  const onAddNewRelationship = () : void =>
  {
    setIsSuggestedItem(_ => true)
    setIsDisableSave(_ => true)
    setIsDisableChange(_ => true)

    setIsShowEditDialog(true)
    setIsShowCreateEdgeDialog(false)
  }


  const onSummaryButtonClick = () : void =>
  {
    const endpoint = BASE_URL + "summary1"
    const headers = { "Content-Type": "application/json" }
    const conceptualModel = convertConceptualModelToJSON(false)
    const bodyData = JSON.stringify({"conceptualModel": conceptualModel, "domainDescription": domainDescription})

    fetchSummary(endpoint, headers, bodyData)
  }


  const onSummaryDescriptionsClick = () : boolean =>
  {
    if (selectedNodes.length === 0)
    {
      alert("Nothing was selected")
      return false
    }

    const endpoint = BASE_URL + "summary2"
    const conceptualModel = convertConceptualModelToJSON(true)
    const bodyData = JSON.stringify({"conceptualModel": conceptualModel, "domainDescription": domainDescription})

    fetchSummaryDescriptions(endpoint, HEADER, bodyData)
    return true
  }


  const onHighlightSelectedItems = (): void =>
  {
    let originalTextsIndexesObjects : OriginalTextIndexesItem[] = []

    // Process all selected nodes
    for (let i = 0; i < selectedNodes.length; i++)
    {
      // Process each attribute for the given entity
      const entityName: string = capitalizeString(selectedNodes[i].id)
      for (let j = 0; j < selectedNodes[i].data.attributes.length; j++)
      {
        const element = selectedNodes[i].data.attributes[j];

        if (!element.originalTextIndexes)
        {
          continue
        }

        // Process each original text indexes for the given attribute
        for (let k = 0; k < element.originalTextIndexes.length; k += 2)
        {
          const ii1: number = element.originalTextIndexes[k]
          const ii2: number = element.originalTextIndexes[k + 1]

          originalTextsIndexesObjects.push( { indexes: [ii1, ii2], label: `${entityName}: ${element.name}`} )
        }
      }


      if (!selectedNodes[i].data.originalTextIndexes)
      {
        continue
      }

      // Process each original text indexes for the given entity 
      for (let k = 0; k < selectedNodes[i].data.originalTextIndexes.length; k += 2)
      {
        const ii1 : number = selectedNodes[i].data.originalTextIndexes[k]
        const ii2 : number = selectedNodes[i].data.originalTextIndexes[k + 1]

        originalTextsIndexesObjects.push( { indexes: [ii1, ii2], label: `Entity: ${selectedNodes[i].id}`} )
      }
    }

    // Process also all selected edges
    for (let i = 0; i < selectedEdges.length; i++)
    {
      if (!selectedEdges[i].data.originalTextIndexes)
      {
        continue
      }

      // Process each original text indexes for the given edge 
      for (let k = 0; k < selectedEdges[i].data.originalTextIndexes.length; k += 2)
      {
        const ii1 : number = selectedEdges[i].data.originalTextIndexes[k]
        const ii2 : number = selectedEdges[i].data.originalTextIndexes[k + 1]

        originalTextsIndexesObjects.push( { indexes: [ii1, ii2], label: `${selectedEdges[i].source} – ${selectedEdges[i].data.name} – ${selectedEdges[i].target}`} )
      }
    }

    const endpoint = "merge_original_texts"
    const url = BASE_URL + endpoint
    const headers = { "Content-Type": "application/json" }
    const bodyData = JSON.stringify({ "originalTextIndexesObject": originalTextsIndexesObjects})

    fetchMergedOriginalTexts(url, headers, bodyData)


    setIsShowHighlightDialog(true)
  }


  const updateNodes = () =>
  {
    setNodes((nodes) => nodes.map((currentNode : Node) =>
    {
      const updatedData = { ...currentNode.data, onEdit: onEditItem, onSuggestItems: onSuggestItems, onAddNewAttribute: onAddNewAttribute }
      const updatedNode: Node = { ...currentNode, data: updatedData }
      return updatedNode
    }))
  }

  const updateEdges = () =>
  {
    setEdges((edges) => edges.map((currentEdge : Edge) =>
    {
      const updatedData = { ...currentEdge.data, onEdit: onEditItem }
      const updatedEdge: Edge = { ...currentEdge, data: updatedData }
      return updatedEdge
    }))
  }


  useEffect(() =>
  {
    // TODO: Let the functions inside the `data` of nodes and edges update automatically on every re-render
    // of the component `ConceptualModel` without an useEffect hook
    updateNodes()
    updateEdges()
  }, [domainDescription, isIgnoreDomainDescription])


  useEffect(() =>
  {
    if (!setIsShowHighlightDialog)
    {
      return
    }

    // Scroll down to the first highlighted original text in the dialog
    // We need to wait for few miliseconds to let the dialog render
    // TODO: Try to come up with solution that doesn't need any hardcoded timeout
    const delay = async () =>
    {
      await new Promise(resolve => setTimeout(resolve, 200));

      let highlightedText = document.getElementById("highlightedOriginalText-1")
      // console.log("Trying to scroll", highlightedText)

      if (highlightedText)
      {
        highlightedText.scrollIntoView( { behavior: 'smooth', block: 'center'})
      }
    }

    delay()

  }, [setIsShowHighlightDialog])


  const doesNodeAlreadyExist = (nodeID: string): boolean =>
  {
    for (let i = 0; i < nodes.length; i++)
    {
      if (nodes[i].id === nodeID)
      {
        console.log("Node already exists")
        return true
      }
    }

    return false
  }


  const createNode = (nodeID: string, positionX: number, positionY: number): Node =>
  {
    const data : NodeData = {
      [Field.DESCRIPTION]: "", [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: [],
      attributes: [], onEdit: onEditItem, onSuggestItems: onSuggestItems, onAddNewAttribute: onAddNewAttribute
    }
    const newNode: Node = {
      id: nodeID, type: "customNode", position: { x: positionX, y: positionY }, data: data
    }
    
    return newNode
  }


  const addNode = (nodeID: string, positionX: number, positionY: number, attributes: Attribute[] = []) =>
  {
    if (!nodeID)
    {
      alert("Node name is empty")
      return
    }

    if (doesNodeAlreadyExist(nodeID))
    {
      alert(`Node '${nodeID}' already exists`)
      return
    }

    const newNode: Node = createNode(nodeID, positionX, positionY)

    setNodes(previousNodes => {
      return [...previousNodes, newNode]
    })
  }


  const addNodeEntity = (entity: Entity, positionX: number, positionY: number) =>
  {
      if (doesNodeAlreadyExist(entity.name))
      {
          alert(`Node '${entity.name}' already exists`)
          return
      }
  
      const nodeData: NodeData = {
          [Field.DESCRIPTION]: entity[Field.DESCRIPTION], [Field.ORIGINAL_TEXT]: entity[Field.ORIGINAL_TEXT], [Field.ORIGINAL_TEXT_INDEXES]: [], attributes: [], 
          onEdit: onEditItem, onSuggestItems: onSuggestItems, onAddNewAttribute: onAddNewAttribute
      }
  
      const newNode: Node = {
          id: entity.name, type: "customNode", position: { x: positionX, y: positionY },
          data: nodeData
      }
  
      setNodes(previousNodes => {
          return [...previousNodes, newNode]
      })
  }


  const onOverlayDomainDescriptionOpen = () =>
  {
    setIsShowHighlightDialog(true)
  }


  const onClickAddNode = (nodeName : string) =>
  {
    if (!nodeName)
    {
      return
    }

    addNode(nodeName.toLowerCase(), 0, 0, [])
  }
  
  
  const onAddAttributesToNode = (attribute : Attribute) : void =>
  {    
    const nodeID = attribute.source
    
    setNodes((nodes) => nodes.map((currentNode : Node) =>
    {
      // Skip nodes which are not getting a new attribute
      if (currentNode.id !== nodeID)
      {
        return currentNode;
      }

      // If the node already contains the selected attribute do not add anything
      let isAttributePresent = false
      currentNode.data.attributes.forEach((currentAttribute : Attribute) =>
      {
        if (currentAttribute.name === attribute.name)
        {
          isAttributePresent = true
        }
      })

      if (isAttributePresent)
      {
        console.log("Attribute is already present")
        return currentNode;
      }

      const newAttributes = [...currentNode.data.attributes, attribute]  
      const newData : NodeData = { ...currentNode.data, attributes: newAttributes }
      const updatedNode: Node = {...currentNode, data: newData}

      return updatedNode
    }));
  }


  const doesEdgeAlreadyExist = (edgeID: string): boolean =>
  {
    let result = false

    setEdges((edges: Edge[]) => edges.map((edge: Edge) =>
    {
      if (edge.id === edgeID)
      {
        result = true 
      }
      return edge
    }))

    return result
  }


  const onAddRelationshipsToNodes = (relationship : Relationship): void =>
  {
    let sourceNodeID = relationship.source?.toLowerCase()
    let targetNodeID = relationship.target?.toLowerCase()

    if (!sourceNodeID) { sourceNodeID = "" }
    if (!targetNodeID) { targetNodeID = "" }

    const newEdgeID = createEdgeID(sourceNodeID, targetNodeID, relationship.name)
    if (doesEdgeAlreadyExist(newEdgeID))
    {
      return 
    }

    const isTargetNodeCreated: boolean = doesNodeAlreadyExist(targetNodeID)

    if (!isTargetNodeCreated)
    {
      // TODO: Try to come up with a better node position
      const newNode: Node = createNode(targetNodeID, 500, 100)

      setNodes(previousNodes => 
      {
        return [...previousNodes, newNode]
      })
      
      setNodes((nodes) => nodes.map((node) =>
      {
        if (node.id === targetNodeID)
        {
          return node
        }
        return node
      }));
    }

    // TODO: Make function to create edge (or edge data) from a relationship
    const edgeData: EdgeData = {
      [Field.ID]: relationship.ID, [Field.DESCRIPTION]: relationship[Field.DESCRIPTION],
      [Field.ORIGINAL_TEXT]: relationship[Field.ORIGINAL_TEXT], [Field.ORIGINAL_TEXT_INDEXES]: relationship[Field.ORIGINAL_TEXT_INDEXES],
      [Field.CARDINALITY]: relationship[Field.CARDINALITY], onEdit: onEditItem
    }

    const newEdge : Edge = {
      id: newEdgeID, type: "custom-edge", source: sourceNodeID, target: targetNodeID, label: relationship.name, data: edgeData
    }

    setEdges(previousEdges =>
    {
      return [...previousEdges, newEdge]
    })
  }

  const onEditSuggestion = (itemID: number) : void =>
  {
    let suggestedItem: Item | null = null

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

    setSelectedSuggestedItem(_ => suggestedItem as Item)
    setEditedSuggestedItem(_ => suggestedItem as Item)
    setIsSuggestedItem(_ => true)

    setIsDisableSave(_ => true)
    setIsDisableChange(_ => false)
    setIsShowEditDialog(true)
  }


  const onEditItem = (item: Item) : void =>
  {
    setIsSuggestedItem(_ => false)
    setIsDisableSave(_ => false)
    setIsDisableChange(_ => false)
    setSelectedSuggestedItem(_ => item)
    setEditedSuggestedItem(_ => item)

    setIsShowEditDialog(true)
  }


  const onAddItem = (item : Item) =>
  {
    console.log("Adding this item: ", item)

    if (item.type === ItemType.ENTITY)
    {
      if (!item.name)
      {
        alert("Entity name cannot be empty")
        return
      }

      addNodeEntity(item as Entity, 66, 66)
    }
    else if (item.type === ItemType.ATTRIBUTE)
    {
      onAddAttributesToNode(item as Attribute)
    }
    else if (item.type === ItemType.RELATIONSHIP)
    {
      onAddRelationshipsToNodes(item as Relationship)
    }
    else
    {
      console.log("Unknown item type: ", item.type)
    }
  }



  const onHighlightSingleItem = (itemID : number) =>
  {
    // TODO: probably add to method argument "isAttribute" similar to `editSuggestion` method in Sidebar.tsx
    // TODO: probably move this function into file `useoriginalTextIndexes.tsx`

    setIsShowHighlightDialog(_ => true)

    // Find the suggested item with ID: itemID

    let suggestedItem: Item | null = null

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
    setoriginalTextIndexesList(_ => (suggestedItem as Item)[Field.ORIGINAL_TEXT_INDEXES])

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
    
    
  return {
    parseSerializedConceptualModel, 
    onIgnoreDomainDescriptionChange, onImportButtonClick, onSuggestItems, onSummaryButtonClick, capitalizeString,
    onClickAddNode, onDomainDescriptionChange, onEditSuggestion, onHighlightSingleItem, onOverlayDomainDescriptionOpen, onHighlightSelectedItems,
    onSummaryDescriptionsClick, onAddNewEntity, onAddNewRelationship, onAddItem
  }
}

export default useConceptualModel