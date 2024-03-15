import ReactFlow, { Node, Edge, OnConnect, OnNodesChange, OnEdgesChange, MiniMap, Controls, Background } from 'reactflow';


interface Props
{
  nodes : Node[],
  edges : Edge[],
  onNodesChange : OnNodesChange,
  onEdgesChange : OnEdgesChange,
  onConnect : OnConnect
}

const ConceptualModel: React.FC<Props> = ({nodes, edges, onNodesChange, onEdgesChange, onConnect}) =>
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