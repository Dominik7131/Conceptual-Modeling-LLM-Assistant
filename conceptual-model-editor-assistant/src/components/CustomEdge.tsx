import { BaseEdge, EdgeLabelRenderer, EdgeProps, MarkerType, getBezierPath, getMarkerEnd, getStraightPath } from 'reactflow';
import { EdgeData, Field, ItemType, Relationship, primaryColor } from '../interfaces';
import { useState } from 'react';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import { Typography } from '@mui/material';
import useUtility, { capitalizeString, clipName } from '../hooks/useUtility';
import useConceptualModel from '../hooks/useConceptualModel';


// Inspiration: https://reactflow.dev/learn/customization/custom-edges
// List of available props: https://reactflow.dev/api-reference/types/edge-props
export default function CustomEdge ({ id, sourceX, sourceY, sourcePosition, targetPosition, targetX, targetY, selected, data }: EdgeProps) : JSX.Element
{
  const [isHovered, setIsHovered] = useState<boolean>(false)
  // const [edgePath, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });
  const [edgePath, labelX, labelY] = getBezierPath({sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition});

  const { onEditItem } = useConceptualModel()

  const edgeData: EdgeData = data as EdgeData
  const relationship: Relationship = edgeData.relationship


  const borderNonSelected = "1px solid black"
  const borderSelected = `1px solid ${primaryColor}`


  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{stroke: selected ? primaryColor : "black", strokeWidth: "1px"}} />
      <EdgeLabelRenderer>
        <Button className="nodrag nopan" color="primary" variant="outlined" size="small"
                sx={{ color: selected ? primaryColor : "black", background: "white", paddingX: "30px", textTransform: "none",
                     border: selected ? borderSelected : borderNonSelected, position: "absolute", transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                     pointerEvents: "all", height: "30px", borderRadius: "30px", "&:hover": {backgroundColor: "white"}}}
                
                onMouseEnter={() => setIsHovered(_ => true)} 
                onMouseLeave={() => setIsHovered(_ => false)}
                >
                { capitalizeString( clipName(relationship[Field.NAME])) }

                <Typography
                  color={selected ? primaryColor : "black"}
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