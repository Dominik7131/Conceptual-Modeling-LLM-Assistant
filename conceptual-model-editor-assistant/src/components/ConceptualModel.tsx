import Stack from '@mui/material/Stack';
import ReactFlow, { Node, Edge, OnConnect, OnNodesChange, OnEdgesChange, MiniMap, Controls, Background } from 'reactflow';


interface Props
{
  nodes : Node[],
  edges : Edge[],
  onNodesChange : OnNodesChange,
  onEdgesChange : OnEdgesChange,
  onConnect : OnConnect,
  sidebarWidthPercentage : number
}

const ConceptualModel: React.FC<Props> = ({nodes, edges, onNodesChange, onEdgesChange, onConnect, sidebarWidthPercentage}) =>
{
  const heightPx = 560
  return (
          <Stack width={`${100 - sidebarWidthPercentage}%`} height={`${heightPx}px`}>
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
          </Stack>
      )
}

export default ConceptualModel