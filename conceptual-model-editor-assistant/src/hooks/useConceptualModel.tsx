import { useCallback, useEffect, useState } from 'react';
import { useNodesState, useEdgesState, addEdge, Node, Edge, useOnSelectionChange, OnConnect } from 'reactflow';

import 'reactflow/dist/style.css';
import useInferenceIndexes from './useInferenceIndexes';
import useUtility from './useUtility';
import useDomainDescription from './useDomainDescription';
import useFetchData from './useFetchData';
import { Typography } from '@mui/material';

const initialNodes : Node[] = [{ id: 'engine', position: { x: 100, y: 100 }, data: { label: "", attributes: [] } }, ];


const useConceptualModel = () =>
{
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [suggestedItems, setSuggestedItems] = useState<Item[]>([])
    const [selectedSuggestedItem, setSelectedSuggestedItem] = useState<Item>({ID: -1, name: "", inference: "", inference_indexes: []})
  
    const [sourceEntity, setSourceEntity] = useState<string>("")
    const [targetEntity, setTargetEntity] = useState<string>("")
  
    const [isMultiSelection, setIsMultiSelection] = useState<boolean>(false);
    const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  
    const [summaryData, setSummaryData] = useState<SummaryObject[]>([])

    const [isShowOverlay, setIsShowOverlay] = useState<boolean>(false)
    const [isShowOverlayDomainDescription, setIsShowOverlayDomainDescription] = useState<boolean>(false)
    const [isShowEdit, setIsShowEdit] = useState<boolean>(false)

    const [inferenceIndexesMockUp, setInferenceIndexesMockUp] = useState<number[]>([])

    let IDToAssign = 0
    const [userChoiceSuggestion, setUserChoiceSuggestion] = useState<string>("")

    const URL = "http://127.0.0.1:5000/"

    const { inferenceIndexes, setInferenceIndexes, getIndexesForOneInference } = useInferenceIndexes()

    const { domainDescription, isIgnoreDomainDescription, onDomainDescriptionChange, onIgnoreDomainDescriptionChange } = useDomainDescription()

    const { capitalizeString } = useUtility()

    const { isLoadingEdit, descriptionData, use_fetch_streamed_data_general } = useFetchData((x, y, z) => onAttributeChange(x, y, z))


    const onConnect : OnConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
      );
    
    const onChange = useCallback(({ nodes, edges } : { nodes : Node[], edges : Edge[]}) =>
    {
      setSelectedNodes(nodes)
  
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
        const input = { "entities": [ {"name": "Engine", "attributes": []},
                                      {"name": "Bodywork", "attributes": []},
                                      {"name": "Natural person", "attributes": []},
                                      {"name": "Vehicle", "attributes": []},
                                      {"name": "Road vehicle", "attributes": []},
                                      {"name": "Registration", "attributes": []},
                                      {"name": "Insurance contract", "attributes": []},
                                      {"name": "Technical inspection", "attributes": []}],
                        "relationships": [{"name": "is-a", "inference": "", "source_entity": "vehicle", "target_entity": "road vehicle"}]}
        
        // const input = { "entities": [
        //     {"name": "Student", "attributes": [{"name": "name", "inference": "student has a name", "data_type": "string"}]},
        //     {"name": "Course", "attributes": [{"name": "name", "inference": "courses have a name", "data_type": "string"}, {"name": "number of credits", "inference": "courses have a specific number of credits", "data_type": "string"}]},
        //     {"name": "Dormitory", "attributes": [{"name": "price", "inference": "each dormitory has a price", "data_type": "int"}]},
        //     {"name": "Professor", "attributes": [{"name": "name", "inference": "professors, who have a name", "data_type": "string"}]}],
        //   "relationships": [{"name": "enrolled in", "inference": "Students can be enrolled in any number of courses", "source_entity": "student", "target_entity": "course"},
        //                     {"name": "accommodated in", "inference": "students can be accommodated in dormitories", "source_entity": "student", "target_entity": "dormitory"},
        //                     {"name": "has", "inference": "each course can have one or more professors", "source_entity": "course", "target_entity": "professor"},
        //                     {"name": "is-a", "source_entity": "student", "target_entity": "person"}
        //                   ]}

        const incrementX = 250
        const incrementY = 250
        let positionX = 100
        let positionY = 100
        let newNodes : Node[] = []
        let newEdges : Edge[] = []

        for (const [key, entity] of Object.entries(input["entities"]))
        {
          const entityNameLowerCase = entity.name.toLowerCase()
          const newNode = { id: entityNameLowerCase, position: { x: positionX, y: positionY }, data: { label: "", attributes: entity.attributes } }
          newNodes.push(newNode)

          // if (entity.parent_entity)
          // {
          //   const parentLowerCase = entity.parent_entity.toLowerCase()
          //   const newEdge = { id: `${entityNameLowerCase},${parentLowerCase}`, source: entityNameLowerCase, target: parentLowerCase, label: "is-a", description: "", inference: "", type: 'straight'}
          //   newEdges.push(newEdge)
          // }

          positionX += incrementX

          if (positionX >= 1300)
          {
            positionX = 100
            positionY += incrementY
          }
        }

        for (const [key, relationship] of Object.entries(input["relationships"]))
        {
          const newEdge = { id: `${relationship.source_entity},${relationship.target_entity}`, source: relationship.source_entity, target: relationship.target_entity, label: relationship.name, description: "", inference: relationship.inference, type: 'straight'}
          newEdges.push(newEdge)
        }
        
        setNodes(() => { return newNodes })
        setEdges(() => { return newEdges })
        updateNodes()
      }


      const assignID = () =>
      {
        const newID = IDToAssign
        IDToAssign += 1
        return newID
      }

      const fetchNonStreamedData = (url : string, headers : any, body_data : any, userChoice : string) =>
      {
        fetch(url, { method: "POST", headers, body: body_data })
        .then(response => response.json())
        .then(data => 
            {
              for (let i = 0; i < data.length; i++)
              {
                const ID = assignID()
                data[i]['ID'] = ID

                setSuggestedItems(previousSuggestedItems => {
                  return [...previousSuggestedItems, data[i]]
                })
              }
            })
        .catch(error => console.log(error))
        setIsLoading(_ => false)
        return
      }

      const fetch_streamed_data = (url : string, headers : any, bodyData : any, userChoice : string) =>
      {
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
                          item['ID'] = assignID()

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

      const onEditPlus = (attributeName: string, field: string) =>
      {
        const endpointName = "getOnly"
        const endpoint = URL + endpointName
        const headers = { "Content-Type": "application/json" }
        const bodyData = JSON.stringify({"attributeName": attributeName, "sourceEntity": sourceEntity, "field": field, "domainDescription": domainDescription})

        use_fetch_streamed_data_general(endpoint, headers, bodyData, attributeName, field)
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

      const onAttributeChange = (attributeName: string, newText: string, field: string) =>
      {
        // TODO: Do not save changes immediately, let the user choose to accept or reject the new change

        setSuggestedItems(suggestedItems.map((attribute) =>
        {
          if (attribute.name === attributeName)
          {
            if (field === "description")
            {
              setSelectedSuggestedItem({ ...attribute, description: newText })
              return attribute.name === attributeName ? {...attribute, description: newText} : attribute
            }
            else if (field === "cardinality")
            {
              setSelectedSuggestedItem({ ...attribute, cardinality: newText })
              return attribute.name === attributeName ? {...attribute, cardinality: newText} : attribute
            }
          }
          return attribute
        }));
      }
    
      const onPlusButtonClick = (event : React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
      {
        if (isLoading)
        {
          alert("Another request is already being processed")
          return
        }

        const buttonText = event.currentTarget.innerText.toLowerCase()
        setUserChoiceSuggestion(buttonText.slice(1))

        setIsLoading(_ => true)

        setSuggestedItems(_ => {return []})

        const endpointName = "suggest"
        const endpoint = URL + endpointName
        const currentDomainDesciption = isIgnoreDomainDescription ? "" : domainDescription
        const headers = { "Content-Type": "application/json" }
        const is_fetch_stream_data = true
        let userChoice = ""

        if (buttonText === "+entities")
        {
          userChoice = "entities"
          // TODO: Define field names such as `sourceEntity`, `targetEntity`, `userChoice`, ...
          const bodyData = JSON.stringify({"sourceEntity": "", "targetEntity": "", "userChoice": userChoice, "domainDescription": currentDomainDesciption})

          if (!is_fetch_stream_data)
          {
            fetchNonStreamedData(endpoint, headers, bodyData, userChoice)
          }
          else
          {
            fetch_streamed_data(endpoint, headers, bodyData, userChoice)
          }
          return
        }

        if (!selectedNodes[0])
        {
          console.log("Zero nodes selected")
          return
        }

        // TODO: is this code needed when we obtain the name from `selectedNodes[0].id.toLowerCase()`?
        setSourceEntity(_ => { return selectedNodes[0].id.toLowerCase() })

        if (selectedNodes.length === 2 && buttonText === "+Relationships")
        {
          setTargetEntity(_ => { return selectedNodes[1].id.toLowerCase() } )

          userChoice = "relationships2"

          const sourceEntityName = selectedNodes[0].id.toLowerCase()
          const targetEntityName = selectedNodes[1].id.toLowerCase()
          const body_data = JSON.stringify({"sourceEntity": sourceEntityName, "targetEntity": targetEntityName, "userChoice": userChoice, "domainDescription": currentDomainDesciption})

          if (!is_fetch_stream_data)
          {
            fetchNonStreamedData(endpoint, headers, body_data, userChoice)
          }
          else
          {
            fetch_streamed_data(endpoint, headers, body_data, userChoice)
          }
          return
        }

        if (selectedNodes.length > 2)
        {
          console.log("More than one node selected")
          return
        }
    
    
        if (buttonText === "+attributes")
        {
          userChoice = "attributes"
        }
        else if (buttonText === "+relationships")
        {
          userChoice = "relationships"
        }
        else
        {
          alert(`Clicked on unknown button: ${buttonText}`)
          return
        }

        const entityName = selectedNodes[0].id.toLowerCase()
        const body_data = JSON.stringify({"sourceEntity": entityName, "targetEntity": "", "userChoice": userChoice, "domainDescription": currentDomainDesciption})

        if (!is_fetch_stream_data)
        {
          fetchNonStreamedData(endpoint, headers, body_data, userChoice)
        }
        else
        {
          fetch_streamed_data(endpoint, headers, body_data, userChoice)
        }
      }
    
      const onSummaryButtonClick = () =>
      {
        alert("Not implemented")
        return

        // Get titles of all selected entites
        let selectedEntites = ""
        for (let i = 0; i < selectedNodes.length; i++)
        {
          selectedEntites += `${selectedNodes[i].id},`
        }
        selectedEntites = selectedEntites.slice(0, -1)
    
        fetch(`http://127.0.0.1:5000/summary?entities=${selectedEntites}`)
        .then(response => response.json())
        .then(data => 
            {
              setSummaryData([]) // Clear summary data
    
              for (let i = 0; i < data.length; i++)
              {
                let summaryObject = JSON.parse(data[i])
                setSummaryData(previousData => 
                  {
                    return [...previousData, summaryObject]
                  })
              }
            })
        .catch(error => console.log(error))
        return
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
                        <span key={`${attribute.name}-${index}`}> +{attribute.name}: {attribute.dataType} <br /> </span>
                    ))}
                    </p>
                 </Typography>
        };
        return node;
      }

      useEffect(() =>
      {
        updateNodes()

        // setSuggestedAttributes([...suggestedAttributes, attribute1, attribute2])

        // setSuggestedAttributes(suggestedAttributes.map(attribute => attribute.name === "a1" ? attribute : attribute))
        // setSuggestedAttributes(suggestedAttributes.map(attribute => attribute.name === "a1" ? {...attribute, name: "a10"} : attribute))
        // parseSerializedConceptualModel()
      }, []);
    
      useEffect(() =>
      {
        let domainDescriptionText = document.getElementById("domainDescriptionText")
    
        if (!domainDescriptionText)
        {
          return
        }
    
        if (isIgnoreDomainDescription)
        {
          domainDescriptionText.style.color = '#D3D3D3'
        }
        else
        {
          domainDescriptionText.style.color = 'black';
        }
      }, [isIgnoreDomainDescription]);
    
      useEffect(() =>
      {
        // Recompute inference indexes
        setInferenceIndexes([])
    
        setNodes((nodes) => nodes.map((node) =>
        {
          for (let i = 0; i < node.data.attributes.length; i++)
          {
            const newInferenceIndexes = getIndexesForOneInference(node.data.attributes[i].inference, domainDescription)
            if (newInferenceIndexes.length === 0)
            {
              continue
            }
    
            node.data.attributes.inference_indexes = newInferenceIndexes
    
            setInferenceIndexes(previousInferenceIndexes => 
              {
                return [...previousInferenceIndexes, newInferenceIndexes]
              })
          }
          return node;
        }));
      }, [domainDescription])

      useEffect(() =>
      {
        if (!isShowOverlayDomainDescription)
        {
          return
        }

        // Scroll down to the first highlighted inference in the overlay
        let highlightedText = document.getElementById("highlightedInference-1")
        if (highlightedText)
        {
          console.log("yes")
          highlightedText.scrollIntoView( { behavior: 'smooth', block: 'center'})
        }

      }, [isShowOverlayDomainDescription])
    
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

        const newNode = { id: nodeID, position: { x: positionX, y: positionY }, data: { label: "", attributes: attributes } }
        setNodes(previousNodes => {
          return [...previousNodes, newNode]
        })
        updateNodes()
      }

      const onOverlayDomainDescriptionOpen = () =>
      {
        setIsShowOverlayDomainDescription(true)
      }

      const onOverlayDomainDescriptionClose = () =>
      {
        setIsShowOverlayDomainDescription(false)
      }

      const onOverlayClose = () =>
      {
        setIsShowOverlay(false)
      }

      const onAddEntity = (entity: Entity) =>
      {
        console.log("adding entities")
        setIsShowOverlay(_ => false)
        addNode(entity.name, 66, 66)
      }


      const onAddAsRelationship = (attribute : Attribute) =>
      {
        const relationship : Relationship = {ID: attribute.ID, "name": "", "inference": attribute.inference, "inference_indexes": attribute.inference_indexes, 
                                             "source": sourceEntity, "target": attribute.name, "cardinality": ""}
        
        setSelectedSuggestedItem(relationship)
        setIsShowEdit(true)
      }


      const onAddAsAttribute = (item : Item) =>
      {
        // const attribute : Attribute = {"name": relationship.target, "dataType": "string", "inference": relationship.inference, "inference_indexes": relationship.inference_indexes}

        setSelectedSuggestedItem(item)
        setIsShowEdit(true)

        // TODO: Wait for the user to accept or cancel the edit box
        onAddAttributesToNode(item)
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
        setIsShowOverlay(_ => false)
    
        const nodeID = sourceEntity.toLowerCase()
        
        setNodes((nodes) => nodes.map((currentNode) =>
        {
          // Skip nodes which are not getting a new attribute
          if (currentNode.id !== nodeID)
          {
            return currentNode;
          }
    
          const newInferenceIndexes = getIndexesForOneInference(attribute.inference, domainDescription)
          if (newInferenceIndexes.length !== 0)
          {
            setInferenceIndexes(previousInferenceIndexes =>
              {
                return [...previousInferenceIndexes, newInferenceIndexes]
              })
          }

          const newAttributeObject : Attribute = { ID: attribute.ID, name: attribute.name, description: "", inference: attribute.inference, inference_indexes: newInferenceIndexes, dataType: attribute.dataType}
    
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
        setIsShowOverlay(_ => false)
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
        const newEdge = { id: newEdgeID, source: sourceNodeID, target: targetNodeID, label: relationshipObject.name, name: relationshipObject.name, description: relationshipObject.description, inference: relationshipObject.inference}
    
        setEdges(previousEdges =>
          {
            return [...previousEdges, newEdge]
          })
      }


      const onEditClose = () =>
      {
        setIsShowEdit(false)
      }


      const onEditSuggestion = (itemID : number, userChoice : string) =>
      {
        setIsShowOverlay(false)
        setIsShowEdit(true)

        setSelectedSuggestedItem(suggestedItems[itemID])
      }

      const onShowInference = (itemID : number) =>
      {
        // TODO: probably add to method argument "isAttribute" similar to `editSuggestion` method in Sidebar.tsx
        // TODO: probably move this function into file `useInferenceIndexes.tsx`

        setIsShowEdit(_ => false)

        // TODO: Do not close the overlay if the user clicked on a different suggestion
        // Close overlay if it is already displayed
        if (isShowOverlay)
        {
          setIsShowOverlayDomainDescription(_ => false)
          return
        }

        setIsShowOverlayDomainDescription(_ => true)

        const item : Item = suggestedItems[itemID]
        setInferenceIndexesMockUp(_ => item.inference_indexes)
      }
    
    return { nodes, edges, onNodesChange, onEdgesChange, onConnect, onIgnoreDomainDescriptionChange, onImportButtonClick, onPlusButtonClick, onSummaryButtonClick,
        summaryData, capitalizeString, OnClickAddNode, domainDescription, onDomainDescriptionChange, inferenceIndexesMockUp, isShowOverlay, onOverlayClose, isShowEdit, onEditClose, onEditPlus, onEditSave,
        isLoading, suggestedItems, selectedSuggestedItem, userChoiceSuggestion, onAddEntity, onAddAttributesToNode, onAddRelationshipsToNodes, onAddAsRelationship, onAddAsAttribute, onEditSuggestion, onShowInference,
        isShowOverlayDomainDescription, onOverlayDomainDescriptionOpen, onOverlayDomainDescriptionClose
    }
}

export default useConceptualModel