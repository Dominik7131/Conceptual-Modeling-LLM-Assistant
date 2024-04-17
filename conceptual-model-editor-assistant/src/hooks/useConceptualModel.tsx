import { useEffect } from 'react';
import { Node, Edge, MarkerType, getMarkerEnd } from 'reactflow';

import 'reactflow/dist/style.css';
import { CUSTOM_EDGE_MARKER, CUSTOM_ISA_EDGE_MARKER, capitalizeString, createEdgeID, doesEdgeAlreadyExist, doesNodeAlreadyExist, userChoiceToItemType } from './useUtility';
import useFetchData from './useFetchData';
import { Attribute, AttributeJson, ConceptualModelJson, EdgeData, Entity, EntityJson, Field, GeneralizationJson, Item, ItemType, ItemsMessage, NodeData, Relationship, RelationshipJson, UserChoice } from '../interfaces';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { domainDescriptionState, edgesState, editDialogWarningMsgState, editedSuggestedItemState, isDisableChangeState, isDisableSaveState, isIgnoreDomainDescriptionState, isShowCreateEdgeDialogState, isShowEditDialogState, isShowHighlightDialogState, isSuggestedItemState, nodesState, originalTextIndexesListState, selectedEdgesState, selectedNodesState, selectedSuggestedItemState, sidebarTabValueState, sidebarTitlesState, suggestedAttributesState, suggestedEntitiesState, suggestedRelationshipsState, topbarTabValueState } from '../atoms';


