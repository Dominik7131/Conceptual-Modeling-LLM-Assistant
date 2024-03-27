import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import Stack from '@mui/material/Stack';
import { useEffect, useState } from 'react';
import { Attribute, Field, Item, ItemType, Relationship } from '../App';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';


interface Props
{
    item : Item
    regeneratedItem : Item
    isLoading : boolean
    fieldToLoad : Field
    isOpened : boolean
    isDisableSave : boolean
    onClose : () => void
    onSave : (editedItem : Item) => void
    onPlus : (itemName: string, field: Field) => void
    onAddItem : (item : Item, addAsDifferent : boolean) => void
    OnClearSuggestion : (field: string, clearAll: boolean) => void
}

const DialogEditItem: React.FC<Props> = ({item, regeneratedItem, isOpened, isDisableSave, onClose, onSave, onPlus, onAddItem, OnClearSuggestion, isLoading, fieldToLoad} : Props) =>
{
    const [editedItem, setEditedItem] = useState<Item>(item)

    const attribute = editedItem as Attribute
    const relationship = editedItem as Relationship
    
    useEffect(() =>
    {
        setEditedItem(item);
    }, [item]);

    const applyRegeneratedText = (field : Field) =>
    {
        // TODO: Try to find a way to make this code more readable
        if (field === Field.NAME && regeneratedItem.name)
        {
            setEditedItem({...editedItem, name: regeneratedItem.name})
        }
        else if (field === Field.DESCRIPTION && regeneratedItem.description)
        {
            setEditedItem({...editedItem, description: regeneratedItem.description})
        }
        else if (field === Field.INFERENCE && regeneratedItem.inference)
        {
            setEditedItem({...editedItem, inference: regeneratedItem.inference})
        }
        else if (field === Field.DATA_TYPE && (regeneratedItem as Attribute).dataType)
        {
            setEditedItem({...editedItem, dataType: (regeneratedItem as Attribute).dataType})
        }
        else if (field === Field.CARDINALITY && (regeneratedItem as Attribute).cardinality)
        {
            setEditedItem({...editedItem, cardinality: (regeneratedItem as Attribute).cardinality})
        }
        else if (field === Field.SOURCE_ENTITY && (regeneratedItem as Relationship).source)
        {
            setEditedItem({...editedItem, source: (regeneratedItem as Relationship).source})
        }
        else if (field === Field.TARGET_ENTITY && (regeneratedItem as Relationship).target)
        {
            setEditedItem({...editedItem, target: (regeneratedItem as Relationship).target})
        }

        OnClearSuggestion(field, false)
    }


    const showEditField = (label : string, field : Field, value : string, handleChange : (event : any) => void) =>
    {
        let newValue : string = ""
        let isRegeneratedText : boolean = true
        let color : string = "gray"

        if (field === Field.NAME && regeneratedItem.name)
        {
            newValue = regeneratedItem.name
        }
        else if (field === Field.DESCRIPTION && regeneratedItem.description)
        {
            newValue = regeneratedItem.description
        }
        else if (field === Field.INFERENCE && regeneratedItem.inference)
        {
            newValue = regeneratedItem.inference
        }
        else if (field === Field.DATA_TYPE && (regeneratedItem as Attribute).dataType)
        {
            const regeneratedAttribute = regeneratedItem as Attribute
            if (regeneratedAttribute)
            {
                newValue = regeneratedAttribute.dataType ? regeneratedAttribute.dataType : ""
            }
        }
        else if (field === Field.CARDINALITY && (regeneratedItem as Attribute).cardinality)
        {
            const regeneratedAttribute = regeneratedItem as Attribute
            if (regeneratedAttribute)
            {
                newValue = regeneratedAttribute.cardinality ? regeneratedAttribute.cardinality : ""
            }
        }
        else
        {
            newValue = value
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
                        onChange={(event) => handleChange(event)}
                        value={newValue}
                    />
                    { !isRegeneratedText ?
                        ( (isLoading && fieldToLoad === field) ? <CircularProgress sx={{position: 'relative', right: '3px', top: '5px'}} size={"30px"} /> :
                        <IconButton color="primary" size="small" onClick={() => onPlus(editedItem.name, field)}>
                            <AddIcon/> 
                        </IconButton>)
                        :
                        <Stack direction="row">
                            <IconButton onClick={() => applyRegeneratedText(field)}>
                                <CheckIcon color="success"/>
                            </IconButton>
                            <IconButton onClick={() => { OnClearSuggestion(field, false) }}>
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

                { showEditField("Name", Field.NAME, editedItem.name, (event) => setEditedItem({ ...editedItem, name: event.target.value })) }

                { showEditField("Original text", Field.INFERENCE, editedItem.inference, (event) => setEditedItem({ ...editedItem, inference: event.target.value })) }

                { showEditField("Description", Field.DESCRIPTION, editedItem.description, (event) => setEditedItem({ ...editedItem, description: event.target.value })) }

                { item.type === ItemType.ATTRIBUTE &&
                  showEditField("Data type", Field.DATA_TYPE, attribute.dataType === undefined ? "" : attribute.dataType, (event) => setEditedItem({ ...editedItem, dataType: event.target.value }))
                }

                { item.type === ItemType.ATTRIBUTE &&
                  showEditField("Cardinality", Field.CARDINALITY, attribute.cardinality === undefined ? "" : attribute.cardinality, (event) => setEditedItem({ ...editedItem, cardinality: event.target.value })) 
                }
                

                { item.type === ItemType.RELATIONSHIP &&
                  showEditField("Source entity", Field.SOURCE_ENTITY, relationship.source, (event) => setEditedItem({ ...editedItem, source: event.target.value })) }

                { item.type === ItemType.RELATIONSHIP &&
                  showEditField("Target entity", Field.TARGET_ENTITY, relationship.target, (event) => setEditedItem({ ...editedItem, target: event.target.value })) }

                { item.type === ItemType.RELATIONSHIP &&
                  showEditField("Cardinality", Field.CARDINALITY, relationship.cardinality === undefined ? "" : relationship.cardinality, (event) => setEditedItem({ ...editedItem, cardinality: event.target.value })) }

            </DialogContent>

            <DialogActions>
                <Button onClick={() => { onAddItem(editedItem, false); onClose()}}>Add</Button>
                {
                    item.type === ItemType.ATTRIBUTE ?
                    <Button
                        onClick={ () => onAddItem(item, true)}>
                        Change to relationship
                    </Button>
                    : item.type === ItemType.RELATIONSHIP ?
                    <Button
                        onClick={ () => onAddItem(item, true)}>
                        Change to attribute
                    </Button>
                    : null
                }
                <Button disabled={isDisableSave} onClick={() => { {onSave(editedItem)}; onClose()}}>Save</Button>
                <Button onClick={() => onClose()}>Cancel</Button>
            </DialogActions>
        </Dialog>
    )
}

export default DialogEditItem