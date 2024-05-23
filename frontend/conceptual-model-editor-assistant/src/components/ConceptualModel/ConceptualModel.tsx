import Stack from '@mui/material/Stack';
import ReactFlow, { Node, Edge, OnConnect, MiniMap, Controls, Background, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange, useOnSelectionChange, BackgroundVariant } from 'reactflow';
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';
import { Field, Item, ItemType, Association } from '../../interfaces';
import { edgesState, editedSuggestedItemState, isItemInConceptualModelState, isShowCreateEdgeDialogState, isSuggestedItemState, nodesState, selectedSuggestedItemState, sidebarWidthPercentageState, topbarHeightPxState } from '../../atoms';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useCallback, useEffect } from 'react';
import { loadDefaultConceptualModel } from '../../utils/import';


const nodeTypes = { customNode: CustomNode };
const edgeTypes = { "custom-edge": CustomEdge }


const ConceptualModel: React.FC = () =>
{
  const [nodes, setNodes] = useRecoilState(nodesState)
  const [edges, setEdges] = useRecoilState(edgesState)

  const setSelectedSuggestedItem = useSetRecoilState(selectedSuggestedItemState)
  const setEditedSuggestedItem = useSetRecoilState(editedSuggestedItemState)

  const setIsSuggestedItem = useSetRecoilState(isSuggestedItemState)
  const setIsItemInConceptualModel = useSetRecoilState(isItemInConceptualModelState)
  
  const setIsShowCreateEdgeDialog = useSetRecoilState(isShowCreateEdgeDialogState)
  const sidebarWidthPercentage = useRecoilValue(sidebarWidthPercentageState)

  const topbarHeightPx = useRecoilValue(topbarHeightPxState)
  const heightPx = 947 - topbarHeightPx


  const onNodesChange = useCallback((changes: NodeChange[]) =>
  {
    setNodes((currentNodes) => applyNodeChanges(changes, currentNodes))
  },[],)

  const onEdgesChange = useCallback((changes: EdgeChange[]) =>
  {
    setEdges((currentEdges) => applyEdgeChanges(changes, currentEdges))
  },[],)


  const onConnect : OnConnect = useCallback((params) =>
  { 
    const sourceClass = params[Field.SOURCE_CLASS]
    const targetClass = params[Field.TARGET_CLASS]

    if (!sourceClass || !targetClass)
    {
      return
    }

    const newAssociation: Association = {
      [Field.IRI]: "", [Field.NAME]: "", [Field.DESCRIPTION]: "", [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: [],
      [Field.TYPE]: ItemType.ASSOCIATION, [Field.SOURCE_CARDINALITY]: "", [Field.TARGET_CARDINALITY]: "", [Field.SOURCE_CLASS]: sourceClass,
      [Field.TARGET_CLASS]: targetClass
    }

    setSelectedSuggestedItem(_ => newAssociation)
    setEditedSuggestedItem(_ => newAssociation)

    setIsSuggestedItem(false)
    setIsItemInConceptualModel(false)

    setIsShowCreateEdgeDialog(true)
  }, [])


  useEffect(() =>
  {
    // loadDefaultConceptualModel(setNodes, setEdges)
  }, [])

  // useEffect(() =>
  // {
  //   console.log(nodes)
  // }, [nodes])


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
                minZoom={0.05}
                >
                <MiniMap nodeStrokeWidth={3} zoomable pannable />
                <Controls />
                <Background color="black"/>
            </ReactFlow>
          </Stack>
      )
}

export default ConceptualModel