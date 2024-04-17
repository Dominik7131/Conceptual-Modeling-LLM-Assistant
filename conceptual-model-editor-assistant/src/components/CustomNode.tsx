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
import useUtility, { capitalizeString, clipName } from '../hooks/useUtility';
import useConceptualModel from '../hooks/useConceptualModel';


 
// List of all NodeProps: https://reactflow.dev/api-reference/types/node-props
export default function TextUpdaterNode({ selected, data } : NodeProps)
{
    const [isEntityHovered, setIsEntityHovered] = useState<boolean>(false)

    const { onEditItem, onSuggestItems, onAddNewAttribute } = useConceptualModel()

    const nodeData: NodeData = data as NodeData
    const entity: Entity = nodeData.entity

    const attributes: Attribute[] = nodeData.attributes

    const borderNonSelected = "1px solid black"
    const borderSelected = `1px solid ${primaryColor}`

    // If the entity name is too long then display only the beginning of it with three dots at the end
    const spacesCount: number = entity[Field.NAME].split(" ").length - 1
    let entityName = capitalizeString(entity[Field.NAME])
    if (spacesCount === 0 && entityName.length > 12)
    {
        entityName = entityName.substring(0, 12) + "..."
    }    

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) =>
    {
      setAnchorEl(event.currentTarget);
    }

    const handleClose = () =>
    {
      setAnchorEl(null)
    }

    const handleOffset = 7


    return (
        <Box sx={{ width: "180px", textAlign: "center", backgroundColor: "white", border: (selected || isEntityHovered) ? borderSelected : borderNonSelected}}>

            <Handle type="source" position={Position.Top} style={{ top: `-${handleOffset}px`, background: selected ? primaryColor : "black" }}>
                { isEntityHovered && <Typography fontSize="13px" color={selected ? primaryColor : "black"}> s </Typography> }
            </Handle>

            <Handle type="source" position={Position.Bottom} style={{ bottom: `-${handleOffset}px`, background: selected ? primaryColor : "black" }}>
                { isEntityHovered && <Typography fontSize="13px" color={selected ? primaryColor : "black"}> s </Typography> }
            </Handle>

            <Handle type="target" position={Position.Left} style={{ left: `-${handleOffset}px`, background: selected ? primaryColor : "black" }}>
                { isEntityHovered && <Typography fontSize="13px" color={selected ? primaryColor : "black"} sx={{ marginY: "3px"}}> t </Typography> }
            </Handle>

            <Handle type="target" position={Position.Right} style={{ right: `-${handleOffset}px`, background: selected ? primaryColor : "black" }}>
                { isEntityHovered && <Typography fontSize="13px" color={selected ? primaryColor : "black"} sx={{ marginY: "3px"}}> t </Typography> }
            </Handle>

            <Button size="small" fullWidth={true}
                sx={{ color: selected ? primaryColor : "black", fontSize: "16px", textTransform: 'none', overflow: "hidden", direction: 'ltr' }}
                onMouseEnter={() => setIsEntityHovered(_ => true)} 
                onMouseLeave={() => setIsEntityHovered(_ => false)}
                >
                <strong>{entityName}</strong>

                <Typography
                    id="long-button"
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
                <MenuItem onClick={() => { onEditItem(entity); handleClose(); }}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                        Edit entity
                </MenuItem>
                <MenuItem onClick={() => { onAddNewAttribute(entity); handleClose(); }}>
                    <ListItemIcon>
                        <AddIcon fontSize="small" />
                    </ListItemIcon>
                        Add new attribute
                </MenuItem>


                <MenuItem onClick={() => { onSuggestItems(UserChoice.ATTRIBUTES, entity[Field.NAME], null); handleClose(); }}>
                    <ListItemIcon>
                        <AutoFixHighIcon fontSize="small" />
                    </ListItemIcon>
                        Suggest attributes
                </MenuItem>
                
                <MenuItem onClick={() => { onSuggestItems(UserChoice.RELATIONSHIPS, entity[Field.NAME], null); handleClose(); }}>
                    <ListItemIcon>
                        <AutoFixHighIcon fontSize="small" />
                    </ListItemIcon>
                        Suggest relationships
                    </MenuItem>
            </Menu>




            { attributes.length > 0 && <Divider sx={{backgroundColor: selected ? primaryColor : "gray"}}></Divider> }

            <Stack>
                {attributes.map((attribute: Attribute, index: number) =>
                (
                    <Button size="small" key={`${attribute[Field.NAME]}-${index}`}
                        style={{justifyContent: "flex-start"}}
                        sx={{ color: selected ? primaryColor : "black", fontSize: "12px", textTransform: 'lowercase'}}
                        onClick={() => onEditItem(attribute)}>
                        - { clipName(attribute[Field.NAME]) }
                    </Button>
                ))}
            </Stack>
        </Box>

    )
}