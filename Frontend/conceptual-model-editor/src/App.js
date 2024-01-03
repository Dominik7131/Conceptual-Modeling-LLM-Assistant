import SideBar from './SideBar';
import { useCallback, useEffect, useState } from 'react';
import ReactFlow, { useNodesState, useEdgesState, addEdge, MiniMap, ReactFlowProvider, useOnSelectionChange } from 'reactflow';

import 'reactflow/dist/style.css';

const initialNodes = [
  { id: '1', position: { x: 0, y: 100 }, data: { label: <p> <strong>Student</strong></p>, title: "Student", attributes: [] } },
  { id: '2', position: { x: 0, y: 300 }, data: { label: <p> <strong>Coursesss</strong></p>, title: "Course", attributes: [] } },
  //{ id: '3', position: { x: 0, y: 400 }, data: { label: <p> <strong>Professor</strong></p>, title: "Professor", attributes: [] } },
];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }, {id: 'e2-3', source: '2', target: '3'}];

function App()
{
  // What is happening: https://reactflow.dev/learn/concepts/core-concepts
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [suggestedAttributes, setSuggestedAttributes] = useState([])
  const [suggestedRelationships, setSuggestedRelationships] = useState([])

  const [isMultiSelection, setIsMultiSelection] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState([]);

  const [isUseBackend, setIsUseBackend] = useState(true);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onChange = useCallback(({ nodes, edges }) =>
  {
    if (nodes[1] !== undefined)
    {
      console.log("Selected more than 1 node")
      setIsMultiSelection(true)
      setSelectedNodes(nodes)
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
    const buttonInnerHTML = event.target.innerHTML

    let entityName = ""
    const targetNodeID = event.target.id.slice(1)
    entityName = nodes[targetNodeID - 1].data.title

    if (buttonInnerHTML === "+Relationships")
    {
      setSuggestedAttributes(_ => {return []})
      setSuggestedRelationships(_ => {return []})

      if (isUseBackend)
      {
        console.log(entityName)
        fetch(`http://127.0.0.1:5000/suggest?entity1=${entityName}`)
        .then(response => response.json())
        .then(data => 
            {
              for (let i = 0; i < data.length; i++)
              {
                setSuggestedRelationships(previousSuggestedRelationships => {
                  return [...previousSuggestedRelationships, JSON.parse(data[i])]
                })
              }
            })
        .catch(error => console.log(error))
        return
      }
      else
      {

      }

    }
    else if (buttonInnerHTML === "+Attributes")
    {
      console.log(`Suggesting attributes for: ${entityName}`)
      const attributesToSuggest = 3

      setSuggestedAttributes(_ => {return []})
      setSuggestedRelationships(_ => {return []})

      for (let i = 0; i < attributesToSuggest; i++)
      {
        const newSuggestedAttribute = {name: `${entityName}-attribute-${i}`, inference: "lorem ipsum", data_type: "string", node_ID: targetNodeID}
        setSuggestedAttributes(previousSuggestedAttributes => {
          return [...previousSuggestedAttributes, newSuggestedAttribute]
        })
      }
    }
    else
    {
      alert(`Clicked on unknown button: ${buttonInnerHTML}`)
    }
  }

  const updateNodes = () =>
  {
    console.log("Updating nodes")
    setNodes((nodes) => nodes.map((node) =>
    {
        const title = node.data.title
        const nodeID = node.id
        node.data =
        {
          ...node.data,
          label: <div className="node">
                      <div>
                        <button id={"a" + nodeID} onClick={(event) => onPlusButtonClick(event)}>+Attributes</button>
                        <button id={"r" + nodeID} onClick={(event) => onPlusButtonClick(event)}>+Relationships</button>
                        <br />
                      </div>

                      <p><strong>{title}</strong></p>
                      <p>
                      {node.data.attributes.map((attribute, index) =>
                      (
                          <span key={`${attribute.name}-${index}`}> +{attribute.name}: {attribute.data_type} <br /> </span>
                      ))}
                      </p>
                  </div>
        };
        return node;
      }));
  }

  useEffect(() =>
  {
    updateNodes()
  }, []);
  

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
      }
      return node;
    })
    );

    updateNodes()
  }

  const addRelationshipsToNodes = () =>
  {
    console.log("Adding relationships to nodes")
  }

  const handleCheckboxChange = () =>
  {
    setIsUseBackend(previousValue => !previousValue)
  }

  return (
    <div >
      {/* <p><label>Review of W3Schools:</label></p>
      <textarea id="w3review"></textarea> */}
      <label className="domainDescriptionLabel" htmlFor="story">Domain description: <br /></label>

      <textarea id="story" name="story" rows="8" cols="70" defaultValue={"We know that courses have a name and a specific number of credits. Each course can have one or more professors, who have a name. Professors could participate in any number of courses. For a course to exist, it must aggregate, at least, five students, where each student has a name. Students can be enrolled in any number of courses. Finally, students can be accommodated in dormitories, where each dormitory can have from one to four students. Besides, each dormitory has a price."}></textarea>

      <div>
        <label htmlFor="isBackend">Use backend: </label>
        <input type="checkbox" id="isBackend" defaultChecked onClick={() => handleCheckboxChange()}></input>
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
        </ReactFlow>

      </div>
    </div>
  );
}

export default () => (
  <ReactFlowProvider>
    <App />
  </ReactFlowProvider>
);
