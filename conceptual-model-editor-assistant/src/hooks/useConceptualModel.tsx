import { useCallback, useEffect, useState } from 'react';
import { useNodesState, useEdgesState, addEdge, Node, Edge, useOnSelectionChange, OnConnect } from 'reactflow';

import 'reactflow/dist/style.css';
import useUtility from './useUtility';
import useDomainDescription from './useDomainDescription';
import useFetchData from './useFetchData';
import { Typography } from '@mui/material';
import { Attribute, Entity, Field, Item, ItemType, Relationship, UserChoice } from '../App';

const initialNodes : Node[] = [{ id: 'engine', position: { x: 100, y: 100 }, data: { label: "", attributes: [] } }, ];


const useConceptualModel = () =>
{
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isLoadingEdit, setIsLoadingEdit] = useState<boolean>(false)
    const [fieldToLoad, setFieldToLoad] = useState<Field>(Field.ID)

    const [suggestedItems, setSuggestedItems] = useState<Item[]>([])
    // TODO: Do not use initial invalid item, instead make a type: Item | null
    const [selectedSuggestedItem, setSelectedSuggestedItem] = useState<Item>({ID: -1, type: ItemType.ENTITY, name: "", description: "", inference: "", inferenceIndexes: []})
    const [editedSuggestedItem, setEditedSuggestedItem] = useState<Item>({ID: -1, type: ItemType.ENTITY, name: "", description: "", inference: "", inferenceIndexes: []})
    const [regeneratedItem, setRegeneratedItem] = useState<Item>({ID: -1, type: ItemType.ENTITY, name: "", description: "", inference: "", inferenceIndexes: []})
  
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

    const { isLoadingSummary1, isLoadingSummaryDescriptions, summaryText, fetchSummary, fetchSummaryDescriptions, summaryDescriptions } = useFetchData()

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
        // const input = { "entities": [ {name: "Engine", description: "", attributes: []},
        //                               {name: "Bodywork", description: "", attributes: []},
        //                               {name: "Natural person", description: "", attributes: []},
        //                               {name: "Vehicle", description: "", attributes: []},
        //                               {name: "Road vehicle", description: "", attributes: []},
        //                               {name: "Registration", description: "", attributes: []},
        //                               {name: "Insurance contract", description: "", attributes: []},
        //                               {name: "Technical inspection", description: "", attributes: []}],
        //                 "relationships": [{name: "is-a", inference: "", source_entity: "vehicle", target_entity: "road vehicle"}]}

        const input = { entities: [
            {name: "Engine", description: "", attributes: []},
            {name: "Natural person", description: "", attributes: [{ID: 0, type: ItemType.ATTRIBUTE, name: "name", dataType: "string"},
                                                                    {ID: 1, type: ItemType.ATTRIBUTE, name: "birth number", dataType: "number"},
                                                                    {ID: 2, type: ItemType.ATTRIBUTE, name: "date of birth", dataType: "date"}]},
            {name: "Business natural person", description: "", attributes: [{ID: 3, type: ItemType.ATTRIBUTE, name: "name", dataType: "string"},
                                                                            {ID: 4, type: ItemType.ATTRIBUTE, name: "distinguishing name supplement", dataType: "string"},
                                                                            {ID: 5, type: ItemType.ATTRIBUTE, name: "personal identification number", dataType: "number"}]},
            {name: "Road vehicle", description: "", attributes: []},
            {name: "Student", description: "A student entity represents an individual enrolled in an educational institution.", attributes: [{"ID": 6, "name": "name", "inference": "student has a name", "dataType": "string", "description": "The name of the student."}]},
            {name: "Course", description: "A course entity representing educational modules.", attributes: [{"ID": 7, "name": "name", "inference": "courses have a name", "dataType": "string", "description": "The name of the course."}, {"ID": 8, "name": "number of credits", "inference": "courses have a specific number of credits", "dataType": "string", "description": "The number of credits assigned to the course."}]},
            {name: "Dormitory", description: "A professor entity representing instructors teaching courses.", attributes: [{"ID": 9,"name": "price", "inference": "each dormitory has a price", "dataType": "int", "description": "The price of staying in the dormitory."}]},
            {name: "Professor", description: "A dormitory entity representing residential facilities for students.", attributes: [{"ID": 10, "name": "name", "inference": "professors, who have a name", "dataType": "string", "description": "The name of the professor."}]}],

                      relationships: [{"name": "enrolled in", "inference": "Students can be enrolled in any number of courses", "source_entity": "student", "target_entity": "course"},
                                {"name": "accommodated in", "inference": "students can be accommodated in dormitories", "source_entity": "student", "target_entity": "dormitory"},
                                {"name": "has", "inference": "each course can have one or more professors", "source_entity": "course", "target_entity": "professor"},
                                {"name": "is-a", "source_entity": "student", "target_entity": "person"}]}

        // const input = { "entities": [
        //     {name: "Student", "description": "A student entity representing individuals enrolled in courses.", "attributes": [{"ID": 0, "name": "name", "inference": "student has a name", "dataType": "string", "description": "The name of the student."}]},
        //     {name: "Course", "description": "A course entity representing educational modules.", "attributes": [{"ID": 1, "name": "name", "inference": "courses have a name", "dataType": "string", "description": "The name of the course."}, {"ID": 2, "name": "number of credits", "inference": "courses have a specific number of credits", "dataType": "string", "description": "The number of credits assigned to the course."}]},
        //     {name: "Dormitory", "description": "A professor entity representing instructors teaching courses.", "attributes": [{"ID": 3,"name": "price", "inference": "each dormitory has a price", "dataType": "int", "description": "The price of staying in the dormitory."}]},
        //     {name: "Professor", "description": "A dormitory entity representing residential facilities for students.", "attributes": [{"ID": 4, "name": "name", "inference": "professors, who have a name", "dataType": "string", "description": "The name of the professor."}]}],
        //   "relationships": [{"name": "enrolled in", "inference": "Students can be enrolled in any number of courses", "source_entity": "student", "target_entity": "course"},
        //                     {"name": "accommodated in", "inference": "students can be accommodated in dormitories", "source_entity": "student", "target_entity": "dormitory"},
        //                     {"name": "has", "inference": "each course can have one or more professors", "source_entity": "course", "target_entity": "professor"},
        //                     {"name": "is-a", "source_entity": "student", "target_entity": "person"}
        //                   ]}

        const incrementX = 300
        const incrementY = 350
        let positionX = 100
        let positionY = 100
        let newNodes : Node[] = []
        let newEdges : Edge[] = []

        for (const [key, entity] of Object.entries(input["entities"]))
        {
          const entityNameLowerCase = entity.name.toLowerCase()
          const newNode : Node = { id: entityNameLowerCase, position: { x: positionX, y: positionY }, data: { label: "", description: entity.description, attributes: entity.attributes } }
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
          const newEdge : Edge = { id: `${relationship.source_entity},${relationship.target_entity}`, source: relationship.source_entity, target: relationship.target_entity, label: relationship.name, type: 'straight', data: { description: "", inference: relationship.inference } }
          newEdges.push(newEdge)
        }
        
        setNodes(() => { return newNodes })
        setEdges(() => { return newEdges })
        updateNodes()
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

        if (isOnlyNames)
        {
          // TODO: First check that it works for entities + attributes and then add relationships
          return result
        }

        let relationships = []
        for (let edge of selectedEdges)
        {
          relationships.push({"name": edge.label, "inference": edge.data.inference, "source_entity": edge.source, "target_entity": edge.target})
        }

        if (relationships)
        {
          result.relationships = relationships
        }

        return result
      }


      const assignID = () =>
      {
        const newID = IDToAssign
        IDToAssign += 1
        return newID
      }

      const fetchNonStreamedData = (url : string, headers : any, body_data : any, itemType : ItemType) =>
      {
        fetch(url, { method: "POST", headers, body: body_data })
        .then(response => response.json())
        .then(data => 
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
            })
        .catch(error => console.log(error))
        setIsLoading(_ => false)
        return
    }


    const fetchStreamedDataGeneral = (endpoint : string, headers : any, bodyData : any, attributeName : string, field: Field) =>
    {
        setIsLoadingEdit(_ => true)
        setFieldToLoad(field)

        fetch(endpoint, { method: "POST", headers, body: bodyData })
        .then(response =>
        {
            const stream = response.body; // Get the readable stream from the response body

            if (stream === null)
            {
              console.log("Stream is null")
              setIsLoadingEdit(_ => false)
              return
            }

            const reader = stream.getReader();

            const readChunk = () =>
            {
                reader.read()
                    .then(({value, done}) =>
                    {
                        if (done)
                        {
                            console.log("Stream finished")
                            setIsLoadingEdit(_ => false)
                            return
                        }

                        // Convert the `value` to a string
                        var jsonString = new TextDecoder().decode(value)
                        console.log(jsonString)
                        console.log("\n")

                        const parsedData = JSON.parse(jsonString)
                        setRegeneratedItem({...regeneratedItem, [field]: parsedData[field]})

                        readChunk(); 
                    })
                    .catch(error =>
                    {
                      console.error(error);
                    });
            };
            readChunk(); // Start reading the first chunk
        })
        .catch(error =>
        {
          console.error(error);
          setIsLoadingEdit(_ => false)
          alert("Error: request failed")
        });
    }

    const fetchStreamedData = (url : string, headers : any, bodyData : any, itemType : ItemType) =>
    {
      // TODO: add interface for header and bodyData

      // Fetch the event stream from the server
      // Code from: https://medium.com/@bs903944/event-streaming-made-easy-with-event-stream-and-javascript-fetch-8d07754a4bed
      fetch(url, { method: "POST", headers, body: bodyData })
      .then(response =>
        {
          setIsLoading(_ => true)
          const stream = response.body; // Get the readable stream from the response body

          if (stream === null)
          {
            console.log("Stream is null")
            setIsLoading(_ => false)
            return
          }

          const reader = stream.getReader();

          const readChunk = () =>
          {
              reader.read()
                  .then(({value, done}) =>
                  {
                      if (done)
                      {
                          console.log("Stream finished")
                          setIsLoading(_ => false)
                          return
                      }

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

                        console.log("Item: ", item)

                        setSuggestedItems(previousSuggestedItems => {
                          return [...previousSuggestedItems, item]
                        })
                      }

                      // Read the next chunk
                      readChunk();
                  })
                  .catch(error =>
                  {
                    console.error(error);
                  });
          };
          // Start reading the first chunk
          readChunk();
      })
      .catch(error =>
      {
        console.error(error);
        setIsLoading(_ => false)
        alert("Error: request failed")
      });
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

      fetchStreamedDataGeneral(endpoint, headers, bodyData, name, field)
    }


    const onEditSave = (newItem : Item) =>
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
    }


    const onPlusButtonClick = (event : React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
    {
      if (isLoading)
      {
        alert("Another request is already being processed")
        return
      }

      const buttonText = event.currentTarget.innerText.toLowerCase()
      setUserChoiceSuggestion(buttonText)

      setIsLoading(_ => true)

      setSuggestedItems(_ => {return []})

      const endpointName = "suggest"
      const endpoint = BASE_URL + endpointName
      const currentDomainDesciption = isIgnoreDomainDescription ? "" : domainDescription
      const headers = { "Content-Type": "application/json" }
      const is_fetch_stream_data = true

      if (buttonText === UserChoice.ENTITIES)
      {
        // TODO: Define body field names such as `sourceEntity`, `targetEntity`, `userChoice`, ...
        const bodyData = JSON.stringify({"sourceEntity": "", "targetEntity": "", "userChoice": UserChoice.ENTITIES, "domainDescription": currentDomainDesciption})

        if (!is_fetch_stream_data)
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
        setIsLoading(_ => false)
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

        if (!is_fetch_stream_data)
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

      if (!is_fetch_stream_data)
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
      const endpoint = BASE_URL + "summary2"
      const headers = { "Content-Type": "application/json" }
      const conceptualModel = convertConceptualModelToJSON(true)
      const bodyData = JSON.stringify({"conceptualModel": conceptualModel, "domainDescription": domainDescription})

      fetchSummaryDescriptions(endpoint, headers, bodyData)
    }


    const onHighlightSelectedItems = () =>
    {
      // Mockup
      const fakeInferenceIndexes = [2960, 2980, 2982, 3114, 3122, 3143, 3171, 3184, 3185, 3201, 3206, 3315, 3322, 3368, 3536, 3582]
      setInferenceIndexesMockUp(fakeInferenceIndexes)

      const tooltips = [ "Natural person: name", "Natural person - Address: has", "Natural person: birth number", "Natural person: date of birth",
      "Natural person: name, birth number, date of birth", "Business natural person: name", "Business natural person: distinguishing name supplement",
      "Business natural person: personal identification number"]
      setTooltips(tooltips)

      // TODO: Process also all selected edges
      // let selectedInferenceIndexes : number[] = []
      // [{"inferenceIndexes": [10, 20], "name": "Attribute: type of engine"}, {...}]
      // 1) sort objects by "inferenceIndexes" value[0]
      // 2) merge instances with the same value[0] and merge their names
      //  - e.g. [{10, 20, "x"}, [{10, 100, "y"}] -> [{10, 20, "x, y"}, {20, 100, "y"}]
      //  - e.g. [{5, 10, "x"}, {6, 8, "y"}] -> [{5, 6, "x"}, {6, 8, "x, y"}, {8, 10, "y"}]

      // for (let i = 0; i < selectedNodes.length; i++)
      // {
      //   for (let j = 0; j < selectedNodes[i].data.attributes.length; j++)
      //   {
      //     const element = selectedNodes[i].data.attributes[j];
      //     console.log(element.inferenceIndexes)   
      //   }
      // }

      setIsShowDialogDomainDescription(true)
    }

    
    const updateNodes = () =>
    {
      setNodes((nodes) => nodes.map((node) =>
      {
        return updateNode(node)
      }));
    }


    const updateNode = (node : Node) =>
    {
      node.data =
      {
        ...node.data,
        label: <Typography component='span' className="node">
                  <p className="nodeTitle"><strong>{capitalizeString(node.id)}</strong></p>
                  <p>
                  {node.data.attributes.map((attribute : Attribute, index : number) =>
                  (
                      // <span key={`${attribute.name}-${index}`}> +{attribute.name}: {attribute.dataType} <br /> </span>
                      <span key={`${attribute.name}-${index}`}> +{attribute.name} <br /> </span>
                  ))}
                  </p>
                </Typography>
      };
      return node;
    }

    useEffect(() =>
    {
      updateNodes()
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
        console.log("Trying to scroll", highlightedText)

        if (highlightedText)
        {
          console.log("yes")
          highlightedText.scrollIntoView( { behavior: 'smooth', block: 'center'})
        }
      };

      delay()

    }, [isShowDialogDomainDescription])


    useEffect(() =>
    {
      // console.log("Nodes: ", nodes)
    }, [nodes]);

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

      const newNode = { id: nodeID, position: { x: positionX, y: positionY }, data: { label: "", attributes: attributes } }
      setNodes(previousNodes => {
        return [...previousNodes, newNode]
      })
      updateNodes()
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

      console.log("Unknown item type: ", item.type)
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
        cardinality: ""
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
    
    
    const onAddAttributesToNode = (attribute : Attribute) =>
    {    
      const nodeID = sourceEntity.toLowerCase()
      
      setNodes((nodes) => nodes.map((currentNode) =>
      {
        // Skip nodes which are not getting a new attribute
        if (currentNode.id !== nodeID)
        {
          return currentNode;
        }

        const newAttributeObject : Attribute = {
          [Field.ID]: attribute.ID, [Field.TYPE]: ItemType.ATTRIBUTE, [Field.NAME]: attribute.name, [Field.DESCRIPTION]: "",
          [Field.INFERENCE]: attribute.inference, [Field.INFERENCE_INDEXES]: attribute.inferenceIndexes, [Field.DATA_TYPE]: attribute.dataType,
          [Field.CARDINALITY]: ""
        }
  
        // If the node already contains the selected attribute do not add anything
        let isAttributePresent = false
        currentNode.data.attributes.forEach((attribute : Attribute) => {
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
  
        console.log("Pushing new attributes")
        currentNode.data.attributes.push(newAttributeObject)
        return updateNode(currentNode)
      })
      );
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
        // Create a new node
        const newNode = { id: targetNodeID, position: { x: 500, y: 100 }, data: { label: "", attributes: []} }
  
        setNodes(previousNodes => 
          {
            return [...previousNodes, newNode]
          })
        
        setNodes((nodes) => nodes.map((node) =>
        {
          if (node.id === targetNodeID)
          {
            console.log("Adding a new node")
            return updateNode(node)
          }
          return node
        }));
      }
  
      console.log("Adding a new edge")
      const newEdge : Edge = { id: newEdgeID, data: {name: relationshipObject.name, description: relationshipObject.description, inference: relationshipObject.inference}, source: sourceNodeID, target: targetNodeID, label: relationshipObject.name}
  
      setEdges(previousEdges =>
        {
          return [...previousEdges, newEdge]
        })
    }


    const onClearRegeneratedItem = (field: Field | null, isClearAll: boolean) : void=>
    {
      if (isClearAll)
      {
        console.log("Clearing all")
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


    const onEditSuggestion = (itemID : number) : void =>
    {
      setIsShowDialogEdit(true)

      setSelectedSuggestedItem(suggestedItems[itemID])
      setEditedSuggestedItem(suggestedItems[itemID])
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
        isLoading, suggestedItems, selectedSuggestedItem, editedSuggestedItem, userChoiceSuggestion, onEditSuggestion, onShowInference,
        isShowDialogDomainDescription, onOverlayDomainDescriptionOpen, onDialogDomainDescriptionClose, onHighlightSelectedItems, selectedNodes, sourceEntity, tooltips, onAddItem,
        regeneratedItem, onClearRegeneratedItem, isLoadingEdit, isLoadingSummary1, isLoadingSummaryDescriptions, fieldToLoad, onItemEdit, onConfirmRegeneratedText, onSummaryDescriptionsClick, summaryDescriptions
    }
}

export default useConceptualModel