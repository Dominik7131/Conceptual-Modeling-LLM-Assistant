import { Box, Button, Divider, ListItemIcon, Menu, MenuItem } from "@mui/material"
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from "react";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';


const SaveToDiskButton: React.FC = (): JSX.Element =>
{
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)

    const handleClick = (event: React.MouseEvent<HTMLElement>) =>
    {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () =>
    {
        setAnchorEl(null)
    }

    return (
        <>
            <Button
                color="secondary"
                startIcon={<MoreVertIcon/>}
                sx={{ minWidth: "1px", width: "1px", textTransform: "none" }}
                onClick={handleClick}>
            </Button>

            <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}>

        <MenuItem onClick={handleClose}>
            <ListItemIcon sx={{display: 'flex', justifyContent:"center"}}>
                <ThumbUpIcon  color="success" />
            </ListItemIcon>
        </MenuItem>

        <Divider/>

        <MenuItem onClick={handleClose}>
            <ListItemIcon sx={{display: 'flex', justifyContent:"center"}}>
                <ThumbDownIcon color="error"/>
            </ListItemIcon>
            
        </MenuItem>
      </Menu>
        </>
    )
}

export default SaveToDiskButton