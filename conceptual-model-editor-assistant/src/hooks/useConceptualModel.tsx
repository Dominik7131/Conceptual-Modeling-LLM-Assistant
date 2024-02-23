import { useCallback, useEffect, useState } from 'react';
import { useNodesState, useEdgesState, addEdge, Node, Edge, useOnSelectionChange, OnConnect } from 'reactflow';

import 'reactflow/dist/style.css';
import useInferenceIndexes from './useInferenceIndexes';
import useUtility from './useUtility';

const initialNodes : Node[] = [{ id: 'student', position: { x: 100, y: 100 }, data: { label: "", attributes: [] } }, ];


const useConceptualModel = () =>
{
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [suggestedAttributes, setSuggestedAttributes] = useState<Attribute[]>([])
    const [suggestedRelationships, setSuggestedRelationships] = useState<Relationship[]>([])
  
    const [sourceEntity, setSourceEntity] = useState<string>("")
  
    const [isMultiSelection, setIsMultiSelection] = useState<boolean>(false);
    const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  
    const [summaryData, setSummaryData] = useState<SummaryObject[]>([])
  
    const [domainDescription, setDomainDescription] = useState<string>("")
  
    const [isIgnoreDomainDescription, setIsIgnoreDomainDescription] = useState<boolean>(false)

    const [isShowOverlay, setIsShowOverlay] = useState<boolean>(false)

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
                                      {"name": "Student", "attributes": [{"name": "name", "inference": "student has a name", "data_type": "string"}]},
                                      {"name": "Course", "attributes": [{"name": "name", "inference": "courses have a name", "data_type": "string"}, {"name": "number of credits", "inference": "courses have a specific number of credits", "data_type": "string"}]},
                                      {"name": "Dormitory", "attributes": [{"name": "price", "inference": "each dormitory has a price", "data_type": "int"}]},
                                      {"name": "Professor", "attributes": [{"name": "name", "inference": "professors, who have a name", "data_type": "string"}]}],
                        "relationships": [{"name": "enrolled in", "inference": "Students can be enrolled in any number of courses", "source_entity": "student", "target_entity": "course"},
                                          {"name": "accommodated in", "inference": "students can be accommodated in dormitories", "source_entity": "student", "target_entity": "dormitory"},
                                          {"name": "has", "inference": "each course can have one or more professors", "source_entity": "course", "target_entity": "professor"},
                                          {"name": "is-a", "source_entity": "student", "target_entity": "person"}
                                        ]}

        let positionX = 100
        let positionY = 100
        let newNodes : Node[] = []
        let newEdges : Edge[] = []

        for (const [key, entity] of Object.entries(input["entities"]))
        {
          // console.log(entity.name);
          const entityNameLowerCase = entity.name.toLowerCase()
          const newNode = { id: entityNameLowerCase, position: { x: positionX, y: positionY }, data: { label: "", attributes: entity.attributes } }
          newNodes.push(newNode)

          // if (entity.parent_entity)
          // {
          //   const parentLowerCase = entity.parent_entity.toLowerCase()
          //   const newEdge = { id: `${entityNameLowerCase},${parentLowerCase}`, source: entityNameLowerCase, target: parentLowerCase, label: "is-a", description: "", inference: "", type: 'straight'}
          //   newEdges.push(newEdge)
          // }

          if (positionX === 100 || positionX === 350)
          {
            positionX += 250
          }
          else
          {
            positionX = 100
            positionY += 250
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
    
      const onPlusButtonClick = (event : React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
      {
        //console.log("On plus button nodes: " + nodes)
        // const buttonInnerHTML = event.target.innerHTML
        const buttonInnerHTML = event.currentTarget.innerHTML
    
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
    
        const entityName = selectedNodes[0].id.toLowerCase()
        const currentDomainDesciption = isIgnoreDomainDescription ? "" : domainDescription
    
        if (buttonInnerHTML === "+Attributes")
        {
          setIsLoading(_ => true)
          setSuggestedAttributes(_ => {return []})
          setSuggestedRelationships(_ => {return []})

          const currentDomainDesciption = isIgnoreDomainDescription ? "" : domainDescription
          const url = "http://127.0.0.1:5000/suggest"
          const userChoice = "attributes"
          const body_data = JSON.stringify({"entity": entityName, "user_choice": userChoice, "domain_description": currentDomainDesciption})
          const headers = { "Content-Type": "application/json" }
          const is_fetch_stream_data = true

          if (!is_fetch_stream_data)
          {
            fetch(url, { method: "POST", headers, body: body_data })
            .then(response => response.json())
            .then(data => 
                {
                  for (let i = 0; i < data.length; i++)
                  {
                    let attribute : Attribute = data[i]
                    console.log("Attribute: ")
                    console.log(attribute)
                    setSuggestedAttributes(previousSuggestedAttributes => {
                      return [...previousSuggestedAttributes, attribute]
                    })
                  }
                })
            .catch(error => console.log(error))
            setIsLoading(_ => false)
            return
          }

          // Fetch the event stream from the server
          // Code from: https://medium.com/@bs903944/event-streaming-made-easy-with-event-stream-and-javascript-fetch-8d07754a4bed
          fetch(url, { method: "POST", headers, body: body_data })
          .then(response =>
            {
              const stream = response.body; // Get the readable stream from the response body

              if (stream == null)
              {
                console.log("Stream is null")
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
                            let attribute : Attribute = JSON.parse(jsonStringParts[i])
                            console.log("Attribute: ")
                            console.log(attribute)
                            setSuggestedAttributes(previousSuggestedAttributes => {
                              return [...previousSuggestedAttributes, attribute]
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
          });
        }
        else if (buttonInnerHTML === "+Relationships")
        {
          setSuggestedAttributes(_ => {return []})
          setSuggestedRelationships(_ => {return []})

          const url = "http://127.0.0.1:5000/suggest"
          const userChoice = "relationships"
          const body_data = JSON.stringify({"entity": entityName, "user_choice": userChoice, "domain_description": currentDomainDesciption})
          const headers = { "Content-Type": "application/json" }
          const is_fetch_stream_data = true

          if (!is_fetch_stream_data)
          {
            fetch(url, { method: "POST", headers, body: body_data })
            .then(response => response.json())
            .then(data => 
                {
                  console.log("Data: ")
                  console.log(data)
                  console.log("----")
  
                  for (let i = 0; i < data.length; i++)
                  {
                    const relationship = data[i]
                    const editedRelationship : Relationship = { "name": relationship.name, "source_entity": relationship.source, "target_entity": relationship.target, "inference": relationship.inference, inference_indexes: relationship.inference_indexes, "description": "", "cardinality": relationship.cardinality}
  
                    setSuggestedRelationships(previousSuggestedRelationships => {
                      return [...previousSuggestedRelationships, editedRelationship]
                    })
                  }
                })
            .catch(error => console.log(error))
            return
          }
          else
          {
            fetch(url, { method: "POST", headers, body: body_data })
              .then(response =>
              {
                const stream = response.body; // Get the readable stream from the response body

                if (stream == null)
                {
                  console.log("Stream is null")
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
                              let relationship : Relationship = JSON.parse(jsonStringParts[i])

                              console.log("Relationship: ")
                              console.log(relationship)
                              setSuggestedRelationships(previousSuggestedRelationships => {
                                return [...previousSuggestedRelationships, relationship]
                              })
                            }

                            readChunk(); // Read the next chunk
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
            });
          }
        }
        else
        {
          alert(`Clicked on unknown button: ${buttonInnerHTML}`)
        }

        setIsLoading(_ => false)
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
                        <span key={`${attribute.name}-${index}`}> +{attribute.name}: {attribute.data_type} <br /> </span>
                    ))}
                    </p>
                 </div>
        };
        return node;
      }
    
      useEffect(() =>
      {
        updateNodes()

        parseSerializedConceptualModel()

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
    
    
      const addAttributesToNode = (event : React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
      {
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
    
          const newAttributeObject = { name: attributeToAdd.name, inference: attributeToAdd.inference, inference_indexes: newInferenceIndexes, data_type: attributeToAdd.data_type}
    
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
        const relationshipIndex = event.currentTarget.id.slice(6)
        const relationshipToAdd = suggestedRelationships[Number(relationshipIndex)]
        const sourceNodeID = sourceEntity.toLowerCase()
        const targetNodeID = relationshipToAdd.target_entity.toLowerCase()
    
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

      const showInference = (event : React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
      {
        // TODO: probably add to method argument "isAttribute" similar to `editSuggestion` method in Sidebar.tsx
        // TODO: probably move this function into file `useInferenceIndexes.tsx`
        const targetID = Number(event.currentTarget.id.slice(6))

        setIsShowOverlay(_ => true)
        
        if (suggestedAttributes.length > targetID)
        {
          const attribute = suggestedAttributes[targetID]
          setInferenceIndexesMockUp(_ => attribute.inference_indexes)
        }

        if (suggestedRelationships.length > targetID)
        {
          const relationship = suggestedRelationships[targetID]
          setInferenceIndexesMockUp(_ => relationship.inference_indexes)
        }
        
        console.log("Showing inference")
      }

      const handleIgnoreDomainDescriptionChange = () =>
      {
        setIsIgnoreDomainDescription(previousValue => !previousValue)
      }
    
    return { nodes, edges, onNodesChange, onEdgesChange, onConnect, handleIgnoreDomainDescriptionChange, onPlusButtonClick, onSummaryButtonClick,
        summaryData, capitalizeString, domainDescription, setDomainDescription, inferenceIndexes, inferenceIndexesMockUp, isShowOverlay, setIsShowOverlay,
        isLoading, suggestedAttributes, suggestedRelationships, addAttributesToNode, addRelationshipsToNodes, showInference
    }
}

export default useConceptualModel