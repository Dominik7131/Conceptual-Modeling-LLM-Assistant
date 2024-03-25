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
import { Field, ItemType } from '../App';


interface Props
{
    item : Item
    isOpened : boolean
    isDisableSave : boolean
    onClose : () => void
    onSave : (editedItem : Item) => void
    onPlus : (name: string, field: string) => void
    onAddItem : (item : Item, addAsDifferent : boolean) => void
}

const DialogEditItem: React.FC<Props> = ({item, isOpened, isDisableSave, onClose, onSave, onPlus, onAddItem} : Props) =>
{
    const [editedItem, setEditedItem] = useState<Item>(item)

    const attribute = editedItem as Attribute
    const relationship = editedItem as Relationship

    
    useEffect(() =>
    {
        setEditedItem(item);
    }, [item]);


    const showEditField = (label : string, value : string, handleChange : (event : any) => void) =>
    {
        return (
            <Stack direction="row" paddingX={1}>
                    <TextField margin="dense" fullWidth variant="standard" spellCheck={false} label={label}
                        onChange={(event) => handleChange(event)}
                        value={value}
                    />
                    <Fab color="primary" size="small">
                        <AddIcon onClick={() => console.log("On click function not implemented")}/>
                    </Fab>
                </Stack>
        )
    }

    return (
        <Dialog open={isOpened} fullWidth={true} maxWidth={'lg'} onClose={onClose}>

            <DialogTitle> Edit </DialogTitle>

            <DialogContent>

                { showEditField(Field.NAME, editedItem.name, (event) => setEditedItem({ ...editedItem, name: event.target.value })) }

                {/* TODO: Switch "original text" to Field.ORIGINAL_TEXT*/}
                { showEditField("original text", editedItem.inference, (event) => setEditedItem({ ...editedItem, inference: event.target.value })) }

                { showEditField(Field.DESCRIPTION, editedItem.description === undefined ? "" : editedItem.description, (event) => setEditedItem({ ...editedItem, description: event.target.value })) }

                { item.type === ItemType.ATTRIBUTE &&
                  showEditField(Field.DATA_TYPE, attribute.dataType === undefined ? "" : attribute.dataType, (event) => setEditedItem({ ...editedItem, dataType: event.target.value }))
                }

                { item.type === ItemType.ATTRIBUTE &&
                  showEditField(Field.CARDINALITY, attribute.cardinality === undefined ? "" : attribute.cardinality, (event) => setEditedItem({ ...editedItem, cardinality: event.target.value })) 
                }
                

                { item.type === ItemType.RELATIONSHIP &&
                  showEditField(Field.SOURCE_ENTITY, relationship.source, (event) => setEditedItem({ ...editedItem, source: event.target.value })) }

                { item.type === ItemType.RELATIONSHIP &&
                  showEditField(Field.TARGET_ENTITY, relationship.target, (event) => setEditedItem({ ...editedItem, target: event.target.value })) }

                { item.type === ItemType.RELATIONSHIP &&
                  showEditField(Field.CARDINALITY, relationship.cardinality === undefined ? "" : relationship.cardinality, (event) => setEditedItem({ ...editedItem, cardinality: event.target.value })) }

            </DialogContent>

            <DialogActions>
                <Button onClick={() => onClose()}>Cancel</Button>
                <Button disabled={isDisableSave} onClick={() => { {onSave(editedItem)}; onClose()}}>Save</Button>
                <Button onClick={() => { onAddItem(editedItem, false); onClose()}}>Add</Button>
            </DialogActions>
        </Dialog>
    )
}

export default DialogEditItem