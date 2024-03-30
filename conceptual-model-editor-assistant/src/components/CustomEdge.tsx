import Button from '@mui/material/Button';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getStraightPath, useReactFlow } from 'reactflow';


export default function CustomEdge ({ id, sourceX, sourceY, targetX, targetY, selected, label }: EdgeProps)
{
  const [edgePath, labelX, labelY] = getStraightPath({sourceX, sourceY, targetX, targetY });

  let strokeColor = "black"

  if (selected)
  {
    strokeColor = '#2196f3'
  }

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{stroke: strokeColor, strokeWidth: "2px"}} />
      <EdgeLabelRenderer>
        <Button className="nodrag nopan" variant="outlined" color="primary" size="small" sx={{background: "white", position: 'absolute', transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`, pointerEvents: 'all', '&:hover': {
          backgroundColor: 'white',
        },}}>
            {label}
        </Button>
      </EdgeLabelRenderer>
    </>
  );
}