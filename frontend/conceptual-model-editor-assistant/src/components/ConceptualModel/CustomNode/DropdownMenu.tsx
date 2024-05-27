import { ListItemIcon, Menu, MenuItem } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import AutoFixNormalIcon from "@mui/icons-material/AutoFixNormal";
import useSuggestItems from "../../../hooks/useSuggestItems";
import { useSetRecoilState } from "recoil";
import { createNewAttribute } from "../../../utils/conceptualModel";
import { editedSuggestedItemState, isSuggestedItemState, selectedSuggestedItemState } from "../../../atoms/suggestions";
import { isItemInConceptualModelState } from "../../../atoms/conceptualModel";
import { isShowEditDialogState } from "../../../atoms/dialogs";
import { Class, Item, Attribute } from "../../../definitions/conceptualModel";
import { Field, UserChoice } from "../../../definitions/utility";


interface Props
{
    clss: Class
    anchor: any
    setAnchor: any
}


const DropdownMenu: React.FC<Props> = ({ clss, anchor, setAnchor }): JSX.Element =>
{
    // Menu component use cases: https://mui.com/material-ui/react-menu/
    
    const open = Boolean(anchor)

    const setIsSuggestedItem = useSetRecoilState(isSuggestedItemState)
    const setIsItemInConceptualModel = useSetRecoilState(isItemInConceptualModelState)
    const setIsShowEditDialog = useSetRecoilState(isShowEditDialogState)

    const setEditedSuggestedItem = useSetRecoilState(editedSuggestedItemState)
    const setSelectedSuggestedItem = useSetRecoilState(selectedSuggestedItemState)

    const { onSuggestItems } = useSuggestItems()

    const editClassText = "Edit class"
    const addNewAttributeText = "Add new attribute"
    const suggestAttributesText = "Suggest attributes"
    const suggestAssociationsText = "Suggest associations"

    const fontSize = "small"


    const handleClose = () =>
    {
        setAnchor(null)
    }


    const handleEditClass = () =>
    {
        setIsSuggestedItem(false)
        setIsItemInConceptualModel(true)
        onEditItem(clss)
    }


    const onEditItem = (item: Item): void =>
    {
        setIsSuggestedItem(false)
        setSelectedSuggestedItem(item)
        setEditedSuggestedItem(item)

        handleClose()
        setIsShowEditDialog(true)
    }
    
    
    const handleAddNewAttribute = (): void =>
    {
        setIsSuggestedItem(false)
        setIsItemInConceptualModel(false)

        const newAttribute: Attribute = createNewAttribute(clss[Field.IRI])
        
        setEditedSuggestedItem(newAttribute)
        setSelectedSuggestedItem(newAttribute)

        handleClose()
        setIsShowEditDialog(true)
    }


    const handleSuggestAttributes = (): void =>
    {
        onSuggestItems(UserChoice.ATTRIBUTES, clss[Field.NAME], null)
        handleClose()
    }


    const handleSuggestAssociations = (): void =>
    {
        onSuggestItems(UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS, clss[Field.NAME], null)
        handleClose()
    }


    return (
        <Menu
            id="basic-menu"
            anchorEl={anchor}
            open={open}
            onClose={handleClose}
            MenuListProps={{"aria-labelledby": "basic-button"}}
        >
            <MenuItem onClick={ handleEditClass }>
                <ListItemIcon>
                    <EditIcon fontSize={fontSize} />
                </ListItemIcon>
                { editClassText }
            </MenuItem>

            <MenuItem onClick={ handleAddNewAttribute }>
                <ListItemIcon>
                    <AddIcon fontSize={fontSize} />
                </ListItemIcon>
                { addNewAttributeText }
            </MenuItem>


            <MenuItem onClick={ handleSuggestAttributes }>
                <ListItemIcon>
                    <AutoFixNormalIcon fontSize={fontSize} />
                </ListItemIcon>
                { suggestAttributesText }
            </MenuItem>
            
            <MenuItem onClick={ handleSuggestAssociations }>
                <ListItemIcon>
                    <AutoFixNormalIcon fontSize={fontSize} />
                </ListItemIcon>
                { suggestAssociationsText }
            </MenuItem>
        </Menu>
    )
}


export default DropdownMenu