const useConceptualModel = () =>
{
  const [nodes, setNodes] = useRecoilState(nodesState)
  const [edges, setEdges] = useRecoilState(edgesState)

  const selectedNodes = useRecoilValue(selectedNodesState)
  const selectedEdges = useRecoilValue(selectedEdgesState)

  const [suggestedEntities, setSuggestedEntities] = useRecoilState(suggestedEntitiesState)
  const [suggestedAttributes, setSuggestedAttributes] = useRecoilState(suggestedAttributesState)
  const [suggestedRelationships, setSuggestedRelationships] = useRecoilState(suggestedRelationshipsState)

  const setSidebarTitles = useSetRecoilState(sidebarTitlesState)

  const setSelectedSuggestedItem = useSetRecoilState(selectedSuggestedItemState)
  const setEditedSuggestedItem = useSetRecoilState(editedSuggestedItemState)

  const setIsSuggestedItem = useSetRecoilState(isSuggestedItemState)
  const setIsDisableSave = useSetRecoilState(isDisableSaveState)
  const setIsDisableChange = useSetRecoilState(isDisableChangeState)


  const setIsShowEditDialog = useSetRecoilState(isShowEditDialogState)
  const setIsShowCreateEdgeDialog = useSetRecoilState(isShowCreateEdgeDialogState)

  const domainDescription = useRecoilValue(domainDescriptionState)
  const isIgnoreDomainDescription = useRecoilValue(isIgnoreDomainDescriptionState)

  const setTopbarTabValue = useSetRecoilState(topbarTabValueState)
  const setSidebarTab = useSetRecoilState(sidebarTabValueState)

  const setWarningMessage = useSetRecoilState(editDialogWarningMsgState)

  const { fetchSummary, fetchSummaryDescriptions, fetchStreamedData } = useFetchData({ onClearSuggestedItems, onProcessStreamedData })

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

      const newEntity : Entity = {
        [Field.ID]: 0, [Field.NAME]: entityNameLowerCase, [Field.TYPE]: ItemType.ENTITY, [Field.DESCRIPTION]: "", [Field.ORIGINAL_TEXT]: "",
        [Field.ORIGINAL_TEXT_INDEXES]: entity[Field.ORIGINAL_TEXT_INDEXES]}

      const nodeData : NodeData = { entity: newEntity, attributes: entity.attributes }
      const newNode : Node = { id: entityNameLowerCase, type: "customNode", position: { x: positionX, y: positionY }, data: nodeData }

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

      const newRelationship: Relationship = {
        [Field.ID]: 0, [Field.TYPE]: ItemType.RELATIONSHIP, [Field.NAME]: relationship.name, [Field.DESCRIPTION]: "",
        [Field.SOURCE_ENTITY]: relationship.source, [Field.TARGET_ENTITY]: relationship.target,
        [Field.SOURCE_CARDINALITY]: "", [Field.TARGET_CARDINALITY]: "", [Field.ORIGINAL_TEXT]: relationship.originalText, [Field.ORIGINAL_TEXT_INDEXES]: []
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
      setSidebarTab(_ => "0")
    }
    else if (itemType === ItemType.ATTRIBUTE)
    {
      setSidebarTab(_ => "1")
    }
    else if (itemType === ItemType.RELATIONSHIP)
    {
      setSidebarTab(_ => "2")
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
      [Field.TYPE]: ItemType.ATTRIBUTE, [Field.SOURCE_CARDINALITY]: "", [Field.SOURCE_ENTITY]: sourceEntity.name
    }

    setIsSuggestedItem(_ => true)
    setIsDisableSave(_ => true)
    setIsDisableChange(_ => true)
    setSelectedSuggestedItem(_ => blankAttribute)
    setEditedSuggestedItem(_ => blankAttribute)

    setIsShowEditDialog(true)
  }


  const onAddNewRelationship = (): void =>
  {
    setIsSuggestedItem(_ => true)
    setIsDisableSave(_ => true)
    setIsDisableChange(_ => true)

    setIsShowEditDialog(true)
    setIsShowCreateEdgeDialog(false)
  }


  const onSummaryPlainTextClick = (): void =>
  {
    if (selectedNodes.length === 0)
    {
      alert("Nothing was selected")
      return
    }

    setTopbarTabValue("1")

    const conceptualModel = convertConceptualModelToJSON(false)
    const bodyData = JSON.stringify({"conceptualModel": conceptualModel, "domainDescription": domainDescription})

    fetchSummary(bodyData)
  }


  const onSummaryDescriptionsClick = (): void =>
  {
    if (selectedNodes.length === 0)
    {
      alert("Nothing was selected")
      return
    }

    setTopbarTabValue("2")

    const conceptualModel = convertConceptualModelToJSON(true)
    const bodyData = JSON.stringify({"conceptualModel": conceptualModel, "domainDescription": domainDescription})

    fetchSummaryDescriptions(bodyData)
    return
  }


  const createNode = (nodeID: string, positionX: number, positionY: number): Node =>
  {
    const newEntity: Entity = {
      [Field.ID]: 0, [Field.NAME]: nodeID, [Field.TYPE]: ItemType.ENTITY, [Field.DESCRIPTION]: "",
      [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: [],
    }

    const nodeData: NodeData = { entity: newEntity, attributes: [] }

    const newNode: Node = { id: nodeID, type: "customNode", position: { x: positionX, y: positionY }, data: nodeData }
    
    return newNode
  }


  const addNode = (nodeID: string, positionX: number, positionY: number, attributes: Attribute[] = []) =>
  {
    if (!nodeID)
    {
      alert("Node name is empty")
      return
    }

    if (doesNodeAlreadyExist(nodes, nodeID))
    {
      const alertMessage = `Node '${nodeID}' already exists`
      setWarningMessage(_ => alertMessage)
      return
    }

    const newNode: Node = createNode(nodeID, positionX, positionY)

    setNodes(previousNodes => {
      return [...previousNodes, newNode]
    })
  }


  const addNodeEntity = (entity: Entity, positionX: number, positionY: number): boolean =>
  {
    if (doesNodeAlreadyExist(nodes, entity.name))
    {
      const alertMessage = `Node '${entity.name}' already exists`
      setWarningMessage(_ => alertMessage)
      return false
    }

    const nodeData: NodeData = { entity: entity, attributes: [] }

    const newNode: Node = {
      id: entity.name, type: "customNode", position: { x: positionX, y: positionY },
      data: nodeData
    }

    setNodes(previousNodes => {
      return [...previousNodes, newNode]
    })

    return true
  }


  const onClickAddNode = (nodeName : string) =>
  {
    if (!nodeName)
    {
      return
    }

    addNode(nodeName.toLowerCase(), 0, 0, [])
  }
  
  
  const onAddAttributesToNode = (attribute : Attribute) =>
  {    
    const nodeID = attribute.source
    let isAttributePresent = false
    
    setNodes((nodes) => nodes.map((currentNode : Node) =>
    {
      // Skip nodes which are not getting a new attribute
      if (currentNode.id !== nodeID)
      {
        return currentNode
      }

      // If the node already contains the selected attribute do not add anything
      currentNode.data.attributes.forEach((currentAttribute : Attribute) =>
      {
        if (currentAttribute.name === attribute.name)
        {
          isAttributePresent = true
        }
      })

      if (isAttributePresent)
      {
        return currentNode
      }

      const newAttributes = [...currentNode.data.attributes, attribute]  
      const newData : NodeData = { ...currentNode.data, attributes: newAttributes }
      const updatedNode: Node = {...currentNode, data: newData}

      return updatedNode
    }));

    return isAttributePresent
  }


  const onAddRelationshipsToNodes = (relationship : Relationship): void =>
  {
    let sourceNodeID = relationship.source?.toLowerCase()
    let targetNodeID = relationship.target?.toLowerCase()

    if (!sourceNodeID) { sourceNodeID = "" }
    if (!targetNodeID) { targetNodeID = "" }

    const newEdgeID = createEdgeID(sourceNodeID, targetNodeID, relationship.name)
    if (doesEdgeAlreadyExist(edges, newEdgeID))
    {
      return
    }

    const isTargetNodeCreated: boolean = doesNodeAlreadyExist(nodes, targetNodeID)

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

    const edgeData: EdgeData = { relationship: relationship }

    const newEdge : Edge = {
      id: newEdgeID, type: "custom-edge", source: sourceNodeID, target: targetNodeID, label: relationship.name, data: edgeData,
      markerEnd: CUSTOM_EDGE_MARKER
    }

    setEdges(previousEdges =>
    {
      return [...previousEdges, newEdge]
    })
  }

  const onEditSuggestion = (itemID: number, itemType: ItemType): void =>
  {
    let suggestedItem: Item | undefined = undefined

    if (itemType === ItemType.ENTITY)
    {
      suggestedItem = suggestedEntities.find(entity => entity.ID === itemID)
    }
    else if (itemType === ItemType.ATTRIBUTE)
    {
      suggestedItem = suggestedAttributes.find(attribute => attribute.ID === itemID)
    }
    else if (itemType === ItemType.RELATIONSHIP)
    {
      suggestedItem = suggestedRelationships.find(relationship => relationship.ID === itemID)
    }

    if (!suggestedItem)
    {
      throw new Error("Invalid itemID")
    }

    setSelectedSuggestedItem(_ => suggestedItem as Item)
    setEditedSuggestedItem(_ => suggestedItem as Item)
    setIsSuggestedItem(_ => true)

    setIsDisableSave(_ => true)
    setIsDisableChange(_ => false)
    setIsShowEditDialog(true)
  }


  function onEditItem(item: Item): void
  {
    setIsSuggestedItem(_ => false)
    setIsDisableSave(_ => false)
    setIsDisableChange(_ => false)
    setSelectedSuggestedItem(_ => item)
    setEditedSuggestedItem(_ => item)

    setIsShowEditDialog(true)
  }


  const onAddItem = (item: Item): boolean =>
  {
    if (item.name === "")
    {
      const warningMessage = "Name cannot be empty"
      setWarningMessage(_ => warningMessage)
      return false
    }


    if (item.type === ItemType.ENTITY)
    {
      return addNodeEntity(item as Entity, 66, 66)
    }
    else if (item.type === ItemType.ATTRIBUTE)
    {
      const result = onAddAttributesToNode(item as Attribute)
      if (!result)
      {
        const warningMessage = "Attribute is already present"
        setWarningMessage(_ => warningMessage)

        // TODO: Return false
        // However, strict mode in reacts adds one attribute and then complains about the same attribute being already present
      }
    }
    else if (item.type === ItemType.RELATIONSHIP)
    {
      onAddRelationshipsToNodes(item as Relationship)
    }
    else
    {
      console.log("Unknown item type: ", item.type)
      return false
    }
    return true
  }
    
    
  return {
    parseSerializedConceptualModel, onEditItem, onAddNewAttribute, onSuggestItems, onSummaryPlainTextClick, capitalizeString,
    onClickAddNode, onEditSuggestion, onSummaryDescriptionsClick, onAddNewEntity, onAddNewRelationship, onAddItem, onAddAttributesToNode
  }
}

export default useConceptualModel