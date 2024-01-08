import TopBar from './TopBar'
import SideBar from './SideBar';
import { useCallback, useEffect, useState } from 'react';
import ReactFlow, { useNodesState, useEdgesState, addEdge, MiniMap, Controls, Background, ReactFlowProvider, useOnSelectionChange } from 'reactflow';

import 'reactflow/dist/style.css';


const initialNodes = [
  { id: '0', position: { x: 100, y: 100 }, data: { label: "", title: "student", attributes: [], relationships: [] } },
  //{ id: '1', position: { x: 300, y: 100 }, data: { label: "", title: "course", attributes: [], relationships: [] } },
  //{ id: '2', position: { x: 0, y: 100 }, data: { label: "", title: "professor", attributes: [] } },
];
const initialEdges = [] //{ id: 'e0-1', source: '0', target: '1' }]; //, {id: 'e1-2', source: '1', target: '2'}];

function App()
{
  // Documentation: https://reactflow.dev/learn/concepts/core-concepts
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [suggestedAttributes, setSuggestedAttributes] = useState([])
  const [suggestedRelationships, setSuggestedRelationships] = useState([])

  const [isMultiSelection, setIsMultiSelection] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState([]);

  const [isIgnoreDomainDescription, setIsIgnoreDomainDescription] = useState(false)

  const [summaryData, setSummaryData] = useState([])

  const [domainDescription, setDomainDescription] = useState("We know that courses have a name and a specific number of credits. Each course can have one or more professors, who have a name. Professors could participate in any number of courses. For a course to exist, it must aggregate, at least, five students, where each student has a name. Students can be enrolled in any number of courses. Finally, students can be accommodated in dormitories, where each dormitory can have from one to four students. Besides, each dormitory has a price.")

  const [inferenceIndexes, setInferenceIndexes] = useState([])


  let uniqueID = nodes.length

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onChange = useCallback(({ nodes, edges }) =>
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
    //console.log(nodes, edges);
  }, []);

  // On nodes/edges selection: https://codesandbox.io/p/sandbox/elegant-silence-gtg683?file=%2Fsrc%2FFlow.tsx%3A81%2C1
  useOnSelectionChange({
    onChange
  });

  const onPlusButtonClick = (event) =>
  {
    //console.log("On plus button nodes: " + nodes)
    const buttonInnerHTML = event.target.innerHTML

    let entityName = ""

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

    const targetNodeID = selectedNodes[0].id
    // console.log("Target node ID: " + targetNodeID)

    if (nodes.length <= targetNodeID)
    {
      console.log("Error: Nodes length: " + nodes.length + " but target node ID: " + targetNodeID)
      return
    }
    entityName = nodes[targetNodeID].data.title
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
              relationship.node_ID = targetNodeID
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
              attribute.node_ID = targetNodeID
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

  const onSummaryButtonClick = (event) =>
  {
    // Get titles of all selected entites
    let selectedEntites = ""
    for (let i = 0; i < selectedNodes.length; i++)
    {
      selectedEntites += `${selectedNodes[i].data.title},`
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

  const getDiscontinuousInferenceIndexes = (inference) =>
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

  const getIndexesForOneInference = (inference) =>
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

  const capitalizeString = (string) =>
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

  const updateNode = (node) =>
  {
    const title = node.data.title
    node.data =
    {
      ...node.data,
      label: <div className="node">
                  {/* Issue: onPlusButtonClick function is snapshotting the current nodes variable and it usually does not get updated
                    Possible solution: probably React Context (https://github.com/xyflow/xyflow/issues/1535)
                    Or do not use buttons inside node.

                  <div>
                    <button id={"a" + nodeID} onClick={(event) => onPlusButtonClick(event)}>+Attributes</button>
                    <button id={"r" + nodeID} onClick={(event) => onPlusButtonClick(event)}>+Relationships</button>
                    <br />
                  </div> */}

                  <p className="nodeTitle"><strong>{capitalizeString(title)}</strong></p>
                  <p>
                  {node.data.attributes.map((attribute, index) =>
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
    setDomainDescription(domainDescriptionTextArea.innerHTML)
    
  }, []);

  useEffect(() =>
  {
    if (isIgnoreDomainDescription)
    {
      document.getElementById("domainDescriptionText").style.color = '#D3D3D3';
    }
    else
    {
      document.getElementById("domainDescriptionText").style.color = 'black';
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
  //   console.log(nodes)
  // }, [nodes]);

  // useEffect(() =>
  // {
  //   console.log(edges)
  // }, [edges]);


  const addAttributesToNode = (event) =>
  {
    const attributeTargetID = event.target.id.slice(6)
    // console.log(`Target attribute ID: ${attributeTargetID}`)
    const newAttribute = suggestedAttributes[attributeTargetID]
    const nodeID = newAttribute.node_ID
    // console.log(`Target node ID: ${nodeID}`)
    
    setNodes((nodes) => nodes.map((node) =>
    {
      //console.log(`Iteration: NodeID-${node.id}, TargetNodeID-${nodeID}`)
      if (node.id === nodeID)
      {
        const newInferenceIndexes = getIndexesForOneInference(newAttribute.inference)
        if (newInferenceIndexes.length !== 0)
        {
          setInferenceIndexes(previousInferenceIndexes =>
            {
              return [...previousInferenceIndexes, newInferenceIndexes]
            })
        }

        const newAttributeObject = { name: newAttribute.name, inference: newAttribute.inference, inference_indexes: newInferenceIndexes, data_type: newAttribute.data_type}

        // If the node already contains the selected attribute do not add anything
        let isAttributePresent = false
        node.data.attributes.forEach(attribute => {
          if (attribute.name === newAttributeObject.name)
          {
            isAttributePresent = true
          }
        })

        if (isAttributePresent)
        {
          console.log("Attribute is already present")
          return node;
        }

        console.log("Pushing new attributes")
        node.data.attributes.push(newAttributeObject)
        return updateNode(node)
      }
      return node;
    })
    );
  }

  const addRelationshipsToNodes = (event, relationshipObject) =>
  {
    console.log("Adding relationships to nodes")
    const relationshipIndex = event.target.id.slice(6)

    const addedRelationship = suggestedRelationships[relationshipIndex]
    const sourceNodeID = addedRelationship.node_ID
    console.log("Source node ID: " + sourceNodeID)

    let targetNodeID = 0
    let isTargetNodeID = false
    
    // Get target node id
    for (let i = 0; i < nodes.length; i++)
    {
      if (nodes[i].data.title.toLowerCase() === relationshipObject.target)
      {
        isTargetNodeID = true
        targetNodeID = i
        break
      }
    }

    if (isTargetNodeID)
    {
      console.log("Target node ID: " + targetNodeID)
    }
    else
    {
      console.log("Unknown target node ID, creating a new node")
    }


    if (!isTargetNodeID)
    {
      // Target node does not exist -> add a new node
      // console.log("Adding a new node")
      targetNodeID = uniqueID.toString();
      uniqueID++;
      const newNode = { id: targetNodeID, position: { x: 500, y: 100 }, data: { label: "", title: relationshipObject.target, attributes: [], relationships: [] } }

      setNodes(previousNodes => 
        {
          return [...previousNodes, newNode]
        })
      
      setNodes((nodes) => nodes.map((node) =>
      {
        // TODO: Check if relationships is not already present same as in attributes
        // TODO: Put this logic outside the "if (!isTargetNodeID)" so it gets applied even when new node is not added
        // TODO: Add inferences (wait for feedback on them)
        if (node.id === sourceNodeID)
        {
          // console.log("Pushing new relationship")
          // const newRelationshipObject = { name: relationshipObject.name, source: relationshipObject.source, target: relationshipObject.target}
          // node.data.relationships.push(newRelationshipObject)
          // return updateNode(node)
        }
        if (node.id === targetNodeID)
        {
          return updateNode(node)
        }
        return node
      }));
    }

    console.log("Adding a new edge")
    const newEdge = { id: `e${sourceNodeID}-${targetNodeID}`, source: sourceNodeID, target: targetNodeID.toString(), label: relationshipObject.name}

    // Check if edge is not contained in the edges
    // TODO: Do not add a new edge but still add info about this relationship into the nodes
    for (let i = 0; i < edges.length; i++)
    {
      const isEdge = edges[i].source === newEdge.source && edges[i].target === newEdge.target
      const isReverseEdge = edges[i].source === newEdge.target && edges[i].target === newEdge.source
      if (isEdge || isReverseEdge)
      {
        console.log("Edge already exists")
        return
      }
    }

    setEdges(previousEdges =>
      {
        return [...previousEdges, newEdge]
      })
  }

  const handleIgnoreDomainDescriptionChange = () =>
  {
    setIsIgnoreDomainDescription(previousValue => !previousValue)
  }

  return (
    <div className="appDiv">
      <TopBar
        handleIgnoreDomainDescriptionChange={handleIgnoreDomainDescriptionChange}
        onPlusButtonClick={onPlusButtonClick}
        onSummaryButtonClick={onSummaryButtonClick}
        summaryData={summaryData}
        capitalizeString={capitalizeString}
        domainDescription={domainDescription}
        setDomainDescription={setDomainDescription}
        inferenceIndexes={inferenceIndexes}
      />

      <SideBar
        attributes={suggestedAttributes}
        relationships={suggestedRelationships}
        addAttributesToNode={addAttributesToNode}
        addRelationshipsToNodes={addRelationshipsToNodes}
      />

      <div className="reactFlowDiv">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}>
            <MiniMap nodeStrokeWidth={3} zoomable pannable />
            <Controls />
            <Background color="black" variant="dots" />
        </ReactFlow>
      </div>
    </div>
  );
}

const application = () => (
  <ReactFlowProvider>
    <App />
  </ReactFlowProvider>
);

export default application
