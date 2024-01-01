import SideBar from './SideBar';
import { useCallback, useEffect, useState } from 'react';
import ReactFlow, { useNodesState, useEdgesState, addEdge, MiniMap, ReactFlowProvider, useOnSelectionChange } from 'reactflow';

import 'reactflow/dist/style.css';

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: <p> <strong>School</strong></p>, title: "School", attributes: [{ name: "a1", data_type: "string"}, { name: "a2", data_type: "int"}] } },
  { id: '2', position: { x: 0, y: 200 }, data: { label: <p> <strong>Course</strong></p>, title: "Course", attributes: [{ name: "b1", data_type: "string"}, { name: "b2", data_type: "int"}] } },
  //{ id: '3', position: { x: 0, y: 400 }, data: { label: <p> <strong>Professor</strong></p>, title: "Professor", attributes: [{ name: "c1", data_type: "string"}, { name: "c2", data_type: "int"}] } },
];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

function App()
{
  // What is happening: https://reactflow.dev/learn/concepts/core-concepts
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [suggestedAttributes, setSuggestedAttributes] = useState([])

  const [isMultiSelection, setIsMultiSelection] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState([]);

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

  useOnSelectionChange({
    onChange
  });

  const onPlusAttributes = (event) =>
  {
    let entityName = ""
    const targetNodeID = event.target.id
    entityName = nodes[targetNodeID - 1].data.title

    console.log(`Suggesting attributes for: ${entityName}`)
    const attributesToSuggest = 3

    setSuggestedAttributes(_ => {return []})

    for (let i = 0; i < attributesToSuggest; i++)
    {
       const newSuggestedAttribute = {name: `${entityName}-attribute-${i}`, inference: "lorem ipsum", data_type: "string", node_ID: targetNodeID}
       setSuggestedAttributes(previousSuggestedAttributes => {
        return [...previousSuggestedAttributes, newSuggestedAttribute]
       })
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
          label: <div >
                      <div>
                        <button id={nodeID} onClick={(event) => onPlusAttributes(event)}> +Attributes </button>
                        <button> +Relationships </button>
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

  return (
    <div >
      <SideBar
        attributes={suggestedAttributes}
        addAttributesToNode={addAttributesToNode}
        isMultiSelection={isMultiSelection}
        selectedNodes={selectedNodes}
      />

      {/* {isMultiSelection && <button onClick={(event) => addAttributesToNode(event)}>Get summary</button>} */}

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
