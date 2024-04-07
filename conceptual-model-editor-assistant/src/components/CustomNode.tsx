import Button from '@mui/material/Button';
import { useCallback, useState } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { Attribute, Entity, Field, ItemType, UserChoice, primaryColor } from '../interfaces';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, Menu, MenuItem } from '@mui/material';
 

// List of all NodeProps: https://reactflow.dev/api-reference/types/node-props
export default function TextUpdaterNode({ id, selected, data } : NodeProps)
{
    const [isEntityHovered, setIsEntityHovered] = useState<boolean>(false)
    
    const entity: Entity = {
        [Field.ID]: 0, [Field.TYPE]: ItemType.ENTITY, [Field.NAME]: id, [Field.DESCRIPTION]: data.description,
        [Field.INFERENCE]: data.inference, [Field.INFERENCE_INDEXES]: data.inference_indexes
    }

    const attributes = data.attributes

    const borderNonSelected = "1px solid black"
    const borderSelected = `1px solid ${primaryColor}`

    // If the entity name is too long then display only the beginning of it with three dots at the end
    const spacesCount: number = entity.name.split(" ").length - 1
    let entityName = entity.name
    if (spacesCount === 0 && entity.name.length > 12)
    {
        entityName = entity.name.substring(0, 12) + "..."
    }


    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) =>
    {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () =>
    {
      setAnchorEl(null)
    }


    return (
        <Box sx={{backgroundColor: "white", border: selected ? borderSelected : borderNonSelected }}>

            <Handle type="target" position={Position.Top} style={{ background: selected ? primaryColor : "black" }} />
            <Handle type="source" position={Position.Bottom} style={{ background: selected ? primaryColor : "black" }} />

            <Button size="small" fullWidth={true}
                sx={{ color: selected ? primaryColor : "black", fontSize: "17px", textTransform: 'capitalize',
                        overflow: "hidden", direction: 'ltr' }}
                onMouseEnter={() => setIsEntityHovered(_ => true)} 
                onMouseLeave={() => setIsEntityHovered(_ => false)}
                >
                <strong>{entityName}</strong>

                <Typography
                    id="long-button"
                    // onClick={() => data.onEdit(entity)}
                    onClick={handleClick}
                    sx={{ display: (isEntityHovered || anchorEl) ? "block" : "none", position: "absolute", right: "0px", top: "6px" }}
                    >
                    <MoreVertIcon />
                </Typography>
            </Button>

            {/* https://mui.com/material-ui/react-menu/ */}
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{'aria-labelledby': 'basic-button'}}
                >
                <MenuItem onClick={() => { data.onEdit(entity); handleClose(); }}>Edit entity</MenuItem>
                <MenuItem onClick={() => { data.onAddNewAttribute(entity); handleClose(); }}>Add new attribute</MenuItem>
                <MenuItem onClick={() => { data.onSuggestItems(UserChoice.ATTRIBUTES, entity, null); handleClose(); }}>Suggest attributes</MenuItem>
                <MenuItem onClick={() => { data.onSuggestItems(UserChoice.RELATIONSHIPS, entity, null); handleClose(); }}>Suggest relationships</MenuItem>
            </Menu>




            { attributes.length > 0 && <Divider sx={{backgroundColor: selected ? primaryColor : "gray"}}></Divider> }

            <Stack>
                {attributes.map((attribute : Attribute, index : number) =>
                (
                    <Button size="small" key={`${attribute.name}-${index}`}
                        sx={{ color: selected ? primaryColor : "black", fontSize: "12px", textTransform: 'lowercase'}}
                        onClick={() => data.onEdit(attribute)}>
                        +{attribute.name}
                    </Button>
                ))}
            </Stack>
        </Box>

    )
}