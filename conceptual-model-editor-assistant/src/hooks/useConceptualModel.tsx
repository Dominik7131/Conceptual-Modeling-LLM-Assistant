import { useCallback, useEffect, useState } from 'react';
import { useNodesState, useEdgesState, addEdge, Node, Edge, useOnSelectionChange, OnConnect } from 'reactflow';

import 'reactflow/dist/style.css';
import useUtility from './useUtility';
import useDomainDescription from './useDomainDescription';
import useFetchData from './useFetchData';
import { Button, Divider, Stack, Typography } from '@mui/material';
import { Attribute, Entity, Field, Item, ItemType, OriginalTextIndexesItem, Relationship, SerializedConceptualModel, UserChoice } from '../interfaces';
import AddIcon from '@mui/icons-material/Add';
import CustomNode from '../components/CustomNode';
import { ImageTwoTone } from '@mui/icons-material';


// Define the nodeTypes outside of the component to prevent re-renderings
// Or we can use `useMemo` inside the component
const nodeTypes = { customNode: CustomNode };


const useConceptualModel = () =>
{
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [fieldToLoad, setFieldToLoad] = useState<Field>(Field.ID)

  const [suggestedItems, setSuggestedItems] = useState<Item[]>([])

  // TODO: Do not use initial invalid item, instead make a type: Item | null
  const [selectedSuggestedItem, setSelectedSuggestedItem] = useState<Item>({ID: -1, type: ItemType.ENTITY, name: "", description: "", inference: "", inferenceIndexes: []})
  const [editedSuggestedItem, setEditedSuggestedItem] = useState<Item>({ID: -1, type: ItemType.ENTITY, name: "", description: "", inference: "", inferenceIndexes: []})
  const [regeneratedItem, setRegeneratedItem] = useState<Item>({ID: -1, type: ItemType.ENTITY, name: "", description: "", inference: "", inferenceIndexes: []})
  const [isSuggestedItem, setIsSuggestedItem] = useState(true)
  const [isDisableSave, setIsDisableSave] = useState(true)
  const [isDisableChange, setIsDisableChange] = useState(true)

  const [isMultiSelection, setIsMultiSelection] = useState<boolean>(false);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([]);

  const [isShowDialogDomainDescription, setIsShowDialogDomainDescription] = useState<boolean>(false)
  const [isShowDialogEdit, setIsShowDialogEdit] = useState<boolean>(false)
  const [isShowCreateEdgeDialog, setIsShowCreateEdgeDialog] = useState<boolean>(false)

  const [inferenceIndexesMockUp, setInferenceIndexesMockUp] = useState<number[]>([])
  const [tooltips, setTooltips] = useState<string[]>([])

  const { domainDescription, isIgnoreDomainDescription, onDomainDescriptionChange, onIgnoreDomainDescriptionChange } = useDomainDescription()

  const { capitalizeString } = useUtility()

  const { isLoadingSuggestedItems, isLoadingSummary1, isLoadingSummaryDescriptions, isLoadingEdit, summaryText, fetchSummary, fetchSummaryDescriptions, summaryDescriptions, 
          fetchStreamedData, fetchStreamedDataGeneral, fetchMergedOriginalTexts }
          = useFetchData({ onProcessStreamedData, onProcessStreamedDataGeneral, onProcessMergedOriginalTexts })

  let IDToAssign = 0

  const BASE_URL = "http://127.0.0.1:5000/"
  const SUGGEST_ITEMS_ENDPOINT = "suggest"
  const SUGGEST_ITEMS_URL = BASE_URL + SUGGEST_ITEMS_ENDPOINT
  const HEADER = { "Content-Type": "application/json" }

  const EDIT_ITEM_ENDPOINT = "getOnly"
  const EDIT_ITEM_URL = BASE_URL + EDIT_ITEM_ENDPOINT


  const onConnect : OnConnect = useCallback((params) =>
  { 
    const sourceEntityName = params.source
    const targetEntityName = params.target

    if (!sourceEntityName || !targetEntityName)
    {
      return 
    }

    const blankRelationship: Relationship = {
      [Field.ID]: -1, [Field.NAME]: "", [Field.DESCRIPTION]: "", [Field.INFERENCE]: "", [Field.INFERENCE_INDEXES]: [],
      [Field.TYPE]: ItemType.RELATIONSHIP, [Field.CARDINALITY]: "", [Field.SOURCE_ENTITY]: sourceEntityName,
      [Field.TARGET_ENTITY]: targetEntityName
    }

    setSelectedSuggestedItem(_ => blankRelationship)
    setEditedSuggestedItem(_ => blankRelationship)

    setIsShowCreateEdgeDialog(_ => true)

    // setEdges((edge) => addEdge(params, edge))

  }, [setEdges]);
  
  const onChange = useCallback(({ nodes, edges } : { nodes : Node[], edges : Edge[]}) =>
  {
    setSelectedNodes(nodes)
    setSelectedEdges(edges)

    if (nodes[1])
    {
      //console.log("Selected more than 1 node: ", nodes[0], nodes[1])
      setIsMultiSelection(true)
    }
    else
    {
      setIsMultiSelection(false)
    }

  }, []);
    
  // On nodes/edges selection: https://codesandbox.io/p/sandbox/elegant-silence-gtg683?file=%2Fsrc%2FFlow.tsx%3A81%2C1
  useOnSelectionChange({
    onChange
  });

  const parseSerializedConceptualModel = () =>
  {

    const input = { entities: [
        {name: "Engine", description: "", [Field.INFERENCE_INDEXES]: [], attributes: []},
        {name: "Manufacturer", description: "", [Field.INFERENCE_INDEXES]: [], attributes: []},
        {name: "Natural person", description: "", [Field.INFERENCE_INDEXES]: [], attributes: []},
        {name: "Business natural person", description: "", [Field.INFERENCE_INDEXES]: [], attributes: []},
        {name: "Road vehicle", description: "", [Field.INFERENCE_INDEXES]: [4, 10], attributes: []}],

                  relationships: [
                    {"name": "manufactures", "source": "manufacturer", "target": "road vehicle", "inference": ""}]}

    // const input: SerializedConceptualModel = { "entities": [
    //   {name: "Student", "description": "", inferenceIndexes: [], "attributes": [
    //     {"ID": 0, "name": "name1", "inference": "student has a name", "dataType": "string", "description": "The name of the student."},
    //     {"ID": 1, "name": "name2", "inference": "student has a name", "dataType": "string", "description": "The name of the student."},
    //     {"ID": 2, "name": "name3", "inference": "student has a name", "dataType": "string", "description": "The name of the student."},
    //   ]}],
    //   "relationships": []
    // }
      
    // const input : SerializedConceptualModel = { "entities": [
    //     {name: "Student", "description": "A student entity representing individuals enrolled in courses.", inferenceIndexes: [], "attributes": [{"ID": 0, "name": "name", "inference": "student has a name", "dataType": "string", "description": "The name of the student."}]},
    //     {name: "Course", "description": "A course entity representing educational modules.", inferenceIndexes: [], "attributes": [{"ID": 1, "name": "name", "inference": "courses have a name", "dataType": "string", "description": "The name of the course."}, {"ID": 2, "name": "number of credits", "inference": "courses have a specific number of credits", "dataType": "string", "description": "The number of credits assigned to the course."}]},
    //     {name: "Dormitory", "description": "A professor entity representing instructors teaching courses.", inferenceIndexes: [], "attributes": [{"ID": 3,"name": "price", "inference": "each dormitory has a price", "dataType": "number", "description": "The price of staying in the dormitory."}]},
    //     {name: "Professor", "description": "A dormitory entity representing residential facilities for students.", inferenceIndexes: [], "attributes": [{"ID": 4, "name": "name", "inference": "professors, who have a name", "dataType": "string", "description": "The name of the professor."}]}],
    //   "relationships": [{ID: 0, type: ItemType.RELATIONSHIP, name: "enrolled in", description: "", inference: "Students can be enrolled in any number of courses", inferenceIndexes: [], "source": "student", "target": "course", cardinality: ""},
    //                     {ID: 1, type: ItemType.RELATIONSHIP, "name": "accommodated in", description: "", "inference": "students can be accommodated in dormitories", inferenceIndexes: [], "source": "student", "target": "dormitory", cardinality: ""},
    //                     {ID: 2, type: ItemType.RELATIONSHIP, "name": "has", description: "", inference: "each course can have one or more professors", inferenceIndexes: [], "source": "course", "target": "professor", cardinality: ""},
    //                     {ID: 3, type: ItemType.RELATIONSHIP, "name": "is-a", description: "", inference: "", inferenceIndexes: [], "source": "student", "target": "person", cardinality: ""}
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
        [Field.ID]: 0, [Field.NAME]: entityNameLowerCase, [Field.TYPE]: ItemType.ENTITY, [Field.DESCRIPTION]: "", [Field.INFERENCE]: "",
        [Field.INFERENCE_INDEXES]: entity.inferenceIndexes}

      const newNode : Node = {
        id: entityNameLowerCase, type: "customNode", position: { x: positionX, y: positionY }, data: { description: entity.description,
        attributes: entity.attributes, [Field.INFERENCE_INDEXES]: entityObject.inferenceIndexes,
        onEdit: onEditItem, onSuggestItems: onSuggestItems, onAddNewAttribute: onAddNewAttribute }}

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
      const newEdge : Edge = { id: newID, source: relationship.source, target: relationship.target,
                                label: relationship.name, type: "custom-edge", data: { description: "", inference: relationship.inference, onEdit: onEditItem }}
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
          attributes.push({[Field.NAME]: attribute.name, [Field.INFERENCE]: attribute.inference})
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
        relationships.push({[Field.NAME]: edge.label, [Field.INFERENCE]: edge.data.inference, "sourceEntity": edge.source, "targetEntity": edge.target})
      }
    }

    result.relationships = relationships

    // console.log("CM: ", result)
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

    function onProcessStreamedDataGeneral(value: any, field: Field): void
    {
      // Convert the `value` to a string
      var jsonString = new TextDecoder().decode(value)
      console.log(jsonString)
      console.log("\n")

      const parsedData = JSON.parse(jsonString)
      setRegeneratedItem({...regeneratedItem, [field]: parsedData[field]})
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

      setInferenceIndexesMockUp(_ => originalTextIndexes)
      setTooltips(_ => tooltips)
    }


    


    const onImportButtonClick = () =>
    {
      parseSerializedConceptualModel()
    }


    const onEditPlus = (itemType: ItemType, name: string, sourceEntity: string, targetEntity: string, field: Field) =>
    {
      let userChoice = UserChoice.ENTITIES

      if (itemType === ItemType.ATTRIBUTE)
      {
        userChoice = UserChoice.ATTRIBUTES 
      }
      else if (itemType === ItemType.RELATIONSHIP)
      {
        userChoice = UserChoice.RELATIONSHIPS
      }

      if (!sourceEntity) { sourceEntity = "" }
      if (!targetEntity) { targetEntity = "" }

      const bodyData = JSON.stringify({
        "name": name, "sourceEntity": sourceEntity, "targetEntity": targetEntity, "field": field, "userChoice": userChoice,
        "domainDescription": domainDescription
      })

      setFieldToLoad(field)
      fetchStreamedDataGeneral(EDIT_ITEM_URL, HEADER, bodyData, name, field)
    }


  const onEditSave = (newItem: Item, oldItem: Item, isSuggestedItem: boolean): void =>
  {
    if (!newItem.name)
    {
      alert("Name cannot be empty")
      return
    }

    setIsShowDialogEdit(_ => false)

    if (isSuggestedItem)
    {
      // TODO: instead of selectedSuggestedItem have only ID saved
      setSelectedSuggestedItem(newItem)

      setSuggestedItems(suggestedItems.map(item => 
      {
        if (item.ID === newItem.ID)
        {
          return newItem
        }
        return item
      }))
      
      return
    }

    if (newItem.type === ItemType.ENTITY)
    {
      editNodeEntity(newItem as Entity, oldItem as Entity)
    }
    else if (newItem.type === ItemType.ATTRIBUTE)
    {
      editNodeAttribute(newItem as Attribute, oldItem as Attribute)
    }
    else if (newItem.type === ItemType.RELATIONSHIP)
    {
      editEdgeRelationship(newItem as Relationship, oldItem as Relationship)
    }
    else
    {
      alert("Unknown action")
    }
  }

  const onEditRemove = (item: Item): void =>
  {
    if (item.type === ItemType.ENTITY)
    {
      const nodeID = item.name
      removeNode(nodeID)
    }
    else if (item.type === ItemType.ATTRIBUTE)
    {
      removeNodeAttribute(item as Attribute)
    }
    else if (item.type === ItemType.RELATIONSHIP)
    {
      const relationship: Relationship = (item as Relationship)
      const edgeID = createEdgeID(relationship.source, relationship.target, relationship.name)
      removeEdge(edgeID)
    }
    else
    {
      alert("Unknown action")
    }
  }

  
  const createEdgeID = (source: string, target: string, name: string): string =>
  {
    return `${source}-${name}-${target}`
  }


  const editNodeEntity = (newEntity: Entity, oldEntity: Entity): void =>
  {
    const id: string = oldEntity.name
    const oldNode = nodes.find(node => node.id === id)

    if (!oldNode)
    {
      return
    }

    // Create an updated version of the old entity
    const newData = {
      ...oldNode.data, description: newEntity.description, inference: newEntity.inference, inference_indexes: newEntity.inferenceIndexes
    }
    const newNode: Node = {...oldNode, id: newEntity.name, data: newData}


    if (newEntity.name !== oldEntity.name)
    {
      // Update all edges that connect to the changed source or target entity
      setEdges((edges) => edges.map((currentEdge: Edge) =>
      {
        if (currentEdge.source === oldEntity.name)
        {
          return { ...currentEdge, id: createEdgeID(newEntity.name, currentEdge.target, currentEdge.data.label), source: newEntity.name }
        }
        else if (currentEdge.target === oldEntity.name)
        {
          return { ...currentEdge, id: createEdgeID(currentEdge.source, newEntity.name, currentEdge.data.label), target: newEntity.name }
        }
        return currentEdge
      }))
    }

    setNodes((nodes) => nodes.map((currentNode : Node) =>
      {
        if (currentNode.id === id)
        {
          return newNode
        }
        else
        {
          return currentNode
        }
      }))
  }


  const editNodeAttribute = (newAttribute: Attribute, oldAttribute: Attribute): void =>
  {
      const id: string = oldAttribute.source
      const oldNode = nodes.find(node => node.id === id)
  
      if (!oldNode)
      {
        return
      }

      const newAttributes = oldNode.data.attributes.map((attribute: Attribute) =>
      {
        if (attribute.name === oldAttribute.name)
        {
          return newAttribute
        }
        else
        {
          return attribute
        }
      })

      const newData = { ...oldNode.data, attributes: newAttributes}
      const newNode: Node = { ...oldNode, data: newData}

  
      setNodes((nodes) => nodes.map((currentNode: Node) =>
      {
        if (currentNode.id === id)
        {
          return newNode
        }
        else
        {
          return currentNode
        }
      }))
  }


  const editEdgeRelationship = (newRelationship: Relationship, oldRelationship : Relationship): void =>
  {
    // Find the right edge based on the old ID
    const id: string = createEdgeID(oldRelationship.source, oldRelationship.target, oldRelationship.name)
    let oldEdge = edges.find(edge => edge.id === id)

    if (!oldEdge)
    {
      return
    }

    // Create an updated version of the old edge
    let newEdge: Edge = { ...oldEdge}
    newEdge.id = createEdgeID(newRelationship.source, newRelationship.target, newRelationship.name)
    newEdge.label = newRelationship.name
    newEdge.data.description = newRelationship.description
    newEdge.data.cardinality = newRelationship.cardinality
    newEdge.data.inference = newRelationship.inference

    // TODO: Is the user allowed to change source and target?
    // If the source/target does not exist we need to create a new node
    newEdge.source = newRelationship.source
    newEdge.target = newRelationship.target


    setEdges((edges) => edges.map((currentEdge : Edge) =>
      {
        if (currentEdge.id === id)
        {
          return newEdge
        }
        else
        {
          return currentEdge
        }
      }))
  }


  const removeNode = (nodeID: string): void =>
  {
    setNodes(nodes.filter(node => node.id !== nodeID))
  }


  const removeEdge = (edgeID: string): void =>
  {
    setEdges(edges.filter(edge => edge.id !== edgeID))
  }


  const removeNodeAttribute = (attribute: Attribute): void =>
  {
    const nodeID: string = attribute.source
    let oldNode = nodes.find(node => node.id === nodeID)

    if (!oldNode)
    {
      return 
    }

    const newAttributes = oldNode.data.attributes.filter((element: Attribute) => element.name !== attribute.name)
    const newData = { ...oldNode.data, attributes: newAttributes }
    const newNode = { ...oldNode, data: newData }


    setNodes((nodes) => nodes.map((currentNode : Node) =>
      {
        if (currentNode.id === nodeID)
        {
          return newNode
        }
        else
        {
          return currentNode
        }
      }))
  }


  const onSuggestItems = (userChoice: UserChoice, sourceItemName: string | null, targetItemName: string | null): void =>
  {
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

    console.log("Item type: ", itemType)


    sourceItemName = sourceItemName !== null ? sourceItemName : ""
    targetItemName = targetItemName !== null ? targetItemName : ""
    const bodyData = JSON.stringify({"sourceEntity": sourceItemName, "targetEntity": targetItemName, "userChoice": userChoice, "domainDescription": currentDomainDescription})

    fetchStreamedData(SUGGEST_ITEMS_URL, HEADER, bodyData, sourceItemName, itemType)
  }


  const onAddNewEntity = () : void =>
  {
    const blankEntity: Entity = {
      [Field.ID]: -1, [Field.NAME]: "", [Field.DESCRIPTION]: "", [Field.INFERENCE]: "", [Field.INFERENCE_INDEXES]: [],
      [Field.TYPE]: ItemType.ENTITY,
    }

    setIsSuggestedItem(_ => true)
    setIsDisableSave(_ => true)
    setIsDisableChange(_ => true)
    setSelectedSuggestedItem(_ => blankEntity)
    setEditedSuggestedItem(_ => blankEntity)

    setIsShowDialogEdit(true)
  }


  const onAddNewAttribute = (sourceEntity: Entity) : void =>
  {
    const blankAttribute: Attribute = {
      [Field.ID]: -1, [Field.NAME]: "", [Field.DESCRIPTION]: "", [Field.DATA_TYPE]: "", [Field.INFERENCE]: "", [Field.INFERENCE_INDEXES]: [],
      [Field.TYPE]: ItemType.ATTRIBUTE, [Field.CARDINALITY]: "", [Field.SOURCE_ENTITY]: sourceEntity.name
    }

    setIsSuggestedItem(_ => true)
    setIsDisableSave(_ => true)
    setIsDisableChange(_ => true)
    setSelectedSuggestedItem(_ => blankAttribute)
    setEditedSuggestedItem(_ => blankAttribute)

    setIsShowDialogEdit(true)
  }


  const onAddNewRelationship = () : void =>
  {
    setIsSuggestedItem(_ => true)
    setIsDisableSave(_ => true)
    setIsDisableChange(_ => true)

    setIsShowDialogEdit(true)
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


  const onSummaryDescriptionsClick = () : void =>
  {
    if (selectedNodes.length === 0)
    {
      alert("Nothing was selected")
      return
    }

    const endpoint = BASE_URL + "summary2"
    const headers = { "Content-Type": "application/json" }
    const conceptualModel = convertConceptualModelToJSON(true)
    const bodyData = JSON.stringify({"conceptualModel": conceptualModel, "domainDescription": domainDescription})

    fetchSummaryDescriptions(endpoint, headers, bodyData)
  }


  const onHighlightSelectedItems = () =>
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

        if (!element.inferenceIndexes)
        {
          continue
        }

        // Process each original text indexes for the given attribute
        for (let k = 0; k < element.inferenceIndexes.length; k += 2)
        {
          const ii1: number = element.inferenceIndexes[k]
          const ii2: number = element.inferenceIndexes[k + 1]

          originalTextsIndexesObjects.push( { indexes: [ii1, ii2], label: `${entityName}: ${element.name}`} )
        }
      }


      if (!selectedNodes[i].data.inferenceIndexes)
      {
        continue
      }

      // Process each original text indexes for the given entity 
      for (let k = 0; k < selectedNodes[i].data.inferenceIndexes.length; k += 2)
      {
        const ii1 : number = selectedNodes[i].data.inferenceIndexes[k]
        const ii2 : number = selectedNodes[i].data.inferenceIndexes[k + 1]

        originalTextsIndexesObjects.push( { indexes: [ii1, ii2], label: `Entity: ${selectedNodes[i].id}`} )
      }
    }

    // Process also all selected edges
    for (let i = 0; i < selectedEdges.length; i++)
    {
      if (!selectedEdges[i].data.inferenceIndexes)
      {
        continue
      }

      // Process each original text indexes for the given edge 
      for (let k = 0; k < selectedEdges[i].data.inferenceIndexes.length; k += 2)
      {
        const ii1 : number = selectedEdges[i].data.inferenceIndexes[k]
        const ii2 : number = selectedEdges[i].data.inferenceIndexes[k + 1]

        originalTextsIndexesObjects.push( { indexes: [ii1, ii2], label: `${selectedEdges[i].source} – ${selectedEdges[i].data.name} – ${selectedEdges[i].target}`} )
      }
    }

    const endpoint = "merge_original_texts"
    const url = BASE_URL + endpoint
    const headers = { "Content-Type": "application/json" }
    const bodyData = JSON.stringify({ "originalTextIndexesObject": originalTextsIndexesObjects})

    fetchMergedOriginalTexts(url, headers, bodyData)


    setIsShowDialogDomainDescription(true)
  }

  useEffect(() =>
  {
    // Dependency: domain description
    // Otherwise when suggesting attributes/relationships through function in node.data.suggestItems(...)
    // The function doesn't know about the newest domain description

    // Note: But now when domain description changes it resets our whole conceptual model
    // Also when adding a new entities and then changing domain description these entities won't get updated

    parseSerializedConceptualModel()
  }, [domainDescription]);


  useEffect(() =>
  {
    let domainDescriptionText = document.getElementById("domainDescriptionText")

    if (!domainDescriptionText)
    {
      return
    }
  }, [isIgnoreDomainDescription]);


  useEffect(() =>
  {
    if (!isShowDialogDomainDescription)
    {
      return
    }

    // Scroll down to the first highlighted inference in the dialog
    // We need to wait for few miliseconds to let the dialog render
    // TODO: Try to come up with solution that doesn't need any hardcoded timeout
    const delay = async () =>
    {
      await new Promise(resolve => setTimeout(resolve, 200));

      let highlightedText = document.getElementById("highlightedInference-1")
      // console.log("Trying to scroll", highlightedText)

      if (highlightedText)
      {
        highlightedText.scrollIntoView( { behavior: 'smooth', block: 'center'})
      }
    };

    delay()

  }, [isShowDialogDomainDescription])


    // useEffect(() =>
    // {
    //   console.log("Nodes: ", nodes)
    // }, [nodes]);

    // useEffect(() =>
    // {
    //   console.log("Edges: ", edges)
    // }, [edges]);


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
    const newNode: Node = {
      id: nodeID, type: "customNode", position: { x: positionX, y: positionY },
      data: { attributes: [], onEdit: onEditItem, onSuggestItems: onSuggestItems, onAddNewAttribute: onAddNewAttribute }
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
      return
    }

    const newNode: Node = {
      id: entity.name, type: "customNode", position: { x: positionX, y: positionY },
      data: { [Field.DESCRIPTION]: entity.description, [Field.INFERENCE]: entity.inference, [Field.INFERENCE_INDEXES]: [], attributes: [], 
        onEdit: onEditItem, onSuggestItems: onSuggestItems, onAddNewAttribute: onAddNewAttribute } }

    setNodes(previousNodes => {
      return [...previousNodes, newNode]
    })
  }


  const onOverlayDomainDescriptionOpen = () =>
  {
    setIsShowDialogDomainDescription(true)
  }


  const onDialogDomainDescriptionClose = () =>
  {
    setIsShowDialogDomainDescription(false)
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

      onAddEntity(item as Entity)
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

    setIsShowDialogEdit(false)
  }


  const onChangeItemType = (item: Item): void =>
  {
    // If the item is attribute then transform it into relationship
    // Otherwise transform relationsip into attribute

    if (item.type === ItemType.ATTRIBUTE)
    {
      const oldAttribute = item as Attribute

      const relationship : Relationship = {
        ID: oldAttribute.ID, type: ItemType.RELATIONSHIP, name: "", description: oldAttribute.description,
        inference: oldAttribute.inference, inferenceIndexes: oldAttribute.inferenceIndexes, source: oldAttribute.source,
        target: oldAttribute.name, cardinality: ""}

      setSelectedSuggestedItem(_ => relationship)
      setEditedSuggestedItem(_ => relationship)
    }
    else
    {
      const oldRelationship = item as Relationship

      const attribute : Attribute = {
        ID: oldRelationship.ID, type: ItemType.ATTRIBUTE, name: oldRelationship.target, description: oldRelationship.description,
        dataType: "string", inference: oldRelationship.inference, inferenceIndexes: oldRelationship.inferenceIndexes,
        cardinality: "", source: oldRelationship.source
      }

      setSelectedSuggestedItem(_ => attribute)
      setEditedSuggestedItem(_ => attribute)
    }
  }


  const onAddEntity = (entity: Entity) =>
  {
    addNodeEntity(entity, 66, 66)
  }


  const OnClickAddNode = (nodeName : string) =>
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
      const newData = { ...currentNode.data, attributes: newAttributes }
      const updatedNode: Node = {...currentNode, data: newData}

      return updatedNode
    }));
  }


  const doesEdgeAlreadyExist = (edgeID: string): boolean =>
  {
    for (let i = 0; i < edges.length; i++)
    {
      if (edges[i].id === edgeID)
      {
        return true
      }
    }
    
    return false
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
    const edgeData = {
      [Field.NAME]: relationship.name, [Field.DESCRIPTION]: relationship.description, [Field.INFERENCE]: relationship.inference,
      [Field.INFERENCE_INDEXES]: relationship.inferenceIndexes, [Field.CARDINALITY]: relationship.cardinality, onEdit: onEditItem
    }

    const newEdge : Edge = {
      id: newEdgeID, type: "custom-edge", source: sourceNodeID, target: targetNodeID, label: relationship.name, data: edgeData
    }

    setEdges(previousEdges =>
    {
      return [...previousEdges, newEdge]
    })
  }


    const onClearRegeneratedItem = (field: Field | null, isClearAll: boolean) : void=>
    {
      if (isClearAll)
      {
        setEditedSuggestedItem({ID: -1, type: ItemType.ENTITY, name: "", description: "", inference: "", inferenceIndexes: [], dataType: "", cardinality: ""})
        setRegeneratedItem({ID: -1, type: ItemType.ENTITY, name: "", description: "", inference: "", inferenceIndexes: [], dataType: "", cardinality: ""})
      }

      if (!field)
      {
        return
      }

      if (regeneratedItem.hasOwnProperty(field))
      {
        setRegeneratedItem({...regeneratedItem, [field]: "" })
      }
    }


    const onConfirmRegeneratedText = (field : Field) =>
    {
      if (regeneratedItem.hasOwnProperty(field))
      {
        // Set type to "any" because Typescript doesn't recognise that we already did the check
        // Otherwise we need to write an if-statement for each field of type Item
        setEditedSuggestedItem({...editedSuggestedItem, [field]: (regeneratedItem as any)[field]})
      }

      onClearRegeneratedItem(field, false)
    }


    const onEditClose = () =>
    {
      onClearRegeneratedItem(null, true)
      setIsShowDialogEdit(_ => false)
    }

    const onDialogCreateEdgeClose = () =>
    {
      setIsShowCreateEdgeDialog(_ => false)
    }


    const onEditSuggestion = (itemID: number) : void =>
    {
      setIsSuggestedItem(_ => true)
      setIsDisableSave(_ => false)
      setIsDisableChange(_ => false)
      setSelectedSuggestedItem(_ => suggestedItems[itemID])
      setEditedSuggestedItem(_ => suggestedItems[itemID])

      setIsShowDialogEdit(true)
    }


    const onEditItem = (item: Item) : void =>
    {
      setIsSuggestedItem(_ => false)
      setIsDisableSave(_ => false)
      setIsDisableChange(_ => false)
      setSelectedSuggestedItem(_ => item)
      setEditedSuggestedItem(_ => item)

      setIsShowDialogEdit(true)
    }



    const onItemEdit = (field: Field, newValue : string) : void =>
    {
      setEditedSuggestedItem({...editedSuggestedItem, [field]: newValue})
    }


    const onHighlightSingleItem = (itemID : number) =>
    {
      // TODO: probably add to method argument "isAttribute" similar to `editSuggestion` method in Sidebar.tsx
      // TODO: probably move this function into file `useInferenceIndexes.tsx`

      setIsShowDialogDomainDescription(_ => true)

      // Find the suggested item with ID: itemID

      const suggestedItem : Item | undefined = suggestedItems.find(item => item.ID === itemID);

      if (!suggestedItem)
      {
        alert("Error: Suggested item not found by the given ID")
        return
      }

      setSelectedSuggestedItem(suggestedItem)

      setInferenceIndexesMockUp(_ => suggestedItem.inferenceIndexes)

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

      let newTooltips : string[] = Array(suggestedItem.inferenceIndexes.length).fill(tooltip)
      setTooltips(newTooltips)
    }
    
    
    return { nodes, edges, onNodesChange, onEdgesChange, onConnect, onIgnoreDomainDescriptionChange, onImportButtonClick, onSuggestItems, onSummaryButtonClick,
        summaryText, capitalizeString, OnClickAddNode, domainDescription, isIgnoreDomainDescription, onDomainDescriptionChange, inferenceIndexesMockUp, isShowDialogEdit, onEditClose, onEditPlus, onEditSave,
        isLoadingSuggestedItems, suggestedItems, selectedSuggestedItem, editedSuggestedItem, onEditSuggestion, onHighlightSingleItem,
        isShowDialogDomainDescription, onOverlayDomainDescriptionOpen, onDialogDomainDescriptionClose, onHighlightSelectedItems, selectedNodes, tooltips, onAddItem,
        regeneratedItem, onClearRegeneratedItem, isLoadingEdit, isLoadingSummary1, isLoadingSummaryDescriptions, fieldToLoad, onItemEdit, onConfirmRegeneratedText, onSummaryDescriptionsClick, summaryDescriptions,
        isSuggestedItem, onEditRemove, nodeTypes, onAddNewEntity, isDisableSave, isDisableChange, onDialogCreateEdgeClose,
        isShowCreateEdgeDialog, onAddNewRelationship, onChangeItemType
    }
}

export default useConceptualModel