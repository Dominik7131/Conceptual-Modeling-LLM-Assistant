import Stack from '@mui/material/Stack';
import ReactFlow, { Node, Edge, OnConnect, OnNodesChange, OnEdgesChange, MiniMap, Controls, Background, EdgeProps, NodeTypes } from 'reactflow';
import CustomEdge from './CustomEdge';
import { Item } from '../interfaces';

interface Props
{
  nodes : Node[],
  edges : Edge[],
  onNodesChange : OnNodesChange,
  onEdgesChange : OnEdgesChange,
  onConnect : OnConnect,
  sidebarWidthPercentage : number
  nodeTypes : NodeTypes
}


const edgeTypes =
{
  'custom-edge': CustomEdge
}


const ConceptualModel: React.FC<Props> = ({nodes, edges, onNodesChange, onEdgesChange, onConnect, sidebarWidthPercentage, nodeTypes}) =>
{
  const heightPx = 587

  // Define custom edge type for selected state

  return (
          <Stack width={`${100 - sidebarWidthPercentage}%`} height={`${heightPx}px`}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}>
                <MiniMap nodeStrokeWidth={3} zoomable pannable />
                <Controls />
                <Background color="black" />
            </ReactFlow>
          </Stack>
      )
}

export default ConceptualModel