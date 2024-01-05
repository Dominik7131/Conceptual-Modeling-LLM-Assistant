import SideBar from './SideBar';
import { useCallback, useEffect, useState } from 'react';
import ReactFlow, { useNodesState, useEdgesState, addEdge, MiniMap, Background, ReactFlowProvider, useOnSelectionChange } from 'reactflow';

import 'reactflow/dist/style.css';


const initialNodes = [
  { id: '0', position: { x: 0, y: 100 }, data: { label: "", title: "Student", attributes: [], relationships: [] } },
  //{ id: '1', position: { x: 0, y: 300 }, data: { label: "", title: "Course", attributes: [], relationships: [] } },
  //{ id: '2', position: { x: 0, y: 400 }, data: { label: "", title: "Professor", attributes: [] } },
];
const initialEdges = [] //{ id: 'e0-1', source: '0', target: '1' }]; //, {id: 'e1-2', source: '1', target: '2'}];

function App()
{
  // What is happening: https://reactflow.dev/learn/concepts/core-concepts
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [suggestedAttributes, setSuggestedAttributes] = useState([])
  const [suggestedRelationships, setSuggestedRelationships] = useState([])

  const [isMultiSelection, setIsMultiSelection] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState([]);

  const [isIgnoreDomainDescription, setIsIgnoreDomainDescription] = useState(false)

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
    console.log("On plus button nodes: " + nodes)
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
    console.log("Target node ID: " + targetNodeID)

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

      // const attributesToSuggest = 3

      // for (let i = 0; i < attributesToSuggest; i++)
      // {
      //   const newSuggestedAttribute = {name: `${entityName}-attribute-${i}`, inference: "lorem ipsum", data_type: "string", node_ID: targetNodeID}
      //   setSuggestedAttributes(previousSuggestedAttributes => {
      //     return [...previousSuggestedAttributes, newSuggestedAttribute]
      //   })
      // }
    }
    else
    {
      alert(`Clicked on unknown button: ${buttonInnerHTML}`)
    }
  }

  const capitalizeString = (string) =>
  {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  const updateNodes = () =>
  {
    console.log("Updating nodes")
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


  /*useEffect(() =>
  {
  }, [nodes]);*/

  const addAttributesToNode = (event) =>
  {
    // console.log("Event target: ")
    // console.log(event.target)
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
        const newAttributeObject = { name: newAttribute.name, data_type: newAttribute.data_type}

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
      console.log("Adding a new node")
      targetNodeID = uniqueID.toString();
      uniqueID++;
      console.log("Unique ID: " + uniqueID)
      const newNode = { id: targetNodeID, position: { x: 300, y: 100 }, data: { label: "", title: relationshipObject.target, attributes: [], relationships: [] } }
      const newEdge = { id: `e${sourceNodeID}-${targetNodeID}`, source: sourceNodeID, target: targetNodeID, label: relationshipObject.name}

      setNodes(previousNodes => 
        {
          return [...previousNodes, newNode]
        })
      
      setNodes((nodes) => nodes.map((node) =>
      {
        /*if (node.id === sourceNodeID)
        {
          const newRelationshipObject = { name: "r", data_type: "unknown"}
          node.data.attributes.push(newRelationshipObject)
          return updateNode(node)
        }*/
        if (node.id === targetNodeID)
        {
          return updateNode(node)
        }
        return node
      }));
      
      setEdges(previousEdges =>
        {
          return [...previousEdges, newEdge]
        })
    }
  }

  /*const handleCheckboxChange = () =>
  {
    setIsUseBackend(previousValue => !previousValue)
  }*/

  const handleIgnoreDomainDescriptionChange = () =>
  {
    setIsIgnoreDomainDescription(previousValue => !previousValue)
  }

  return (
    <div >
      <label className="domainDescriptionLabel" htmlFor="story">Domain description: </label>
      <input type="checkbox" id="isIgnoreDomainDescription" defaultChecked onClick={() => handleIgnoreDomainDescriptionChange()}></input>
      <br />
      <br />
      <textarea id="domainDescriptionText" name="story" rows="8" cols="70" defaultValue={"We know that courses have a name and a specific number of credits. Each course can have one or more professors, who have a name. Professors could participate in any number of courses. For a course to exist, it must aggregate, at least, five students, where each student has a name. Students can be enrolled in any number of courses. Finally, students can be accommodated in dormitories, where each dormitory can have from one to four students. Besides, each dormitory has a price."}></textarea>

      <div>
        {/* <label className="ignoreDomainDescriptionLabel" htmlFor="isIgnoreDomainDescription">Ignore domain description: </label> */}
        {/* <input type="checkbox" id="isIgnoreDomainDescription" onClick={() => handleIgnoreDomainDescriptionChange()}></input> */}
      </div>

      <div> <p></p></div>

      {/* <div>
        <label htmlFor="isBackend">Use backend: </label>
        <input type="checkbox" id="isBackend" defaultChecked onClick={() => handleCheckboxChange()}></input>
      </div> */}

      <div>
        <button className="plusButton" onClick={(event) => onPlusButtonClick(event)}>+Attributes</button>
        <button className="plusButton" onClick={(event) => onPlusButtonClick(event)}>+Relationships</button>
      </div>

      <SideBar
        attributes={suggestedAttributes}
        relationships={suggestedRelationships}
        addAttributesToNode={addAttributesToNode}
        addRelationshipsToNodes={addRelationshipsToNodes}
        isMultiSelection={isMultiSelection}
        selectedNodes={selectedNodes}
      />

      <div style={{ width: '100vw', height: '100vh' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}>
            <MiniMap nodeStrokeWidth={3} zoomable pannable />
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
