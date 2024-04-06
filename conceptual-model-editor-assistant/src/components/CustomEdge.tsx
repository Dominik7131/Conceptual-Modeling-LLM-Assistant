import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, getStraightPath } from 'reactflow';
import { ItemType, Relationship, primaryColor } from '../interfaces';
import { useState } from 'react';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import { Typography } from '@mui/material';


// Inspiration: https://reactflow.dev/learn/customization/custom-edges
// List of available props: https://reactflow.dev/api-reference/types/edge-props
export default function CustomEdge ({ id, sourceX, sourceY, sourcePosition, targetPosition, targetX, targetY, source, target, selected, label, data }: EdgeProps) : JSX.Element
{
  const [isHovered, setIsHovered] = useState<boolean>(false)
  // const [edgePath, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });
  const [edgePath, labelX, labelY] = getBezierPath({sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition});

  let strokeColor = "black"

  if (selected)
  {
    strokeColor = primaryColor
  }

  const borderNonSelected = "1px solid black"
  const borderSelected = `1px solid ${primaryColor}`

  const relationship : Relationship = {
    ID: data.ID, type: ItemType.RELATIONSHIP, name: (label as string), description: data.description,
    source: source, target: target, cardinality: data.cardinality, inference: data.inference, inferenceIndexes: data.inferenceIndexes
  }

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{stroke: selected ? primaryColor : "black", strokeWidth: "1px"}} />
      <EdgeLabelRenderer>
        <Button className="nodrag nopan" color="primary" variant="outlined" size="small"
                sx={{ color: selected ? primaryColor : "black", background: "white", paddingX: "30px", textTransform: "capitalize",
                     border: selected ? borderSelected : borderNonSelected, position: "absolute", transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                     pointerEvents: "all", height: "30px", borderRadius: "30px", "&:hover": {backgroundColor: "white"}}}
                
                onMouseEnter={() => setIsHovered(_ => true)} 
                onMouseLeave={() => setIsHovered(_ => false)}
                >
                { label }

                <Typography
                  color={selected ? primaryColor : "black"}
                  onClick={() => data.onEdit(relationship)}
                  sx={{ display: isHovered ? "inline" : "none",  position: "absolute", right: 3, top: 3 }}
                >
                  <EditIcon sx={{ width: "20px", height: "20px" }}/> 
                </Typography>
        </Button>
      </EdgeLabelRenderer>
    </>
  );
}