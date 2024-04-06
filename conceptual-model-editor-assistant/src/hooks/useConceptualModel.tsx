import { useCallback, useEffect, useState } from 'react';
import { useNodesState, useEdgesState, addEdge, Node, Edge, useOnSelectionChange, OnConnect, XYPosition } from 'reactflow';

import 'reactflow/dist/style.css';
import useUtility from './useUtility';
import useDomainDescription from './useDomainDescription';
import useFetchData from './useFetchData';
import { Button, Divider, Stack, Typography } from '@mui/material';
import { Attribute, Entity, Field, Item, ItemType, OriginalTextIndexesItem, Relationship, SerializedConceptualModel, UserChoice } from '../interfaces';
import AddIcon from '@mui/icons-material/Add';
import CustomNode from '../components/CustomNode';


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
  
    const [sourceEntity, setSourceEntity] = useState<string>("")
    const [targetEntity, setTargetEntity] = useState<string>("")
  
    const [isMultiSelection, setIsMultiSelection] = useState<boolean>(false);
    const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
    const [selectedEdges, setSelectedEdges] = useState<Edge[]>([]);

    const [isShowDialogDomainDescription, setIsShowDialogDomainDescription] = useState<boolean>(false)
    const [isShowDialogEdit, setIsShowDialogEdit] = useState<boolean>(false)

    const [inferenceIndexesMockUp, setInferenceIndexesMockUp] = useState<number[]>([])
    const [tooltips, setTooltips] = useState<string[]>([])

    const [userChoiceSuggestion, setUserChoiceSuggestion] = useState<string>("")

    const { domainDescription, isIgnoreDomainDescription, onDomainDescriptionChange, onIgnoreDomainDescriptionChange } = useDomainDescription()

    const { capitalizeString } = useUtility()

    const { isLoadingSuggestedItems, setIsLoadingSuggestedItems, isLoadingSummary1, isLoadingSummaryDescriptions, isLoadingEdit, summaryText, fetchSummary, fetchSummaryDescriptions, summaryDescriptions, 
            fetchNonStreamedData, fetchStreamedData, fetchStreamedDataGeneral, fetchMergedOriginalTexts }
            = useFetchData({ onProcessNonStreamedData, onProcessStreamedData, onProcessStreamedDataGeneral, onProcessMergedOriginalTexts })

    let IDToAssign = 0
    const BASE_URL = "http://127.0.0.1:5000/"


    const onConnect : OnConnect = useCallback(
        (params) => setEdges((edge) => addEdge(params, edge)),
        [setEdges],
      );
    
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

        // const input = { entities: [
        //     {name: "Engine", description: "", [Field.INFERENCE_INDEXES]: [], attributes: []},
        //     {name: "Manufacturer", description: "", [Field.INFERENCE_INDEXES]: [], attributes: []},
        //     {name: "Natural person", description: "", [Field.INFERENCE_INDEXES]: [], attributes: []},
        //     {name: "Business natural person", description: "", [Field.INFERENCE_INDEXES]: [], attributes: []},
        //     {name: "Road vehicle", description: "", [Field.INFERENCE_INDEXES]: [4, 10], attributes: []}],

        //               relationships: [
        //                 {"name": "manufactures", "source_entity": "manufacturer", "target_entity": "road vehicle", "inference": ""}]}

        // const input: SerializedConceptualModel = { "entities": [
        //   {name: "Student", "description": "", inferenceIndexes: [], "attributes": [
        //     {"ID": 0, "name": "name1", "inference": "student has a name", "dataType": "string", "description": "The name of the student."},
        //     {"ID": 1, "name": "name2", "inference": "student has a name", "dataType": "string", "description": "The name of the student."},
        //     {"ID": 2, "name": "name3", "inference": "student has a name", "dataType": "string", "description": "The name of the student."},
        //   ]}],
        //   "relationships": []
        // }
          
        const input : SerializedConceptualModel = { "entities": [
            {name: "Student", "description": "A student entity representing individuals enrolled in courses.", inferenceIndexes: [], "attributes": [{"ID": 0, "name": "name", "inference": "student has a name", "dataType": "string", "description": "The name of the student."}]},
            {name: "Course", "description": "A course entity representing educational modules.", inferenceIndexes: [], "attributes": [{"ID": 1, "name": "name", "inference": "courses have a name", "dataType": "string", "description": "The name of the course."}, {"ID": 2, "name": "number of credits", "inference": "courses have a specific number of credits", "dataType": "string", "description": "The number of credits assigned to the course."}]},
            {name: "Dormitory", "description": "A professor entity representing instructors teaching courses.", inferenceIndexes: [], "attributes": [{"ID": 3,"name": "price", "inference": "each dormitory has a price", "dataType": "int", "description": "The price of staying in the dormitory."}]},
            {name: "Professor", "description": "A dormitory entity representing residential facilities for students.", inferenceIndexes: [], "attributes": [{"ID": 4, "name": "name", "inference": "professors, who have a name", "dataType": "string", "description": "The name of the professor."}]}],
          "relationships": [{ID: 0, type: ItemType.RELATIONSHIP, name: "enrolled in", description: "", inference: "Students can be enrolled in any number of courses", inferenceIndexes: [], "source": "student", "target": "course", cardinality: ""},
                            {ID: 1, type: ItemType.RELATIONSHIP, "name": "accommodated in", description: "", "inference": "students can be accommodated in dormitories", inferenceIndexes: [], "source": "student", "target": "dormitory", cardinality: ""},
                            {ID: 2, type: ItemType.RELATIONSHIP, "name": "has", description: "", inference: "each course can have one or more professors", inferenceIndexes: [], "source": "course", "target": "professor", cardinality: ""},
                            {ID: 3, type: ItemType.RELATIONSHIP, "name": "is-a", description: "", inference: "", inferenceIndexes: [], "source": "student", "target": "person", cardinality: ""}
                          ]}

        const incrementX = 600
        const incrementY = 350
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

          const newNode : Node = { id: entityNameLowerCase, type: "customNode", position: { x: positionX, y: positionY },
                                   data: { description: entity.description,
                                           attributes: entity.attributes, [Field.INFERENCE_INDEXES]: entityObject.inferenceIndexes,
                                           onEdit: onEditItem } }
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


    function onProcessNonStreamedData(data: any, itemType: ItemType): void
    {
      for (let i = 0; i < data.length; i++)
        {
          const ID = assignID()
          data[i][Field.ID] = ID
          data[i][Field.TYPE] = itemType

          setSuggestedItems(previousSuggestedItems => {
            return [...previousSuggestedItems, data[i]]
          })
        }
    }

    function onProcessStreamedData(value: any, itemType: ItemType): void
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


    const onEditPlus = (name: string, field: Field) =>
    {
      const endpointName = "getOnly"
      const endpoint = BASE_URL + endpointName
      const headers = { "Content-Type": "application/json" }
      const bodyData = JSON.stringify({"attributeName": name, "sourceEntity": sourceEntity, "field": field, "domainDescription": domainDescription})

      setFieldToLoad(field)
      fetchStreamedDataGeneral(endpoint, headers, bodyData, name, field)
    }


  const onEditSave = (newItem: Item, oldItem: Item, isSuggestedItem: boolean): void =>
  {
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
    const newNode: Node = { id: newEntity.name, type: "customNode", position: oldNode.position, data: {
      [Field.ID]: 0, [Field.DESCRIPTION]: newEntity.description,
      [Field.INFERENCE]: newEntity.inference, [Field.INFERENCE_INDEXES]: newEntity.inferenceIndexes,
      attributes: oldNode.data.attributes, onEdit: onEditItem
    }}

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

      const newNode: Node = { id: oldNode.id, type: "customNode", position: oldNode.position, data: {
        [Field.ID]: 0, [Field.DESCRIPTION]: oldNode.data.description, [Field.INFERENCE]: oldNode.data.inference,
        [Field.INFERENCE_INDEXES]: oldNode.data.inferenceIndexes,
        attributes: newAttributes, onEdit: onEditItem
      }}

  
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
    let edgeToUpdate = edges.find(edge => edge.id === id)

    if (!edgeToUpdate)
    {
      return
    }

    // Create an updated version of the old edge
    let edgeToUpdateCopy: Edge = { ...edgeToUpdate}
    edgeToUpdateCopy.id = createEdgeID(newRelationship.source, newRelationship.target, newRelationship.name)
    edgeToUpdateCopy.label = newRelationship.name
    edgeToUpdateCopy.data.description = newRelationship.description
    edgeToUpdateCopy.data.cardinality = newRelationship.cardinality

    // TODO: Is the user allowed to change source and target?
    // If the source/target does not exist we need to create a new node
    edgeToUpdateCopy.source = newRelationship.source
    edgeToUpdateCopy.target = newRelationship.target


    setEdges((edges) => edges.map((currentEdge : Edge) =>
      {
        if (currentEdge.id === id)
        {
          return edgeToUpdateCopy
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

    const newNode: Node = { id: oldNode.id, type: "customNode", position: oldNode.position, data: {
      [Field.ID]: 0, [Field.DESCRIPTION]: oldNode.data.description, [Field.INFERENCE]: oldNode.data.inference,
      [Field.INFERENCE_INDEXES]: oldNode.data.inferenceIndexes,
      attributes: newAttributes, onEdit: onEditItem
    }}


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


    const onPlusButtonClick = (event : React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
    {
      if (isLoadingSuggestedItems)
      {
        alert("Another request is already being processed")
        return
      }

      const buttonText = event.currentTarget.innerText.toLowerCase()
      setUserChoiceSuggestion(buttonText)

      setIsLoadingSuggestedItems(_ => true)

      setSuggestedItems(_ => {return []})

      const endpointName = "suggest"
      const endpoint = BASE_URL + endpointName
      const currentDomainDesciption = isIgnoreDomainDescription ? "" : domainDescription
      const headers = { "Content-Type": "application/json" }
      const isFetchStreamData = true

      if (buttonText === UserChoice.ENTITIES)
      {
        // TODO: Define body field names such as `sourceEntity`, `targetEntity`, `userChoice`, ...
        const bodyData = JSON.stringify({"sourceEntity": "", "targetEntity": "", "userChoice": UserChoice.ENTITIES, "domainDescription": currentDomainDesciption})

        if (!isFetchStreamData)
        {
          fetchNonStreamedData(endpoint, headers, bodyData, ItemType.ENTITY)
        }
        else
        {
          fetchStreamedData(endpoint, headers, bodyData, ItemType.ENTITY)
        }
        return
      }

      if (!selectedNodes[0])
      {
        setIsLoadingSuggestedItems(_ => false)
        alert("No nodes selected")
        return
      }

      // TODO: is this code needed when we obtain the name from `selectedNodes[0].id.toLowerCase()`?
      setSourceEntity(_ => { return selectedNodes[0].id.toLowerCase() })

      if (selectedNodes.length === 2 && buttonText === "+Relationships")
      {
        setTargetEntity(_ => { return selectedNodes[1].id.toLowerCase() } )

        const sourceEntityName = selectedNodes[0].id.toLowerCase()
        const targetEntityName = selectedNodes[1].id.toLowerCase()
        const bodyData = JSON.stringify({"sourceEntity": sourceEntityName, "targetEntity": targetEntityName, "userChoice": UserChoice.RELATIONSHIPS2, "domainDescription": currentDomainDesciption})

        if (!isFetchStreamData)
        {
          fetchNonStreamedData(endpoint, headers, bodyData, ItemType.RELATIONSHIP)
        }
        else
        {
          fetchStreamedData(endpoint, headers, bodyData, ItemType.RELATIONSHIP)
        }
        return
      }

      if (selectedNodes.length > 2)
      {
        console.log("More than one node selected")
        return
      }
  
  
      let userChoice = UserChoice.ATTRIBUTES
      let itemType = ItemType.ATTRIBUTE

      if (buttonText === UserChoice.RELATIONSHIPS)
      {
        userChoice = UserChoice.RELATIONSHIPS
        itemType = ItemType.RELATIONSHIP
      }

      const entityName = selectedNodes[0].id.toLowerCase()
      const bodyData = JSON.stringify({"sourceEntity": entityName, "targetEntity": "", "userChoice": userChoice, "domainDescription": currentDomainDesciption})

      if (!isFetchStreamData)
      {
        fetchNonStreamedData(endpoint, headers, bodyData, itemType)
      }
      else
      {
        fetchStreamedData(endpoint, headers, bodyData, itemType)
      }
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
      parseSerializedConceptualModel()
    }, []);


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


    const addNode = (nodeID : string, positionX : number, positionY : number, attributes : Attribute[] = []) =>
    {
      // Do not add a new node if it already exists
      for (let i = 0; i < nodes.length; i++)
      {
        if (nodes[i].id === nodeID)
        {
          console.log("Node already exists")
          return
        }
      }

      const newNode: Node = { id: nodeID, type: "customNode", position: { x: positionX, y: positionY }, data: { attributes: attributes, onEdit: onEditItem } }
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


    const onAddItem = (item : Item, addAsDifferent : boolean = false) =>
    {
      if (item.type === ItemType.ENTITY)
      {
        onAddEntity(item as Entity)
      }
      else if (item.type === ItemType.ATTRIBUTE)
      {
        const attribute = item as Attribute
        if (addAsDifferent)
        {
          onAddAsRelationship(attribute)
        }
        else
        {
          onAddAttributesToNode(attribute)
        }
      }
      else if (item.type === ItemType.RELATIONSHIP)
      {
        const relationship = item as Relationship
        if (addAsDifferent)
        {
          onAddAsAttribute(relationship)
        }
        else
        {
          onAddRelationshipsToNodes(relationship)
        }
      }
      else
      {
       console.log("Unknown item type: ", item.type)
      }
    }


    const onAddEntity = (entity: Entity) =>
    {
      console.log("adding entities")
      addNode(entity.name, 66, 66)
    }


    const onAddAsRelationship = (attribute : Attribute) =>
    {
      const relationship : Relationship = {ID: attribute.ID, type: ItemType.RELATIONSHIP, name: "", description: attribute.description, inference: attribute.inference, inferenceIndexes: attribute.inferenceIndexes, 
                                            source: sourceEntity, target: attribute.name, cardinality: ""}
      
      setSelectedSuggestedItem(relationship)
      setIsShowDialogEdit(true)
    }


    const onAddAsAttribute = (relationship : Relationship) =>
    {
      const attribute : Attribute = {
        ID: relationship.ID, type: ItemType.ATTRIBUTE, name: relationship.target, description: relationship.description,
        dataType: "string", inference: relationship.inference, inferenceIndexes: relationship.inferenceIndexes,
        cardinality: "", source: relationship.source
      }

      setSelectedSuggestedItem(attribute)
      setIsShowDialogEdit(true)
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
      const nodeID = sourceEntity.toLowerCase()
      
      setNodes((nodes) => nodes.map((currentNode : Node) =>
      {
        // Skip nodes which are not getting a new attribute
        if (currentNode.id !== nodeID)
        {
          return currentNode;
        }

        const newAttributeObject : Attribute = {
          [Field.ID]: attribute.ID, [Field.TYPE]: ItemType.ATTRIBUTE, [Field.NAME]: attribute.name, [Field.DESCRIPTION]: "",
          [Field.INFERENCE]: attribute.inference, [Field.INFERENCE_INDEXES]: attribute.inferenceIndexes, [Field.DATA_TYPE]: attribute.dataType,
          [Field.CARDINALITY]: "", [Field.SOURCE_ENTITY]: currentNode.id
        }
  
        // If the node already contains the selected attribute do not add anything
        let isAttributePresent = false
        currentNode.data.attributes.forEach((attribute : Attribute) =>
        {
          if (attribute.name === newAttributeObject.name)
          {
            isAttributePresent = true
          }
        })
  
        if (isAttributePresent)
        {
          console.log("Attribute is already present")
          return currentNode;
        }

        const newAttributes = [...currentNode.data.attributes, newAttributeObject]
        const updatedNode : Node = { id: currentNode.id, type: "customNode", position: currentNode.position, data: { attributes: newAttributes, onEdit: onEditItem }}
  
        return updatedNode
      }));
    }
    
    const onAddRelationshipsToNodes = (relationshipObject : Relationship) =>
    {
      let sourceNodeID = relationshipObject.source?.toLowerCase()
      let targetNodeID = relationshipObject.target?.toLowerCase()

      // TODO: Try to find a way to make the code more compact
      if (!sourceNodeID)
      {
        sourceNodeID = ""
      }
      if (!targetNodeID)
      {
        targetNodeID = ""
      }
  
      // Return if the edge is already existing
      const newEdgeID = `${sourceNodeID},${targetNodeID}`
      for (let i = 0; i < edges.length; i++)
      {
        if (edges[i].id.toLowerCase() === newEdgeID)
        {
          console.log("Edge is already existing")
          return
        }
      }
      
      // Check if the target node is already existing
      let isTargetNodeCreated = false
      for (let i = 0; i < nodes.length; i++)
      {
        if (targetNodeID === nodes[i].id.toLowerCase())
        {
          isTargetNodeCreated = true
          break
        }
      }
  
      if (!isTargetNodeCreated)
      {
        const newNode = { id: targetNodeID, type: "customNode", position: { x: 500, y: 100 }, data: { attributes: [], onEdit: onEditItem} }
  
        setNodes(previousNodes => 
          {
            return [...previousNodes, newNode]
          })
        
        setNodes((nodes) => nodes.map((node) =>
        {
          if (node.id === targetNodeID)
          {
            console.log("Adding a new node")
            return node
          }
          return node
        }));
      }
  
      console.log("Adding a new edge")
      const newEdge : Edge = {
        id: newEdgeID, type: "custom-edge", source: sourceNodeID, target: targetNodeID, label: relationshipObject.name, data: {
          onEdit: onEditItem, [Field.NAME]: relationshipObject.name, [Field.DESCRIPTION]: relationshipObject.description, [Field.INFERENCE]: relationshipObject.inference,
          [Field.INFERENCE_INDEXES]: relationshipObject.inferenceIndexes }
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
        // console.log("Clearing all")
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
      setIsShowDialogEdit(false)
    }


    const onEditSuggestion = (itemID: number) : void =>
    {
      setIsSuggestedItem(_ => true)
      setSelectedSuggestedItem(_ => suggestedItems[itemID])
      setEditedSuggestedItem(_ => suggestedItems[itemID])

      setIsShowDialogEdit(true)
    }


    const onEditItem = (item: Item) : void =>
    {
      setIsSuggestedItem(_ => false)
      setSelectedSuggestedItem(_ => item)
      setEditedSuggestedItem(_ => item)

      setIsShowDialogEdit(true)
    }



    const onItemEdit = (field: Field, newValue : string) : void =>
    {
      setEditedSuggestedItem({...editedSuggestedItem, [field]: newValue})
    }


    const onShowInference = (itemID : number) =>
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
      const capitalizedSourceEntity : string = capitalizeString(sourceEntity)

      if (userChoiceSuggestion === UserChoice.ENTITIES)
      {
        tooltip = capitalizedSourceEntity
      }
      else if (userChoiceSuggestion === UserChoice.ATTRIBUTES)
      {
        tooltip = `${capitalizedSourceEntity}: ${suggestedItem.name}`
      }
      else if (userChoiceSuggestion === UserChoice.RELATIONSHIPS)
      {
        tooltip = `${capitalizedSourceEntity}-${targetEntity}: ${suggestedItem.name}`
      }

      let newTooltips : string[] = Array(suggestedItem.inferenceIndexes.length).fill(tooltip)
      setTooltips(newTooltips)
    }
    
    
    return { nodes, edges, onNodesChange, onEdgesChange, onConnect, onIgnoreDomainDescriptionChange, onImportButtonClick, onPlusButtonClick, onSummaryButtonClick,
        summaryText, capitalizeString, OnClickAddNode, domainDescription, isIgnoreDomainDescription, onDomainDescriptionChange, inferenceIndexesMockUp, isShowDialogEdit, onEditClose, onEditPlus, onEditSave,
        isLoadingSuggestedItems, suggestedItems, selectedSuggestedItem, editedSuggestedItem, userChoiceSuggestion, onEditSuggestion, onShowInference,
        isShowDialogDomainDescription, onOverlayDomainDescriptionOpen, onDialogDomainDescriptionClose, onHighlightSelectedItems, selectedNodes, sourceEntity, tooltips, onAddItem,
        regeneratedItem, onClearRegeneratedItem, isLoadingEdit, isLoadingSummary1, isLoadingSummaryDescriptions, fieldToLoad, onItemEdit, onConfirmRegeneratedText, onSummaryDescriptionsClick, summaryDescriptions,
        isSuggestedItem, onEditRemove, nodeTypes
    }
}

export default useConceptualModel