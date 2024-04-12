import Stack from '@mui/material/Stack';
import ReactFlow, { Node, Edge, OnConnect, OnNodesChange, OnEdgesChange, MiniMap, Controls, Background, EdgeProps, NodeTypes, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange, useOnSelectionChange } from 'reactflow';
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';
import { Field, Item, ItemType, Relationship } from '../interfaces';
import { edgesState, editedSuggestedItemState, isShowCreateEdgeDialogState, nodesState, selectedEdgesState, selectedNodesState, selectedSuggestedItemState, sidebarWidthPercentageState } from '../atoms';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useCallback, useEffect } from 'react';


const nodeTypes = { customNode: CustomNode };
const edgeTypes = { 'custom-edge': CustomEdge }


const ConceptualModel: React.FC = () =>
{
  const [nodes, setNodes] = useRecoilState(nodesState)
  const [edges, setEdges] = useRecoilState(edgesState)

  const setSelectedSuggestedItem = useSetRecoilState(selectedSuggestedItemState)

  const setEditedSuggestedItem = useSetRecoilState(editedSuggestedItemState)
  const setIsShowCreateEdgeDialog = useSetRecoilState(isShowCreateEdgeDialogState)


  const onNodesChange = useCallback((changes: NodeChange[]) =>
  {
    // We cannot completely update selected nodes here because NodeChange[] does not contain updated `node.data`
    setNodes((currentNodes) => applyNodeChanges(changes, currentNodes))
    setSelectedNodes((currentSelectedNodes) => applyNodeChanges(changes, currentSelectedNodes))
  },[],)

  const onEdgesChange = useCallback((changes: EdgeChange[]) =>
  {
    setEdges((currentEdges) => applyEdgeChanges(changes, currentEdges))
  },[],)

  // const setSelectedNodes = useSetRecoilState(selectedNodesState)
  // const setSelectedEdges = useSetRecoilState(selectedEdgesState)
  const [selectedNodes, setSelectedNodes] = useRecoilState(selectedNodesState)
  const [selectedEdges, setSelectedEdges] = useRecoilState(selectedEdgesState)
  
 
  useOnSelectionChange({
    onChange: ({ nodes, edges }) =>
    {
      setSelectedNodes(nodes.map((node) =>
      {
        return node
      }))

      setSelectedEdges(edges.map((edge) =>
      {
        return edge
      }))
    },
  })

  const updateSelectedNodes = () =>
  {
    if (selectedNodes.length === 0)
    {
      return 
    }

    // If the nodes update then also update selected nodes to work with the updated version of the nodes
    setSelectedNodes((selectedNodes) => selectedNodes.map((currentSelectedNode : Node) =>
    {
      const node = nodes.find(node => node.id === currentSelectedNode.id)

      if (!node)
      {
        return currentSelectedNode
      }
      else
      {
        return node
      }
    }));
  }

  const updateSelectedEdges = () =>
  {
    if (selectedEdges.length === 0)
    {
      return 
    }
  
    // If the edges update then also update selected edges to work with the updated version of the edges
    setSelectedEdges((selectedEdges) => selectedEdges.map((currentSelectedEdge : Edge) =>
    {
      const edge = edges.find(edge => edge.id === currentSelectedEdge.id)

      if (!edge)
      {
        return currentSelectedEdge
      }
      else
      {
        return edge
      }
    }));
  }

  useEffect(() =>
  {
    updateSelectedNodes()
  }, [nodes])

  useEffect(() =>
  {
    updateSelectedEdges()
  }, [edges])


  // TODO: Put this logic in a custom hook
  const onConnect : OnConnect = useCallback((params) =>
  { 
    const sourceEntityName = params.source
    const targetEntityName = params.target

    if (!sourceEntityName || !targetEntityName)
    {
      return 
    }

    const blankRelationship: Relationship = {
      [Field.ID]: -1, [Field.NAME]: "", [Field.DESCRIPTION]: "", [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: [],
      [Field.TYPE]: ItemType.RELATIONSHIP, [Field.CARDINALITY]: "", [Field.SOURCE_ENTITY]: sourceEntityName,
      [Field.TARGET_ENTITY]: targetEntityName
    }

    setSelectedSuggestedItem(_ => blankRelationship)
    setEditedSuggestedItem(_ => blankRelationship)

    setIsShowCreateEdgeDialog(_ => true)

  }, [setEdges]);

  const sidebarWidthPercentage = useRecoilValue(sidebarWidthPercentageState)

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