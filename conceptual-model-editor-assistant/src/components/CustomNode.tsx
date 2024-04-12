import Button from '@mui/material/Button';
import { useCallback, useState } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { Attribute, Entity, Field, ItemType, NodeData, UserChoice, primaryColor } from '../interfaces';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, ListItemIcon, Menu, MenuItem, Tooltip } from '@mui/material';
import ModeStandbyIcon from '@mui/icons-material/ModeStandby';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

import useUtility from '../hooks/useUtility';


 

// List of all NodeProps: https://reactflow.dev/api-reference/types/node-props
export default function TextUpdaterNode({ id, selected, data } : NodeProps)
{
    const [isEntityHovered, setIsEntityHovered] = useState<boolean>(false)

    const { capitalizeString } = useUtility()

    const nodeData = data as NodeData
    
    const entity: Entity = {
        [Field.ID]: 0, [Field.TYPE]: ItemType.ENTITY, [Field.NAME]: id, [Field.DESCRIPTION]: nodeData[Field.DESCRIPTION],
        [Field.ORIGINAL_TEXT]: nodeData[Field.ORIGINAL_TEXT], [Field.ORIGINAL_TEXT_INDEXES]: nodeData[Field.ORIGINAL_TEXT_INDEXES]
    }

    const attributes = data.attributes

    const borderNonSelected = "1px solid black"
    const borderSelected = `1px solid ${primaryColor}`

    // If the entity name is too long then display only the beginning of it with three dots at the end
    const spacesCount: number = entity.name.split(" ").length - 1
    let entityName = capitalizeString(entity.name)
    if (spacesCount === 0 && entityName.length > 12)
    {
        entityName = entityName.substring(0, 12) + "..."
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

    const HandleStyleCheck = {
        top: {
          right: -10,
          top: -20,
          background: "#555",
          minWidth: 20,
          height: 20,
          borderRadius: 4,
          placeItems: "center",
          display: "grid",
          color: "#fff",
          zIndex: 2
        },
        bottom: {
          right: -10,
          top: 43,
          background: "#555",
          minWidth: 20,
          height: 20,
          borderRadius: 4,
          placeItems: "center",
          display: "grid",
          color: "#fff",
          zIndex: 2
        }
      };


    return (
        <Box sx={{ width: "180px", textAlign: "center", backgroundColor: "white", border: selected ? borderSelected : borderNonSelected }}>

            <Handle type="target" position={Position.Top} style={{ background: selected ? primaryColor : "black" }}>
                {/* <Typography style={{ color: selected ? primaryColor : "black", position: "absolute", top: "-10px", left: "-1px", pointerEvents: "none"}}>x</Typography> */}
                {/* <HighlightOffIcon color='action' sx={{ marginLeft: "-8px", marginTop: "-10px", color: "black"}} style={{ width: 22, height: 22,  pointerEvents: "none" }} /> */}
            </Handle>

            <Handle type="source" position={Position.Bottom} style={{ background: selected ? primaryColor : "black" }}>
                {/* <ModeStandbyIcon color='action' sx={{ marginLeft: "-8px", marginTop: "-10px", color: "black"}} style={{ width: 22, height: 22,  pointerEvents: "none" }} /> */}
            </Handle>

            <Button size="small" fullWidth={true}
                sx={{ color: selected ? primaryColor : "black", fontSize: "17px", textTransform: 'none',
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
                <MenuItem onClick={() => { data.onEdit(entity); handleClose(); }}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                        Edit entity
                </MenuItem>
                <MenuItem onClick={() => { data.onAddNewAttribute(entity); handleClose(); }}>
                    <ListItemIcon>
                        <AddIcon fontSize="small" />
                    </ListItemIcon>
                        Add new attribute
                </MenuItem>


                <MenuItem onClick={() => { data.onSuggestItems(UserChoice.ATTRIBUTES, entity.name, null); handleClose(); }}>
                    <ListItemIcon>
                        <AutoFixHighIcon fontSize="small" />
                    </ListItemIcon>
                        Suggest attributes
                </MenuItem>
                
                <MenuItem onClick={() => { data.onSuggestItems(UserChoice.RELATIONSHIPS, entity.name, null); handleClose(); }}>
                    <ListItemIcon>
                        <AutoFixHighIcon fontSize="small" />
                    </ListItemIcon>
                        Suggest relationships
                    </MenuItem>
            </Menu>




            { attributes.length > 0 && <Divider sx={{backgroundColor: selected ? primaryColor : "gray"}}></Divider> }

            <Stack>
                {attributes.map((attribute : Attribute, index : number) =>
                (
                    <Button size="small" key={`${attribute.name}-${index}`}
                        style={{justifyContent: "flex-start"}}
                        sx={{ color: selected ? primaryColor : "black", fontSize: "12px", textTransform: 'lowercase'}}
                        onClick={() => data.onEdit(attribute)}>
                        {attribute.name}
                    </Button>
                ))}
            </Stack>
        </Box>

    )
}