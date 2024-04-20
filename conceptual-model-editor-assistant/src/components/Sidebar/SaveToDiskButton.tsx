import { Box, Button, Divider, ListItemIcon, Menu, MenuItem } from "@mui/material"
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from "react";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { HEADER, SAVE_SUGESTION_URL } from "../../hooks/useUtility";
import { Item } from "../../interfaces";
import { domainDescriptionState, isIgnoreDomainDescriptionState } from "../../atoms";
import { useRecoilValue } from "recoil";


interface Props
{
    item: Item
}

const SaveToDiskButton: React.FC<Props> = ({ item }): JSX.Element =>
{
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [isClicked, setIsClicked] = useState(false)
    const open = Boolean(anchorEl)

    const domainDescription = useRecoilValue(domainDescriptionState)
    const isIgnoreDomainDescription = useRecoilValue(isIgnoreDomainDescriptionState)


    const handleClick = (event: React.MouseEvent<HTMLElement>) =>
    {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () =>
    {
        setAnchorEl(null)
    }

    const handleSendReaction = (isPositiveReaction: boolean) =>
    {
        const currentDomainDescription = isIgnoreDomainDescription ? "" : domainDescription
        const suggestionData = { domainDescription: currentDomainDescription, isPositive: isPositiveReaction, item: item }

        fetch(SAVE_SUGESTION_URL, { method: 'POST', headers: HEADER, body: JSON.stringify(suggestionData)})

        setIsClicked(true)
        handleClose()
    }

    return (
        <>
            <Button
                color="secondary"
                startIcon={<MoreVertIcon/>}
                sx={{ textTransform: "none", maxWidth: "10px" }}
                onClick={ handleClick }>
            </Button>

            <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                anchorEl={anchorEl}
                open={open}
                onClose={ handleClose }
                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}>

        <MenuItem
            disabled={isClicked}
            onClick={ () => handleSendReaction(true) }>

            <ListItemIcon sx={{display: 'flex', justifyContent:"center"}}>
                <ThumbUpIcon color="success" />
            </ListItemIcon>
        </MenuItem>

        <Divider/>

        <MenuItem
            disabled={isClicked}
            onClick={ () => handleSendReaction(false) }>

            <ListItemIcon sx={{display: 'flex', justifyContent:"center"}}>
                <ThumbDownIcon color="error"/>
            </ListItemIcon>
            
        </MenuItem>
      </Menu>
        </>
    )
}

export default SaveToDiskButton