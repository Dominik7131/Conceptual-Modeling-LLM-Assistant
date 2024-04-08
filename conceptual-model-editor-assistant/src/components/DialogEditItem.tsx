import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import AddIcon from '@mui/icons-material/Add';
import Stack from '@mui/material/Stack';
import { Attribute, Field, Item, ItemFieldUIName, ItemType, Relationship } from '../interfaces';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';


interface Props
{
    item : Item
    editedItem : Item
    regeneratedItem : Item
    isSuggestedItem : boolean
    isLoading : boolean
    fieldToLoad : Field
    isOpened : boolean
    isDisableSave : boolean
    isDisableChange : boolean
    onClose : () => void
    onSave : (editedItem: Item, oldItem: Item, isSuggestedItem: boolean) => void
    onPlus : (itemType: ItemType, name: string, sourceEntity: string, targetEntity: string, field: Field) => void
    onAddItem : (item: Item) => void
    onClearSuggestion : (field: Field, clearAll: boolean) => void
    onItemEdit : (field: Field, newValue: string) => void
    onRemove : (item: Item) => void
    onConfirmRegeneratedText : (field : Field) => void
    onChangeItemType : (item: Item) => void
}

const DialogEditItem: React.FC<Props> = ({item, editedItem, regeneratedItem, isOpened, isLoading, fieldToLoad, isSuggestedItem, onClose, onSave, onPlus, onAddItem, onClearSuggestion, onItemEdit, onConfirmRegeneratedText, onRemove, isDisableSave, isDisableChange, onChangeItemType} : Props) =>
{
    const attribute = editedItem as Attribute
    const relationship = editedItem as Relationship

    const isAttribute = item.type === ItemType.ATTRIBUTE
    const isRelationship = item.type === ItemType.RELATIONSHIP

    console.log("item, edited item: ", item, editedItem)


    const showEditField = (label : string, field : Field, value : string) =>
    {
        let newValue : string = ""
        let isRegeneratedText : boolean = true
        let color : string = "gray"

        if (regeneratedItem.hasOwnProperty(field))
        {
            // Convert to "any" type because typescript doesn't recognise that we already checked that the object contains the given field
            newValue = (regeneratedItem as any)[field]
        }

        if (!newValue)
        {
            if (value)
            {
                newValue = value
            }
            isRegeneratedText = false
        }

        if (!isRegeneratedText)
        {
            color = "black"
        }

        return (
            <Stack direction="row" spacing={4}>
                    <TextField margin="dense" fullWidth variant="standard" spellCheck={false} label={label} multiline
                        sx={{'& textarea': {color: color} }}
                        onChange={(event) => onItemEdit(field, event.target.value)}
                        value={newValue}
                    />
                    { !isRegeneratedText ?
                        ( (isLoading && fieldToLoad === field) ? <CircularProgress sx={{position: 'relative', right: '3px', top: '5px'}} size={"30px"} /> :
                        <IconButton disabled={field !== Field.DESCRIPTION} color="primary" size="small" onClick={() => onPlus(editedItem.type, editedItem.name, (editedItem as Relationship).source, (editedItem as Relationship).target, field)}>
                            <AddIcon/> 
                        </IconButton>)
                        :
                        <Stack direction="row">
                            <IconButton onClick={() => onConfirmRegeneratedText(field)}>
                                <CheckIcon color="success"/>
                            </IconButton>
                            <IconButton onClick={() => { onClearSuggestion(field, false) }}>
                                <CloseIcon color="error"/>
                            </IconButton>
                        </Stack>
                    }
                </Stack>
        )
    }

    return (
        <Dialog open={isOpened} fullWidth={true} maxWidth={'xl'} onClose={onClose}>

            <DialogTitle> Edit </DialogTitle>

            <DialogContent>

                { showEditField(ItemFieldUIName.NAME, Field.NAME, editedItem[Field.NAME]) } 
                { showEditField(ItemFieldUIName.ORIGINAL_TEXT, Field.ORIGINAL_TEXT, editedItem[Field.ORIGINAL_TEXT]) }
                { showEditField(ItemFieldUIName.DESCRIPTION, Field.DESCRIPTION, editedItem[Field.DESCRIPTION]) }

                { 
                    isAttribute &&
                    <>
                        { showEditField(ItemFieldUIName.DATA_TYPE, Field.DATA_TYPE, attribute[Field.DATA_TYPE]) }
                        { showEditField(ItemFieldUIName.CARDINALITY, Field.CARDINALITY, attribute[Field.CARDINALITY]) }
                    </>
                }

                {
                    isRelationship &&
                    <>
                        { showEditField(ItemFieldUIName.SOURCE_ENTITY, Field.SOURCE_ENTITY, relationship[Field.SOURCE_ENTITY]) }
                        { showEditField(ItemFieldUIName.TARGET_ENTITY, Field.TARGET_ENTITY, relationship[Field.TARGET_ENTITY]) }
                        { showEditField(ItemFieldUIName.CARDINALITY, Field.CARDINALITY, relationship[Field.CARDINALITY]) }
                    </>
                }

            </DialogContent>

            <DialogActions>
                <ButtonGroup>

                    {
                        isSuggestedItem ?
                        <Button onClick={() => { onAddItem(editedItem) }}>Add</Button>
                        :
                        <Button onClick={() => { onRemove(item); onClose()}}>Remove</Button>
                    }
                    

                    {
                        isSuggestedItem && !isDisableChange && isAttribute &&
                            <Button
                                onClick={ () => onChangeItemType(item)}>
                                Change to relationship
                            </Button>
                    }

                    {
                        isSuggestedItem && !isDisableChange && isRelationship &&
                            <Button
                                onClick={ () => onChangeItemType(item)}>
                                Change to attribute
                            </Button>
                    }
                    
                    { !isDisableSave &&
                        <Button
                            onClick={() => {onSave(editedItem, item, isSuggestedItem)}}>
                            Save
                        </Button>
                    }

                    <Button
                        onClick={() => onClose()}>
                        Cancel
                    </Button>
                </ButtonGroup>
            </DialogActions>
        </Dialog>
    )
}

export default DialogEditItem