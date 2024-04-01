import Button from '@mui/material/Button';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getStraightPath } from 'reactflow';
import { Relationship } from '../interfaces';


// Inspiration: https://reactflow.dev/learn/customization/custom-edges
// List of available props: https://reactflow.dev/api-reference/types/edge-props
export default function CustomEdge ({ id, sourceX, sourceY, targetX, targetY, selected, label, data }: EdgeProps) : JSX.Element
{
  const [edgePath, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });

  let strokeColor = "black"

  if (selected)
  {
    strokeColor = '#2196f3'
  }

  // TODO: How to call "onEditItem" from "useConceptualModel" hook?
  // We probably need some context-management library such as Zustand or Recoil
  const relationship : Relationship = data

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{stroke: strokeColor, strokeWidth: "2px"}} />
      <EdgeLabelRenderer>
        <Button className="nodrag nopan" variant="outlined" color="primary" size="small"
                sx={{background: "white", position: 'absolute', transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: 'all', '&:hover': {backgroundColor: 'white',}}}>
                {/* // onClick={() => onEditItem(relationship)}> */}
                {label}
        </Button>
      </EdgeLabelRenderer>
    </>
  );
}