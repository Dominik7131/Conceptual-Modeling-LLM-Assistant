import { Button, ButtonGroup } from "@mui/material"
import HighlightSingleItemButton from "./HighlightSingleItemButton"
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import useConceptualModel from "../../hooks/useConceptualModel";
import { Item } from "../../interfaces";
import SaveToDiskButton from "./SaveToDiskButton";
import { sidebarErrorMsgState } from "../../atoms";
import { useSetRecoilState } from "recoil";


interface Props
{
    item: Item
}

const ControlButtons: React.FC<Props> = ({ item }): JSX.Element =>
{
    const { onAddItem, onEditSuggestion } = useConceptualModel()

    const setErrorMessage = useSetRecoilState(sidebarErrorMsgState)

    
    return (
        <ButtonGroup fullWidth sx={{ marginTop: 1, minWidth: "320px" }} variant="outlined" size="small">

            <Button
                color="secondary"
                startIcon={<AddIcon/>}
                sx={{ textTransform: "none" }}
                onClick={() => { setErrorMessage(""); onAddItem(item, true)} }>
                    Add
            </Button>

            <Button
                color="secondary"
                startIcon={<EditIcon/>}
                sx={{ textTransform: "none" }}
                onClick={() => { onEditSuggestion(item.ID, item.type) }}>
                    Edit
            </Button>

            <HighlightSingleItemButton item={item}/>

            <SaveToDiskButton item={item}/>


        </ButtonGroup>
    )
}

export default ControlButtons