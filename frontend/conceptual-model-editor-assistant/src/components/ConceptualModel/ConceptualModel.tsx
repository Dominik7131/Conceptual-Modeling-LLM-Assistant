import "reactflow/dist/style.css"
import ReactFlow, { OnConnect, MiniMap, Controls, Background, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from "reactflow"
import CustomNode from "./CustomNode/CustomNode"
import CustomEdge from "./CustomEdge"
import { BLACK_COLOR, Field } from "../../definitions/utility"
import { useRecoilState, useSetRecoilState } from "recoil"
import { useCallback } from "react"
import { Box, Divider } from "@mui/material"
import { createNewAssociation } from "../../utils/conceptualModel"
import { nodesState, edgesState, isItemInConceptualModelState } from "../../atoms/conceptualModel"
import { isShowCreateEdgeDialogState } from "../../atoms/dialogs"
import { selectedSuggestedItemState, editedSuggestedItemState, isSuggestedItemState } from "../../atoms/suggestions"
import { Association, CUSTOM_EDGE_TYPE, CUSTOM_NODE_TYPE } from "../../definitions/conceptualModel"


const nodeTypes = { [CUSTOM_NODE_TYPE]: CustomNode }
const edgeTypes = { [CUSTOM_EDGE_TYPE]: CustomEdge }


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
  },[setNodes],)

  const onEdgesChange = useCallback((changes: EdgeChange[]) =>
  {
    setEdges((currentEdges) => applyEdgeChanges(changes, currentEdges))
  },[setEdges],)


  const onConnect : OnConnect = useCallback((params) =>
  { 
    const sourceClassIRI = params[Field.SOURCE_CLASS]
    const targetClassIRI = params[Field.TARGET_CLASS]

    if (!sourceClassIRI || !targetClassIRI)
    {
      return
    }

    const newAssociation: Association = createNewAssociation(sourceClassIRI, targetClassIRI)

    setSelectedSuggestedItem(newAssociation)
    setEditedSuggestedItem(newAssociation)

    setIsSuggestedItem(false)
    setIsItemInConceptualModel(false)

    setIsShowCreateEdgeDialog(true)
  }, [setSelectedSuggestedItem, setEditedSuggestedItem, setIsSuggestedItem, setIsItemInConceptualModel, setIsShowCreateEdgeDialog])


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
            <Background color={BLACK_COLOR}/>
        </ReactFlow>
      </Box>
    </>
  )
}

export default ConceptualModel