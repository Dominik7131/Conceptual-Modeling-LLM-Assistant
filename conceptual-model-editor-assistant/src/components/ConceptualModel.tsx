import ReactFlow, { Node, Edge, useNodesState, OnConnect, OnNodesChange, OnEdgesChange, MiniMap, Controls, Background, ReactFlowProvider } from 'reactflow';


interface props {
  nodes : Node[],
  edges : Edge[],
  onNodesChange : OnNodesChange,
  onEdgesChange : OnEdgesChange,
  onConnect : OnConnect
}

const ConceptualModel: React.FC<props> = ({nodes, edges, onNodesChange, onEdgesChange, onConnect}) =>
{
    return (
            <div className="reactFlowDiv">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}>
                <MiniMap nodeStrokeWidth={3} zoomable pannable />
                <Controls />
                <Background color="black" />
            </ReactFlow>
            </div>
        )
}

export default ConceptualModel