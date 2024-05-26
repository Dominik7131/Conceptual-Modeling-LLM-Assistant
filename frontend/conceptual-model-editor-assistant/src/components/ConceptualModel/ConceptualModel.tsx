import ReactFlow, { Node, Edge, OnConnect, MiniMap, Controls, Background, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange, useOnSelectionChange, BackgroundVariant } from 'reactflow';
import CustomNode from './CustomNode/CustomNode';
import CustomEdge from './CustomEdge';
import { Field, ItemType, Association } from '../../interfaces/interfaces';
import { edgesState, editedSuggestedItemState, isItemInConceptualModelState, isShowCreateEdgeDialogState, isSuggestedItemState, nodesState, selectedSuggestedItemState } from '../../atoms';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useCallback } from 'react';
import { Box, Divider } from '@mui/material';
import { createNewAssociation } from '../../utils/conceptualModel';


const nodeTypes = { customNode: CustomNode }
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

  const minZoom = 0.04


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
    const sourceClassIRI = params[Field.SOURCE_CLASS]
    const targetClassIRI = params[Field.TARGET_CLASS]

    if (!sourceClassIRI || !targetClassIRI)
    {
      return
    }

    const newAssociation: Association = createNewAssociation(sourceClassIRI, targetClassIRI)

    setSelectedSuggestedItem(_ => newAssociation)
    setEditedSuggestedItem(_ => newAssociation)

    setIsSuggestedItem(false)
    setIsItemInConceptualModel(false)

    setIsShowCreateEdgeDialog(true)
  }, [])


  return (
    <>
      <Divider/>

      <Box sx={{ flex: 2, width: "100%", height: "100%" }}>
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            minZoom={minZoom}
            >
            <MiniMap nodeStrokeWidth={3} zoomable pannable />
            <Controls />
            <Background color="black"/>
        </ReactFlow>
      </Box>
    </>
  )
}

export default ConceptualModel