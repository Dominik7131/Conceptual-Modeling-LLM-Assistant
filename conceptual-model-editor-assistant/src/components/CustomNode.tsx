import Button from '@mui/material/Button';
import { useCallback, useState } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { Attribute, Entity, Field, ItemType } from '../interfaces';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
 
const handleStyle = { left: 10 }

// List of all NodeProps: https://reactflow.dev/api-reference/types/node-props
export default function TextUpdaterNode({ id, selected, data } : NodeProps)
{
    const [isHovered, setIsHovered] = useState<boolean>(false)
    
    const entity: Entity = {
        [Field.ID]: 0, [Field.TYPE]: ItemType.ENTITY, [Field.NAME]: id, [Field.DESCRIPTION]: data.description,
        [Field.INFERENCE]: data.inference, [Field.INFERENCE_INDEXES]: data.inference_indexes
    }

    const attributes = data.attributes

    const lightBlue = "#2196f3"
    const borderNonSelected = "1px solid black"
    const borderSelected = `1px solid ${lightBlue}`

    // If the entity name is too long then display only the beginning of it with three dots at the end
    const spacesCount: number = entity.name.split(" ").length - 1
    let entityName = entity.name
    if (spacesCount === 0 && entity.name.length > 12)
    {
        entityName = entity.name.substring(0, 12) + "..."
    }
 
    return (
        <Box sx={{backgroundColor: "white", border: selected ? borderSelected : borderNonSelected }}>
          {/* <p className="nodeTitle"><strong>{capitalizeString(name)}</strong></p> */}


          <Handle type="target" position={Position.Top} />
          <Handle type="source" position={Position.Bottom} />

          <Button size="small" fullWidth={true}
            sx={{ color: selected ? lightBlue : "black", fontSize: "17px", textTransform: 'capitalize',
                  overflow: "hidden", direction: 'ltr' }}
            // onClick={() => data.onEdit(entity)}
            onMouseEnter={() => setIsHovered(_ => true)} 
            onMouseLeave={() => setIsHovered(_ => false)}
            >
           <strong>{entityName}</strong>
            <Typography
                color={selected ? lightBlue : "black"}
                onClick={() => data.onEdit(entity)}
                sx={{ display: isHovered ? "inline" : "none", position: "absolute", right: 2, bottom: 1 }}
                >

                <EditIcon/> 
            </Typography>
          </Button>

          {
            attributes.length > 0 && <Divider sx={{backgroundColor: selected ? lightBlue : "gray"}}></Divider>
          }


        <Stack>
        {attributes.map((attribute : Attribute, index : number) =>
        (
            <Button size="small" key={`${attribute.name}-${index}`}
                sx={{ color: selected ? lightBlue : "black", fontSize: "12px", textTransform: 'lowercase'}}
                onClick={() => data.onEdit(attribute)}>
                +{attribute.name}
            </Button>
        ))}
        </Stack>
        </Box>

    )
}