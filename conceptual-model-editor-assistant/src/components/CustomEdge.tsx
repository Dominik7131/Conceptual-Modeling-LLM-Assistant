import { BaseEdge, EdgeLabelRenderer, EdgeProps, getStraightPath } from 'reactflow';
import { ItemType, Relationship } from '../interfaces';
import { useState } from 'react';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import { Typography } from '@mui/material';


// Inspiration: https://reactflow.dev/learn/customization/custom-edges
// List of available props: https://reactflow.dev/api-reference/types/edge-props
export default function CustomEdge ({ id, sourceX, sourceY, targetX, targetY, source, target, selected, label, data }: EdgeProps) : JSX.Element
{
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const [edgePath, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });

  let strokeColor = "black"

  if (selected)
  {
    strokeColor = "#2196f3"
  }

  const relationship : Relationship = {
    ID: data.ID, type: ItemType.RELATIONSHIP, name: (label as string), description: data.description,
    source: source, target: target, cardinality: data.cardinality, inference: data.inference, inferenceIndexes: data.inferenceIndexes
  }

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{stroke: strokeColor, strokeWidth: "2px"}} />
      <EdgeLabelRenderer>
        <Button className="nodrag nopan" color="primary" variant="outlined" size="small"
                sx={{background: "white", color: "black", paddingX: "30px", textTransform: "capitalize", position: "absolute", transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: "all", "&:hover": {backgroundColor: "white"}}}
                // onClick={() => data.onEdit(relationship)}
                onMouseEnter={() => setIsHovered(_ => true)} 
                onMouseLeave={() => setIsHovered(_ => false)}
                >
                { label }
                { isHovered &&
                  <Typography color="primary" onClick={() => data.onEdit(relationship)}>
                      <EditIcon/> 
                  </Typography>}
        </Button>
      </EdgeLabelRenderer>
    </>
  );
}