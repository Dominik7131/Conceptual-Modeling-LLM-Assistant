import Button from '@mui/material/Button';
import { useState } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { Attribute, Class, Field, ItemType, NodeData, UserChoice, PRIMARY_COLOR, Item } from '../../interfaces';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ListItemIcon, Menu, MenuItem } from '@mui/material';
import { clipString } from '../../utils/utility';
import useConceptualModel from '../../hooks/useConceptualModel';
import { editedSuggestedItemState, isItemInConceptualModelState, isShowEditDialogState, isSuggestedItemState, selectedSuggestedItemState } from '../../atoms';
import { useSetRecoilState } from 'recoil';


// List of all NodeProps: https://reactflow.dev/api-reference/types/node-props
export default function TextUpdaterNode({ selected, data } : NodeProps)
{
    const setIsSuggestedItem = useSetRecoilState(isSuggestedItemState)
    const setIsItemInConceptualModel = useSetRecoilState(isItemInConceptualModelState)
    const setIsShowEditDialog = useSetRecoilState(isShowEditDialogState)

    const setSelectedSuggestedItem = useSetRecoilState(selectedSuggestedItemState)
    const setEditedSuggestedItem = useSetRecoilState(editedSuggestedItemState)

    const [isClassHovered, setIsEntityHovered] = useState<boolean>(false)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)

    const { onSuggestItems } = useConceptualModel()

    const nodeData: NodeData = data as NodeData
    const clss: Class = nodeData.class

    const attributes: Attribute[] = nodeData.attributes

    const borderNonSelected = "1px solid black"
    const borderSelected = `1px solid ${PRIMARY_COLOR}`


    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) =>
    {
        setAnchorEl(event.currentTarget);
    }


    const handleClose = () =>
    {
        setAnchorEl(null)
    }


    const handleEditClass = () =>
    {
        setIsSuggestedItem(false)
        setIsItemInConceptualModel(true)
        onEditItem(clss)
    }


    const handleAddNewAttribute = () =>
    {
        setIsSuggestedItem(false)
        setIsItemInConceptualModel(false)

        const newAttribute: Attribute = {
            [Field.IRI]: "", [Field.NAME]: "", [Field.DESCRIPTION]: "", [Field.DATA_TYPE]: "", [Field.ORIGINAL_TEXT]: "",
            [Field.ORIGINAL_TEXT_INDEXES]: [], [Field.TYPE]: ItemType.ATTRIBUTE, [Field.SOURCE_CARDINALITY]: "",
            [Field.SOURCE_CLASS]: clss[Field.IRI]
        }
      
        setSelectedSuggestedItem(newAttribute)
        setEditedSuggestedItem(newAttribute)
        handleClose()
        setIsShowEditDialog(true)
    }


    const handleEditAttribute = (attribute: Attribute) =>
    {
        setIsSuggestedItem(false)
        setIsItemInConceptualModel(true)
        onEditItem(attribute)
    }


    const onEditItem = (item: Item): void =>
    {
      setIsSuggestedItem(false)
      setSelectedSuggestedItem(item)
      setEditedSuggestedItem(item)

      handleClose()
      setIsShowEditDialog(true)
    }

    const handleOffset = 7


    return (
        <Box sx={{ minWidth: "250px", textAlign: "center", backgroundColor: "white", border: (selected || isClassHovered) ? borderSelected : borderNonSelected}}>

            <Handle type="source" position={Position.Top} style={{ top: `-${handleOffset}px`, background: selected ? PRIMARY_COLOR : "black" }}>
                { isClassHovered && <Typography fontSize="13px" color={selected ? PRIMARY_COLOR : "black"}> s </Typography> }
            </Handle>

            <Handle type="source" position={Position.Bottom} style={{ bottom: `-${handleOffset}px`, background: selected ? PRIMARY_COLOR : "black" }}>
                { isClassHovered && <Typography fontSize="13px" color={selected ? PRIMARY_COLOR : "black"}> s </Typography> }
            </Handle>

            <Handle type="target" position={Position.Left} style={{ left: `-${handleOffset}px`, background: selected ? PRIMARY_COLOR : "black" }}>
                { isClassHovered && <Typography fontSize="13px" color={selected ? PRIMARY_COLOR : "black"} sx={{ marginY: "3px"}}> t </Typography> }
            </Handle>

            <Handle type="target" position={Position.Right} style={{ right: `-${handleOffset}px`, background: selected ? PRIMARY_COLOR : "black" }}>
                { isClassHovered && <Typography fontSize="13px" color={selected ? PRIMARY_COLOR : "black"} sx={{ marginY: "3px"}}> t </Typography> }
            </Handle>

            <Button size="small" fullWidth={true}
                sx={{ color: selected ? PRIMARY_COLOR : "black", fontSize: "16px", textTransform: "none", overflow: "hidden", direction: "ltr" }}
                onMouseEnter={() => setIsEntityHovered(_ => true)} 
                onMouseLeave={() => setIsEntityHovered(_ => false)}
                >
                <strong>{ clipString(clss[Field.NAME], 22) }</strong>

                <Typography
                    id="long-button"
                    onClick={ handleClick }
                    sx={{ display: (isClassHovered || anchorEl) ? "block" : "none", position: "absolute", right: "0px", top: "6px" }}
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
                MenuListProps={{"aria-labelledby": "basic-button"}}
                >
                <MenuItem onClick={ handleEditClass }>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                        Edit class
                </MenuItem>
                <MenuItem onClick={ handleAddNewAttribute }>
                    <ListItemIcon>
                        <AddIcon fontSize="small" />
                    </ListItemIcon>
                        Add new attribute
                </MenuItem>


                <MenuItem onClick={() => { onSuggestItems(UserChoice.ATTRIBUTES, clss[Field.NAME], null); handleClose(); }}>
                    <ListItemIcon>
                        <AutoFixNormalIcon fontSize="small" />
                    </ListItemIcon>
                        Suggest attributes
                </MenuItem>
                
                <MenuItem onClick={() => { onSuggestItems(UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS, clss[Field.NAME], null); handleClose(); }}>
                    <ListItemIcon>
                        <AutoFixNormalIcon fontSize="small" />
                    </ListItemIcon>
                        Suggest associations
                    </MenuItem>
            </Menu>




            { attributes.length > 0 && <Divider sx={{backgroundColor: selected ? PRIMARY_COLOR : "gray"}}></Divider> }

            <Stack>
                {attributes.map((attribute: Attribute, index: number) =>
                (
                    <Button size="small" key={`${attribute[Field.NAME]}-${index}`}
                        style={{justifyContent: "flex-start"}}
                        sx={{ color: selected ? PRIMARY_COLOR : "black", fontSize: "12px", textTransform: "lowercase"}}
                        onClick={ () => { handleEditAttribute(attribute) }}>
                        - { clipString(attribute[Field.NAME], 30) }
                    </Button>
                ))}
            </Stack>
        </Box>

    )
}