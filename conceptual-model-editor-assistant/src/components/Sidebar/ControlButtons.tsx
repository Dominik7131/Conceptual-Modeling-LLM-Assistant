import { Button, ButtonGroup } from "@mui/material"
import HighlightSingleItemButton from "./HighlightSingleItemButton"
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import useConceptualModel from "../../hooks/useConceptualModel";
import { Item } from "../../interfaces";

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
                onClick={() => onAddItem(item)}>
                    Add
            </Button>

            <Button
                color="secondary"
                startIcon={<EditIcon/>}
                onClick={() => onEditSuggestion(item.ID)}>
                    Edit
            </Button>

            <HighlightSingleItemButton item={item}/>
        </ButtonGroup>
    )
}

export default ControlButtons