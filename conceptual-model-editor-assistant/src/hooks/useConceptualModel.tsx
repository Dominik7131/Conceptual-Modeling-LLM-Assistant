import { useCallback, useEffect, useState } from 'react';
import { useNodesState, useEdgesState, addEdge, Node, Edge, useOnSelectionChange, OnConnect } from 'reactflow';

import 'reactflow/dist/style.css';
import useInferenceIndexes from './useInferenceIndexes';
import useUtility from './useUtility';

const initialNodes : Node[] = [{ id: 'engine', position: { x: 100, y: 100 }, data: { label: "", attributes: [] } }, ];


const useConceptualModel = () =>
{
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [suggestedEntities, setSuggestedEntities] = useState<Entity[]>([])
    const [suggestedAttributes, setSuggestedAttributes] = useState<Attribute[]>([])
    const [suggestedRelationships, setSuggestedRelationships] = useState<Relationship[]>([])
    const [suggestedItem, setSuggestedItem] = useState<Entity|Attribute|Relationship>({"name": "", "description": "", "inference": "", "inference_indexes": []})
  
    const [sourceEntity, setSourceEntity] = useState<string>("")
  
    const [isMultiSelection, setIsMultiSelection] = useState<boolean>(false);
    const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);

    const [nodeToAddName, setNodeToAddName] = useState<string>("")
  
    const [summaryData, setSummaryData] = useState<SummaryObject[]>([])
  
    const [domainDescription, setDomainDescription] = useState<string>("")
  
    const [isIgnoreDomainDescription, setIsIgnoreDomainDescription] = useState<boolean>(false)

    const [isShowOverlay, setIsShowOverlay] = useState<boolean>(false)
    const [isShowEdit, setIsShowEdit] = useState<boolean>(false)

    // Mock-up
    const [inferenceIndexesMockUp, setInferenceIndexesMockUp] = useState<number[]>([31, 71])

    const { inferenceIndexes, setInferenceIndexes, getIndexesForOneInference } = useInferenceIndexes()

    const { capitalizeString } = useUtility()

    const onConnect : OnConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
      );
    
    const onChange = useCallback(({ nodes, edges } : { nodes : Node[], edges : Edge[]}) =>
    {
        setSelectedNodes(nodes)
    
        if (nodes[1] !== undefined)
        {
          console.log("Selected more than 1 node")
          setIsMultiSelection(true)
        }
        else
        {
          setIsMultiSelection(false)
        }
        // console.log(nodes, edges);
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


      const fetch_non_streamed_data = (url : string, headers : any, body_data : any, userChoice : string) =>
      {
        fetch(url, { method: "POST", headers, body: body_data })
        .then(response => response.json())
        .then(data => 
            {
              if (userChoice === "entities")
              {
                for (let i = 0; i < data.length; i++)
                {
                  let entity : Entity = data[i]
                  setSuggestedEntities(previousSuggestedEntities => {
                    return [...previousSuggestedEntities, entity]
                  })
                }
              }
              else if (userChoice === "attributes")
              {
                for (let i = 0; i < data.length; i++)
                {
                  const attribute : Attribute = data[i]
                  const editedAttribute : Attribute = { "name": attribute.name, "inference": attribute.inference, "dataType": attribute.dataType, inference_indexes: attribute.inference_indexes, "description": ""}
  
                  setSuggestedAttributes(previousSuggestedAttributes => {
                    return [...previousSuggestedAttributes, editedAttribute]
                  })
                }
              }
              else if (userChoice === "relationships")
              {
                for (let i = 0; i < data.length; i++)
                {
                  const relationship = data[i]
                  const editedRelationship : Relationship = { "name": relationship.name, "source": relationship.source, "target": relationship.target, "inference": relationship.inference, inference_indexes: relationship.inference_indexes, "description": "", "cardinality": relationship.cardinality}

                  setSuggestedRelationships(previousSuggestedRelationships => {
                    return [...previousSuggestedRelationships, editedRelationship]
                  })
                }
              }
            })
        .catch(error => console.log(error))
        setIsLoading(_ => false)
        return
      }

      const fetch_streamed_data = (url : string, headers : any, body_data : any, userChoice : string) =>
      {
        // Fetch the event stream from the server
        // Code from: https://medium.com/@bs903944/event-streaming-made-easy-with-event-stream-and-javascript-fetch-8d07754a4bed
        fetch(url, { method: "POST", headers, body: body_data })
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
                          if (userChoice === "entities")
                          {
                            let entity : Entity = JSON.parse(jsonStringParts[i])
                            console.log("Entity: ")
                            console.log(entity)
                            setSuggestedEntities(previousSuggestedEntities => {
                              return [...previousSuggestedEntities, entity]
                            })
                          }
                          else if (userChoice === "attributes")
                          {
                            let attribute : Attribute = JSON.parse(jsonStringParts[i])
                            attribute = { "name": attribute.name, "inference": attribute.inference, "dataType": attribute.dataType, inference_indexes: attribute.inference_indexes, "description": ""}
          
                            console.log("Attribute: ")
                            console.log(attribute)
                            setSuggestedAttributes(previousSuggestedAttributes => {
                              return [...previousSuggestedAttributes, attribute]
                            })
                          }
                          else if (userChoice === "relationships")
                          {
                            let relationship : Relationship = JSON.parse(jsonStringParts[i])

                            console.log("Relationship: ")
                            console.log(relationship)
                            setSuggestedRelationships(previousSuggestedRelationships => {
                              return [...previousSuggestedRelationships, relationship]
                            })
                          }
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
        });
      }
      
      const onImportButtonClick = () =>
      {
        parseSerializedConceptualModel()
      }
    
      const onPlusButtonClick = (event : React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
      {
        //console.log("On plus button nodes: " + nodes)
        // const buttonInnerHTML = event.target.innerHTML
        const buttonInnerHTML = event.currentTarget.innerHTML
        setIsLoading(_ => true)

        setSuggestedEntities(_ => {return []})
        setSuggestedAttributes(_ => {return []})
        setSuggestedRelationships(_ => {return []})

        const url = "http://127.0.0.1:5000/suggest"
        const currentDomainDesciption = isIgnoreDomainDescription ? "" : domainDescription
        const headers = { "Content-Type": "application/json" }
        const is_fetch_stream_data = true
        let userChoice = ""

        if (buttonInnerHTML === "+Entities")
        {
          userChoice = "entities"
          const body_data = JSON.stringify({"entity": "", "user_choice": userChoice, "domain_description": currentDomainDesciption})

          if (!is_fetch_stream_data)
          {
            fetch_non_streamed_data(url, headers, body_data, userChoice)
          }
          else
          {
            fetch_streamed_data(url, headers, body_data, userChoice)
          }
          return
        }

        if (!selectedNodes[0])
        {
          console.log("Zero nodes selected")
          return
        }
        if (selectedNodes.length >= 2)
        {
          console.log("More than one node selected")
          return
        }
    
        setSourceEntity(_ => {return selectedNodes[0].id.toLowerCase() })
    
        if (buttonInnerHTML === "+Attributes")
        {
          userChoice = "attributes"
        }
        else if (buttonInnerHTML === "+Relationships")
        {
          userChoice = "relationships"
        }
        else
        {
          alert(`Clicked on unknown button: ${buttonInnerHTML}`)
          return
        }

        const entityName = selectedNodes[0].id.toLowerCase()
        const body_data = JSON.stringify({"entity": entityName, "user_choice": userChoice, "domain_description": currentDomainDesciption})

        if (!is_fetch_stream_data)
        {
          fetch_non_streamed_data(url, headers, body_data, userChoice)
        }
        else
        {
          fetch_streamed_data(url, headers, body_data, userChoice)
        }
      }
    
      const onSummaryButtonClick = () =>
      {
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
        // console.log("Updating nodes")
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
          label: <div className="node">
                    <p className="nodeTitle"><strong>{capitalizeString(node.id)}</strong></p>
                    <p>
                    {node.data.attributes.map((attribute : Attribute, index : number) =>
                    (
                        <span key={`${attribute.name}-${index}`}> +{attribute.name}: {attribute.dataType} <br /> </span>
                    ))}
                    </p>
                 </div>
        };
        return node;
      }
    
      useEffect(() =>
      {
        updateNodes()

        // parseSerializedConceptualModel()

        // Load domain description from a file
        fetch("input.txt")
        .then((res) => res.text())
        .then((text) => {
          setDomainDescription(_ => text)
         })
        .catch((e) => console.error(e));

    
        // TODO: Update `domainDescription` variable if the text in text area get changed
        // const domainDescriptionTextArea = document.getElementById("domainDescriptionText")
        // if (domainDescriptionTextArea)
        // {
        //   setDomainDescription(domainDescriptionTextArea.innerHTML)
        // }

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
        if (!isShowOverlay)
        {
          return
        }

        // Scroll down to the first highlighted inference in the overlay
        let highlightedText = document.getElementById("highlightedInference-1")
        if (highlightedText)
        {
            highlightedText.scrollIntoView( { behavior: 'smooth', block: 'center'})
        }

      }, [isShowOverlay])
    
      // useEffect(() =>
      // {
      //   console.log("Nodes: ")
      //   console.log(nodes)
      // }, [nodes]);
    
      // useEffect(() =>
      // {
      //   console.log(edges)
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

      const addEntity = (event : React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
      {
        setIsShowOverlay(_ => false)
        const entityTargetID = event.currentTarget.id.slice(6)
        const entityToAdd = suggestedEntities[Number(entityTargetID)]
        addNode(entityToAdd.name, 66, 66)
      }

      const OnClickAddNode = () =>
      {
        console.log(`On click add node: ${nodeToAddName}`)
        if (!nodeToAddName)
        {
          return
        }

        addNode(nodeToAddName.toLowerCase(), 0, 0, [])
      }
    
    
      const addAttributesToNode = (event : React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
      {
        setIsShowOverlay(_ => false)

        const attributeTargetID = event.currentTarget.id.slice(6)
        const attributeToAdd = suggestedAttributes[Number(attributeTargetID)]
    
        const nodeID = sourceEntity.toLowerCase()
        
        setNodes((nodes) => nodes.map((currentNode) =>
        {
          // Skip nodes which are not getting a new attribute
          if (currentNode.id !== nodeID)
          {
            return currentNode;
          }
    
          const newInferenceIndexes = getIndexesForOneInference(attributeToAdd.inference, domainDescription)
          if (newInferenceIndexes.length !== 0)
          {
            setInferenceIndexes(previousInferenceIndexes =>
              {
                return [...previousInferenceIndexes, newInferenceIndexes]
              })
          }
    
          const newAttributeObject = { name: attributeToAdd.name, inference: attributeToAdd.inference, inference_indexes: newInferenceIndexes, data_type: attributeToAdd.dataType}
    
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
    
      const addRelationshipsToNodes = (event : React.MouseEvent<HTMLButtonElement, MouseEvent>, relationshipObject : Relationship) =>
      {
        setIsShowOverlay(_ => false)
        const relationshipIndex = event.currentTarget.id.slice(6)
        const relationshipToAdd = suggestedRelationships[Number(relationshipIndex)]
        const sourceNodeID = sourceEntity.toLowerCase()
        const targetNodeID = relationshipToAdd.target.toLowerCase()
    
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


      const editSuggestion = (event : React.MouseEvent<HTMLButtonElement, MouseEvent>, userChoice : string) =>
      {
        setIsShowOverlay(_ => false)
        setIsShowEdit(_ => true)

        const targetID = Number(event.currentTarget.id.slice(6))

        if (userChoice === "entities")
        {
          const entity = suggestedEntities[targetID]
          setSuggestedItem(entity)
        }
        else if (userChoice === "attributes")
        {
          const attribute = suggestedAttributes[targetID]
          setSuggestedItem(attribute)
        }
        else if (userChoice === "relationships")
        {
          const relationship = suggestedRelationships[targetID]
          setSuggestedItem(relationship)
        }
        else
        {
          alert("Unknown suggestion to edit")
          return
        }
      }

      const showInference = (event : React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
      {
        // TODO: probably add to method argument "isAttribute" similar to `editSuggestion` method in Sidebar.tsx
        // TODO: probably move this function into file `useInferenceIndexes.tsx`
        const targetID = Number(event.currentTarget.id.slice(6))

        setIsShowEdit(_ => false)

        // TODO: Do not close the overlay if the user clicked on a different suggestion
        // Close overlay if it is already displayed
        if (isShowOverlay)
        {
          setIsShowOverlay(_ => false)
          return
        }

        setIsShowOverlay(_ => true)

        if (targetID < suggestedEntities.length)
        {
          const entity = suggestedEntities[targetID]
          setInferenceIndexesMockUp(_ => entity.inference_indexes)
        }
        
        if (targetID < suggestedAttributes.length)
        {
          const attribute = suggestedAttributes[targetID]
          setInferenceIndexesMockUp(_ => attribute.inference_indexes)
        }

        if (targetID < suggestedRelationships.length)
        {
          const relationship = suggestedRelationships[targetID]
          setInferenceIndexesMockUp(_ => relationship.inference_indexes)
        }
      }

      const handleIgnoreDomainDescriptionChange = () =>
      {
        setIsIgnoreDomainDescription(previousValue => !previousValue)
      }
    
    return { nodes, edges, onNodesChange, onEdgesChange, onConnect, handleIgnoreDomainDescriptionChange, onImportButtonClick, onPlusButtonClick, onSummaryButtonClick,
        summaryData, capitalizeString, nodeToAddName, setNodeToAddName, OnClickAddNode, domainDescription, setDomainDescription, inferenceIndexes, inferenceIndexesMockUp, isShowOverlay, setIsShowOverlay, isShowEdit, setIsShowEdit,
        isLoading, suggestedEntities, suggestedAttributes, suggestedRelationships, suggestedItem, addEntity, addAttributesToNode, addRelationshipsToNodes, editSuggestion, showInference
    }
}

export default useConceptualModel