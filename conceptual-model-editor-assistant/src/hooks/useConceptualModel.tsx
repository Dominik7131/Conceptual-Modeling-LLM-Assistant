import { useCallback, useEffect, useState } from 'react';
import { useNodesState, useEdgesState, addEdge, Node, Edge, useOnSelectionChange, OnConnect } from 'reactflow';

import 'reactflow/dist/style.css';

const initialNodes : Node[] = [{ id: 'student', position: { x: 100, y: 100 }, data: { label: "", attributes: [] } }, ];

const useConceptualModel = () =>
{
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
    const [suggestedAttributes, setSuggestedAttributes] = useState<Attribute[]>([])
    const [suggestedRelationships, setSuggestedRelationships] = useState<Relationship[]>([])
  
    const [sourceEntity, setSourceEntity] = useState<string>("")
  
    const [isMultiSelection, setIsMultiSelection] = useState<boolean>(false);
    const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  
    const [summaryData, setSummaryData] = useState<SummaryObject[]>([])
  
    const [domainDescription, setDomainDescription] = useState<string>("We know that courses have a name and a specific number of credits. Each course can have one or more professors, who have a name. Professors could participate in any number of courses. For a course to exist, it must aggregate, at least, five students, where each student has a name. Students can be enrolled in any number of courses. Finally, students can be accommodated in dormitories, where each dormitory can have from one to four students. Besides, each dormitory has a price.")
  
    const [inferenceIndexes, setInferenceIndexes] = useState<number[][]>([])

    const [isIgnoreDomainDescription, setIsIgnoreDomainDescription] = useState<boolean>(false)

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
        const domainDesciption = isIgnoreDomainDescription ? "" : "x"
    
        if (buttonInnerHTML === "+Relationships")
        {
          setSuggestedAttributes(_ => {return []})
          setSuggestedRelationships(_ => {return []})
    
          fetch(`http://127.0.0.1:5000/suggest?entity1=${entityName}&user_choice=r&domain_description=${domainDesciption}`)
          .then(response => response.json())
          .then(data => 
              {
                for (let i = 0; i < data.length; i++)
                {
                  let relationship = JSON.parse(data[i])
                  setSuggestedRelationships(previousSuggestedRelationships => {
                    return [...previousSuggestedRelationships, relationship]
                  })
                }
              })
          .catch(error => console.log(error))
          return
        }
        else if (buttonInnerHTML === "+Attributes")
        {
          setSuggestedAttributes(_ => {return []})
          setSuggestedRelationships(_ => {return []})
    
          fetch(`http://127.0.0.1:5000/suggest?entity1=${entityName}&user_choice=a&domain_description=${domainDesciption}`)
          .then(response => response.json())
          .then(data => 
              {
                for (let i = 0; i < data.length; i++)
                {
                  let attribute = JSON.parse(data[i])
                  setSuggestedAttributes(previousSuggestedAttributes => {
                    return [...previousSuggestedAttributes, attribute]
                  })
                }
              })
          .catch(error => console.log(error))
          return
        }
        else
        {
          alert(`Clicked on unknown button: ${buttonInnerHTML}`)
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
    
      const getDiscontinuousInferenceIndexes = (inference : string) =>
      {
        const sentenceEndMarkers = ['.', '!', '?']
        const wordsArray = inference.split(' ')
        let result = []
        let isContinuous = false
        let nextPositionToCheck = 0
        let currentWordIndex = 0
    
        for (let i = 0; i < domainDescription.length; i++)
        {
          if (domainDescription.slice(i, i + wordsArray[currentWordIndex].length) === wordsArray[currentWordIndex])
          {
            // console.log("Match: " + wordsArray[currentWordIndex])
            if (!isContinuous)
            {
              result.push(i)
            }
            isContinuous = true
    
            // Whole sequence found
            if (currentWordIndex === wordsArray.length - 1)
            {
              result.push(i + wordsArray[currentWordIndex].length)
              // console.log("Returning: ")
              // console.log(result)
              return result
            }
    
            i += wordsArray[currentWordIndex].length
            nextPositionToCheck = i
            currentWordIndex += 1
            continue
          }
    
          // Found hole
          if (currentWordIndex > 0 && isContinuous)
          {
            // console.log("Found hole: " + domainDescription[i - 1] + domainDescription[i] + domainDescription[i + 1])
            result.push(i + wordsArray[currentWordIndex - 1].length - 2)
            isContinuous = false
          }
    
          // End of sentence interrupts current sequence -> start again
          if (sentenceEndMarkers.includes(domainDescription[i]) && currentWordIndex > 0)
          {
            console.log("End of sentence")
            result = []
            i = nextPositionToCheck + 1
            currentWordIndex = 0
          }
        }
    
        return []
      }
    
      const getIndexesForOneInference = (inference : string) =>
      {
        if (!inference)
        {
          return []
        }
    
        for (let j = 0; j < domainDescription.length; j++)
        {
          if (inference.length + j > domainDescription.length)
          {
            const discontinuousInferenceIndex = getDiscontinuousInferenceIndexes(inference)
            return discontinuousInferenceIndex
          }
    
          const text = domainDescription.slice(j, inference.length + j)
    
          if (inference === text)
          {
            return [j, inference.length + j]
          }
        }
        return []
      }
    
      const capitalizeString = (string : string) =>
      {
        return string.charAt(0).toUpperCase() + string.slice(1)
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
    
        const domainDescriptionTextArea = document.getElementById("domainDescriptionText")
        if (domainDescriptionTextArea)
        {
          setDomainDescription(domainDescriptionTextArea.innerHTML)
        }
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
            const newInferenceIndexes = getIndexesForOneInference(node.data.attributes[i].inference)
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
    
      // useEffect(() =>
      // {
      //   console.log(inferenceIndexes)
      // }, [inferenceIndexes])
    
      // useEffect(() =>
      // {
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
    
          const newInferenceIndexes = getIndexesForOneInference(attributeToAdd.inference)
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

      const handleIgnoreDomainDescriptionChange = () =>
      {
        setIsIgnoreDomainDescription(previousValue => !previousValue)
      }
    
    return { nodes, edges, onNodesChange, onEdgesChange, onConnect, handleIgnoreDomainDescriptionChange, onPlusButtonClick, onSummaryButtonClick,
        summaryData, capitalizeString, domainDescription, setDomainDescription, inferenceIndexes,
        suggestedAttributes, suggestedRelationships, addAttributesToNode, addRelationshipsToNodes
    }
}

export default useConceptualModel