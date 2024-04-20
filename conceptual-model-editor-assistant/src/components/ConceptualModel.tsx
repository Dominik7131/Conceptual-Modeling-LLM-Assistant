import Stack from '@mui/material/Stack';
import ReactFlow, { Node, Edge, OnConnect, MiniMap, Controls, Background, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange, useOnSelectionChange } from 'reactflow';
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';
import { Field, Item, ItemType, Relationship } from '../interfaces';
import { edgesState, editedSuggestedItemState, isShowCreateEdgeDialogState, nodesState, selectedSuggestedItemState, sidebarWidthPercentageState } from '../atoms';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useCallback, useEffect } from 'react';
import useConceptualModel from '../hooks/useConceptualModel';


const nodeTypes = { customNode: CustomNode };
const edgeTypes = { 'custom-edge': CustomEdge }


const ConceptualModel: React.FC = () =>
{
  const [nodes, setNodes] = useRecoilState(nodesState)
  const [edges, setEdges] = useRecoilState(edgesState)

  const setSelectedSuggestedItem = useSetRecoilState(selectedSuggestedItemState)

  const setEditedSuggestedItem = useSetRecoilState(editedSuggestedItemState)
  const setIsShowCreateEdgeDialog = useSetRecoilState(isShowCreateEdgeDialogState)

  const { parseSerializedConceptualModel } = useConceptualModel()


  const onNodesChange = useCallback((changes: NodeChange[]) =>
  {
    setNodes((currentNodes) => applyNodeChanges(changes, currentNodes))
  },[],)

  const onEdgesChange = useCallback((changes: EdgeChange[]) =>
  {
    setEdges((currentEdges) => applyEdgeChanges(changes, currentEdges))
  },[],)


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
      [Field.TYPE]: ItemType.RELATIONSHIP, [Field.SOURCE_CARDINALITY]: "", [Field.TARGET_CARDINALITY]: "", [Field.SOURCE_ENTITY]: sourceEntityName,
      [Field.TARGET_ENTITY]: targetEntityName, [Field.IS_GENERALIZATION]: false
    }

    setSelectedSuggestedItem(_ => blankRelationship)
    setEditedSuggestedItem(_ => blankRelationship)

    setIsShowCreateEdgeDialog(_ => true)

  }, [setEdges]);


  useEffect(() =>
  {
    parseSerializedConceptualModel()
  }, [])


  const sidebarWidthPercentage = useRecoilValue(sidebarWidthPercentageState)

  const heightPx = 586

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
                edgeTypes={edgeTypes}
                fitView>
                <MiniMap nodeStrokeWidth={3} zoomable pannable />
                <Controls />
                <Background color="black" />
            </ReactFlow>
          </Stack>
      )
}

export default ConceptualModel