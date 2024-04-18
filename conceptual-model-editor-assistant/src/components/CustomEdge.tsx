import { BaseEdge, EdgeLabelRenderer, EdgeProps, MarkerType, getBezierPath, getMarkerEnd, getSimpleBezierPath, getStraightPath } from 'reactflow';
import { EdgeData, Field, ItemType, Relationship, PRIMARY_COLOR } from '../interfaces';
import { useState } from 'react';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import { Typography } from '@mui/material';
import useUtility, { CUSTOM_EDGE_MARKER, CUSTOM_ISA_EDGE_MARKER, capitalizeString, clipName } from '../hooks/useUtility';
import useConceptualModel from '../hooks/useConceptualModel';


// Inspiration: https://reactflow.dev/learn/customization/custom-edges
// List of available props: https://reactflow.dev/api-reference/types/edge-props
export default function CustomEdge ({ id, sourceX, sourceY, sourcePosition, targetPosition, targetX, targetY, selected, data, markerEnd }: EdgeProps) : JSX.Element
{
  const [isHovered, setIsHovered] = useState<boolean>(false)
  // const [edgePath, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });
  // const { sx, sy, tx, ty, sourcePos, targetPos } = getParams(sourceNode, targetNode);
  const [edgePath, labelX, labelY] = getSimpleBezierPath({sourceX: sourceX, sourceY: sourceY, targetX: targetX, targetY: targetY, sourcePosition: sourcePosition, targetPosition: targetPosition});

  const { onEditItem } = useConceptualModel()

  const edgeData: EdgeData = data as EdgeData
  const relationship: Relationship = edgeData.relationship


  const borderNonSelected = "1px solid black"
  const borderSelected = `1px solid ${PRIMARY_COLOR}`

  // console.log(markerEnd)
  // const markerEndString = "url(#1__color=red&height=40&strokeWidth=0.8&type=arrow&width=40)"

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={{background: "red", stroke: selected ? PRIMARY_COLOR : "black", strokeWidth: "1px"}}/>
      <EdgeLabelRenderer>
        <Button className="nodrag nopan" color="primary" variant="outlined" size="small"
                sx={{ color: selected ? PRIMARY_COLOR : "black", background: "white", paddingX: "30px", textTransform: "none",
                     border: selected ? borderSelected : borderNonSelected, position: "absolute", transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                     pointerEvents: "all", minHeight: "30px", borderRadius: "30px", "&:hover": {backgroundColor: "white"}}}
                
                onMouseEnter={() => setIsHovered(_ => true)} 
                onMouseLeave={() => setIsHovered(_ => false)}
                >
                { capitalizeString( clipName(relationship[Field.NAME], 18)) }

                <Typography
                  color={selected ? PRIMARY_COLOR : "black"}
                  onClick={() => onEditItem(relationship)}
                  sx={{ display: isHovered ? "inline" : "none",  position: "absolute", right: 3, top: 3 }}
                >
                  <EditIcon sx={{ width: "20px", height: "20px" }}/> 
                </Typography>
        </Button>
      </EdgeLabelRenderer>
    </>
  );
}