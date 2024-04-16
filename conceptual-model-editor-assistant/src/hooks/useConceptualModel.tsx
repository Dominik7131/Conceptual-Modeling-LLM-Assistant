import { useEffect } from 'react';
import { Node, Edge } from 'reactflow';

import 'reactflow/dist/style.css';
import { BASE_URL, HEADER, capitalizeString, createEdgeID } from './useUtility';
import useFetchData from './useFetchData';
import { Attribute, ConceptualModelJson, EdgeData, Entity, Field, Item, ItemType, NodeData, Relationship, UserChoice } from '../interfaces';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { domainDescriptionState, edgesState, editedSuggestedItemState, isDisableChangeState, isDisableSaveState, isIgnoreDomainDescriptionState, isShowCreateEdgeDialogState, isShowEditDialogState, isShowHighlightDialogState, isSuggestedItemState, nodesState, originalTextIndexesListState, selectedEdgesState, selectedNodesState, selectedSuggestedItemState, suggestedItemsState, tooltipsState } from '../atoms';


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

  const nodes = useRecoilValue(nodesState)
  const selectedNodes = useRecoilValue(selectedNodesState)
  const selectedEdges = useRecoilValue(selectedEdgesState)

  const setIsShowEditDialog = useSetRecoilState(isShowEditDialogState)
  const setIsShowCreateEdgeDialog = useSetRecoilState(isShowCreateEdgeDialogState)

  const domainDescription = useRecoilValue(domainDescriptionState)
  const isIgnoreDomainDescription = useRecoilValue(isIgnoreDomainDescriptionState)

  const { fetchSummary, fetchSummaryDescriptions, fetchStreamedData } = useFetchData({ onProcessStreamedData })

  let IDToAssign = 0

  const SUGGEST_ITEMS_ENDPOINT = "suggest"
  const SUGGEST_ITEMS_URL = BASE_URL + SUGGEST_ITEMS_ENDPOINT
  

  const onImport = (conceptualModelJson: ConceptualModelJson) =>
  {
    const incrementX = 500
    const incrementY = 200
    let positionX = 100
    let positionY = 100
    let newNodes : Node[] = []
    let newEdges : Edge[] = []

    if (!conceptualModelJson.attributes) { conceptualModelJson.attributes = [] }
    if (!conceptualModelJson.relationships) { conceptualModelJson.relationships = [] }
    if (!conceptualModelJson.generalizations) { conceptualModelJson.generalizations = [] }


    for (const [key, entity] of Object.entries(conceptualModelJson.classes))
    {
      const entityNameLowerCase = entity.title.toLowerCase()

      const newEntity: Entity = {
        [Field.TYPE]: ItemType.ENTITY, [Field.ID]: 0, [Field.NAME]: entity.title, [Field.DESCRIPTION]: entity.description,
        [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: []
      }

      const nodeData : NodeData = { entity: newEntity, attributes: [] }

      const newNode : Node = {
        id: entityNameLowerCase, type: "customNode", position: { x: positionX, y: positionY }, data: nodeData
      }

      positionX += incrementX

      if (positionX >= 1300)
      {
        positionX = 100
        positionY += incrementY
      }

      newNodes.push(newNode)
    }

    setNodes(() => { return newNodes })


    for (const [_, attribute] of Object.entries(conceptualModelJson.attributes))
    {
      const sourceEntityLowerCase = attribute.domain.toLowerCase()
      const attributeNameLowerCase = attribute.title.toLowerCase()

      const newAttribute: Attribute = {
        [Field.ID]: 0, [Field.NAME]: attributeNameLowerCase, [Field.TYPE]: ItemType.ATTRIBUTE, [Field.DESCRIPTION]: "",
        [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: [], [Field.SOURCE_ENTITY]: sourceEntityLowerCase,
        [Field.DATA_TYPE]: "", [Field.CARDINALITY]: attribute.domainCardinality
      }


      for (let i = 0; i < newNodes.length; i++)
      {
        const entityName = newNodes[i].id

        if (entityName === newAttribute[Field.SOURCE_ENTITY])
        {
          onAddAttributesToNode(newAttribute)
        }
      }
    }
  
    for (const [_, relationship] of Object.entries(conceptualModelJson.relationships))
    {
      // const newRelationship: Relationship = { }
      const nameLowerCase = relationship.title.toLowerCase()
      const sourceEntityLowerCase = relationship.domain.toLowerCase()
      const targetEntityLowerCase = relationship.range.toLowerCase()

      const newRelationship: Relationship = {
        [Field.ID]: 0, [Field.TYPE]: ItemType.RELATIONSHIP, [Field.NAME]: nameLowerCase, [Field.DESCRIPTION]: "",
        [Field.SOURCE_ENTITY]: sourceEntityLowerCase, [Field.TARGET_ENTITY]: targetEntityLowerCase,
        [Field.CARDINALITY]: "", [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: []
      }

      const edgeData: EdgeData = { relationship: newRelationship }

      const newID: string = createEdgeID(sourceEntityLowerCase, targetEntityLowerCase, nameLowerCase)
      const newEdge : Edge = {
        id: newID, source: sourceEntityLowerCase, target: targetEntityLowerCase, type: "custom-edge",
        data: edgeData
      }

      newEdges.push(newEdge)
    }

    for (const [_, generalization] of Object.entries(conceptualModelJson.generalizations))
    {
      // const newRelationship: Relationship = { }
      const nameLowerCase = generalization.title.toLowerCase()
      const sourceEntityLowerCase = generalization.specialClass.toLowerCase()
      const targetEntityLowerCase = generalization.generalClass.toLowerCase()

      const newRelationship: Relationship = {
        [Field.ID]: 0, [Field.TYPE]: ItemType.RELATIONSHIP, [Field.NAME]: nameLowerCase, [Field.DESCRIPTION]: "",
        [Field.SOURCE_ENTITY]: sourceEntityLowerCase, [Field.TARGET_ENTITY]: targetEntityLowerCase,
        [Field.CARDINALITY]: "", [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: []
      }

      const edgeData: EdgeData = { relationship: newRelationship }

      const newID: string = createEdgeID(sourceEntityLowerCase, targetEntityLowerCase, nameLowerCase)
      const newEdge : Edge = {
        id: newID, source: sourceEntityLowerCase, target: targetEntityLowerCase, type: "custom-edge",
        data: edgeData
      }

      newEdges.push(newEdge)
    }

    setEdges(() => { return newEdges })
  }

  const convertConceptualModelToJson = (): string =>
  {
    // TODO: Iterate over each node to get all "classes" and "attributes"

    // TODO: Iterate over each edge to get all "relationships" and "generalizations"

    return '{"classes": [{"iri": "engine-iri", "title": "engine", "description": ""}]}'
  }


  const onExport = () =>
  {
    const content = convertConceptualModelToJson()
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = "export.json"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }


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
        [Field.CARDINALITY]: "", [Field.ORIGINAL_TEXT]: relationship.originalText, [Field.ORIGINAL_TEXT_INDEXES]: []
      }
      const edgeData: EdgeData = { relationship: newRelationship }

      const newEdge: Edge = {
        id: newID, source: relationship.source, target: relationship.target, type: "custom-edge",
        data: edgeData
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


  const onSuggestItems = (userChoice: UserChoice, sourceItemName: string | null, targetItemName: string | null): void =>
  {
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

  const doesNodeAlreadyExist = (nodeID: string): boolean =>
  {
    for (let i = 0; i < nodes.length; i++)
    {
      if (nodes[i].id === nodeID.toLowerCase())
      {
        console.log("Node already exists")
        return true
      }
    }

    return false
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
  
      const nodeData: NodeData = { entity: entity, attributes: [] }
  
      const newNode: Node = {
        id: entity.name, type: "customNode", position: { x: positionX, y: positionY },
        data: nodeData
      }
  
      setNodes(previousNodes => {
        return [...previousNodes, newNode]
      })
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

    const edgeData: EdgeData = { relationship: relationship }

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


  function onEditItem(item: Item): void
  {
    setIsSuggestedItem(_ => false)
    setIsDisableSave(_ => false)
    setIsDisableChange(_ => false)
    setSelectedSuggestedItem(_ => item)
    setEditedSuggestedItem(_ => item)

    setIsShowEditDialog(true)
  }


  const onAddItem = (item: Item) =>
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
    
    
  return {
    parseSerializedConceptualModel, onEditItem, onAddNewAttribute, onSuggestItems, onSummaryButtonClick, capitalizeString,
    onClickAddNode, onEditSuggestion, onSummaryDescriptionsClick, onAddNewEntity, onAddNewRelationship, onAddItem, onImport, onExport
  }
}

export default useConceptualModel