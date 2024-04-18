import { Button, ButtonGroup } from "@mui/material"
import HighlightSingleItemButton from "./HighlightSingleItemButton"
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import useConceptualModel from "../../hooks/useConceptualModel";
import { Item } from "../../interfaces";
import SaveToDiskButton from "./SaveToDiskButton";


interface Props
{
    item: Item
}

const ControlButtons: React.FC<Props> = ({ item }): JSX.Element =>
{
    const { onAddItem, onEditSuggestion } = useConceptualModel()
    
    return (
        <ButtonGroup fullWidth sx={{ marginTop: 1 }} variant="outlined" size="small">

            <Button
                color="secondary"
                startIcon={<AddIcon/>}
                sx={{ textTransform: "none" }}
                onClick={() => onAddItem(item, true)}>
                    Add
            </Button>

            <Button
                color="secondary"
                startIcon={<EditIcon/>}
                sx={{ textTransform: "none" }}
                onClick={() => onEditSuggestion(item.ID, item.type)}>
                    Edit
            </Button>

            <HighlightSingleItemButton item={item}/>

            <SaveToDiskButton/>


        </ButtonGroup>
    )
}

export default ControlButtons