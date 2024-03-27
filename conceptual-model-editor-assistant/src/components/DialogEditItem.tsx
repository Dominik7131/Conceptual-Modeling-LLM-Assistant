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
import { useEffect, useState } from 'react';
import { Attribute, Field, Item, ItemFieldUIName, ItemFieldsUnification, ItemType, Relationship } from '../App';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';


interface Props
{
    item : Item
    editedItem : Item
    regeneratedItem : Item
    isLoading : boolean
    fieldToLoad : Field
    isOpened : boolean
    isDisableSave : boolean
    onClose : () => void
    onSave : (editedItem : Item) => void
    onPlus : (itemName: string, field: Field) => void
    onAddItem : (item : Item, addAsDifferent : boolean) => void
    onClearSuggestion : (field: Field, clearAll: boolean) => void
    onItemEdit : (field: Field, newValue : string) => void
    onConfirmRegeneratedText : (field : Field) => void
}

const DialogEditItem: React.FC<Props> = ({item, editedItem, regeneratedItem, isOpened, isDisableSave, isLoading, fieldToLoad, onClose, onSave, onPlus, onAddItem, onClearSuggestion, onItemEdit, onConfirmRegeneratedText} : Props) =>
{
    const attribute = editedItem as Attribute
    const relationship = editedItem as Relationship

    const isAttribute = item.type === ItemType.ATTRIBUTE
    const isRelationship = item.type === ItemType.RELATIONSHIP


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
                        <IconButton color="primary" size="small" onClick={() => onPlus(editedItem.name, field)}>
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

                { showEditField(ItemFieldUIName.NAME, Field.NAME, editedItem.name) } 
                { showEditField(ItemFieldUIName.ORIGINAL_TEXT, Field.INFERENCE, editedItem.inference) }
                { showEditField(ItemFieldUIName.DESCRIPTION, Field.DESCRIPTION, editedItem.description) }

                { 
                    isAttribute &&
                    <>
                        { showEditField(ItemFieldUIName.DATA_TYPE, Field.DATA_TYPE, attribute.dataType) }
                        { showEditField(ItemFieldUIName.CARDINALITY, Field.CARDINALITY, attribute.cardinality) }
                    </>
                }

                {
                    isRelationship &&
                    <>
                        { showEditField(ItemFieldUIName.SOURCE_ENTITY, Field.SOURCE_ENTITY, relationship.source) }
                        { showEditField(ItemFieldUIName.TARGET_ENTITY, Field.TARGET_ENTITY, relationship.target) }
                        { showEditField(ItemFieldUIName.CARDINALITY, Field.CARDINALITY, relationship.cardinality) }
                    </>
                }

            </DialogContent>

            <DialogActions>
                <ButtonGroup>
                    <Button onClick={() => { onAddItem(editedItem, false); onClose()}}>Add</Button>

                    {
                        isAttribute &&
                            <Button
                                onClick={ () => onAddItem(item, true)}>
                                Change to relationship
                            </Button>
                    }

                    {
                        isRelationship &&
                            <Button
                                onClick={ () => onAddItem(item, true)}>
                                Change to attribute
                            </Button>
                    }
                    
                    <Button disabled={isDisableSave} onClick={() => { {onSave(editedItem)}; onClose()}}>Save</Button>
                    <Button onClick={() => onClose()}>Cancel</Button>
                </ButtonGroup>
            </DialogActions>
        </Dialog>
    )
}

export default DialogEditItem