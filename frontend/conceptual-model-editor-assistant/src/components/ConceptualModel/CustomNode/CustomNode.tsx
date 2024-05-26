import Button from '@mui/material/Button';
import { useState } from 'react';
import { NodeProps, Position } from 'reactflow';
import { Attribute, Class, Field, NodeData, PRIMARY_COLOR, Item, NodeHandleID, NodeHandleType } from '../../../interfaces/interfaces';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { BLACK_COLOR, clipString } from '../../../utils/utility';
import { editedSuggestedItemState, isItemInConceptualModelState, isShowEditDialogState, isSuggestedItemState, selectedSuggestedItemState } from '../../../atoms';
import { useSetRecoilState } from 'recoil';
import CustomHandle from './CustomHandle';
import DropdownMenu from './DropdownMenu';


export default function TextUpdaterNode({ selected, data } : NodeProps)
{
    // List of all available NodeProps: https://reactflow.dev/api-reference/types/node-props

    const setIsSuggestedItem = useSetRecoilState(isSuggestedItemState)
    const setIsItemInConceptualModel = useSetRecoilState(isItemInConceptualModelState)
    const setIsShowEditDialog = useSetRecoilState(isShowEditDialogState)

    const setSelectedSuggestedItem = useSetRecoilState(selectedSuggestedItemState)
    const setEditedSuggestedItem = useSetRecoilState(editedSuggestedItemState)

    const [anchor, setAnchor] = useState<null | HTMLElement>(null)
    const [isClassHovered, setIsClassHovered] = useState<boolean>(false)

    const nodeData: NodeData = data as NodeData
    const clss: Class = nodeData.class

    const attributes: Attribute[] = nodeData.attributes

    const minWidth = "260px"
    const color = selected ? PRIMARY_COLOR : BLACK_COLOR
    const borderNonSelected = "1px solid black"
    const borderSelected = `1px solid ${PRIMARY_COLOR}`

    const classNameMaxVisibleCharacters = 22
    const attributeNameMaxVisibleCharacters = 30
    const handleOffset = 7


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


    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) =>
    {
        setAnchor(event.currentTarget)
    }


    const handleClose = () =>
    {
        setAnchor(null)
    }


    return (
        <Box sx={{ minWidth: {minWidth}, textAlign: "center", backgroundColor: "white", border: (selected || isClassHovered) ? borderSelected : borderNonSelected}}>

            <CustomHandle id={NodeHandleID.SOURCE_TOP} type={NodeHandleType.SOURCE} handleOffset={handleOffset} isSelected={selected} position={Position.Top} isHovered={isClassHovered} />
            <CustomHandle id={NodeHandleID.SOURCE_BOTTOM} type={NodeHandleType.SOURCE} handleOffset={handleOffset} isSelected={selected} position={Position.Bottom} isHovered={isClassHovered} />

            <CustomHandle id={NodeHandleID.TARGET_LEFT} type={NodeHandleType.TARGET} handleOffset={handleOffset} isSelected={selected} position={Position.Left} isHovered={isClassHovered} />
            <CustomHandle id={NodeHandleID.TARGET_RIGHT} type={NodeHandleType.TARGET} handleOffset={handleOffset} isSelected={selected} position={Position.Right} isHovered={isClassHovered} />


            <Button size="small" fullWidth={true}
                sx={{ color: color, fontSize: "16px", textTransform: "none", overflow: "hidden", direction: "ltr" }}
                onMouseEnter={() => setIsClassHovered(_ => true)} 
                onMouseLeave={() => setIsClassHovered(_ => false)}
                >
                <strong>{ clipString(clss[Field.NAME], classNameMaxVisibleCharacters) }</strong>

                <Typography
                    id="long-button"
                    onClick={ handleClick }
                    sx={{ display: (isClassHovered || anchor) ? "block" : "none", position: "absolute", right: "0px", top: "6px" }}
                    >
                    <MoreVertIcon />
                </Typography>
            </Button>

            <DropdownMenu clss={clss} anchor={anchor} setAnchor={setAnchor} />

            { attributes.length > 0 && <Divider sx={{backgroundColor: selected ? PRIMARY_COLOR : "lightgray"}}></Divider> }

            <Stack>
                {attributes.map((attribute: Attribute, index: number) =>
                (
                    <Button size="small" key={`${attribute[Field.NAME]}-${index}`}
                        style={{justifyContent: "flex-start"}}
                        sx={{ color: color, fontSize: "12px", textTransform: "lowercase"}}
                        onClick={ () => { handleEditAttribute(attribute) }}>
                        - { clipString(attribute[Field.NAME], attributeNameMaxVisibleCharacters) }
                    </Button>
                ))}
            </Stack>
        </Box>
    )
}