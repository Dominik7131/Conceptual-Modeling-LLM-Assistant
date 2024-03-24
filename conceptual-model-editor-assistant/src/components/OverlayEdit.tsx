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
import { Field, ItemType, UserChoice } from '../App';


interface Props
{
    item : Item
    isOpened : boolean
    userChoice : string
    isDisableSave : boolean
    onClose : () => void
    onSave : (editedItem : Item) => void
    onPlus : (name: string, field: string) => void
}

const OverlayEdit: React.FC<Props> = ({item, isOpened, userChoice, isDisableSave, onClose, onSave, onPlus} : Props) =>
{
    // TODO: Fix bug with setting fields that exist only on specific types such as Data type on Attribute
    // -> editing data types is not working
    // if we have state variables: editedEntity, editedAttribute and editedRelationship then to call setEditedEntity/Attribute/Relationship(...) we need 3 ifs

    const [editedItem, setEditedItem] = useState<Item>(item)

    // TODO: Avoid this repeated code
    const attribute = item as Attribute
    const relationship = item as Relationship
    const entity = item as Entity

    useEffect(() =>
    {
        setEditedItem(item);
    }, [item]);

    const handleClickOutsideDialog = (event: MouseEvent) =>
    {
        const target = event.target as HTMLElement;
        if (target.className.includes('MuiDialog-container')) { onClose(); }
    }

    useEffect(() =>
    {
        if (isOpened) { document.addEventListener('click', handleClickOutsideDialog) }
        else { document.removeEventListener('click', handleClickOutsideDialog) }

        return () => { document.removeEventListener('click', handleClickOutsideDialog) }
    }, [isOpened])


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
        <Dialog open={isOpened} fullWidth={true} maxWidth={'lg'}>

            <DialogTitle> Edit </DialogTitle>

            {/* TODO: Do not repeat the same code: either try to do one component for this or break it down into more components/functions */}
            <DialogContent>

                { showEditField(Field.NAME, editedItem.name, (event) => setEditedItem({ ...editedItem, name: event.target.value })) }

                {/* TODO: Switch "Original text" to Field.ORIGINAL_TEXT*/}
                { showEditField("original text", editedItem.inference, (event) => setEditedItem({ ...editedItem, inference: event.target.value })) }

                { showEditField(Field.DESCRIPTION, editedItem.description === undefined ? "" : editedItem.description, (event) => setEditedItem({ ...editedItem, description: event.target.value })) }

                { item.type === ItemType.ATTRIBUTE &&
                  showEditField(Field.DATA_TYPE, attribute.dataType === undefined ? "" : attribute.dataType, (event) => setEditedItem({ ...editedItem, dataType: event.target.value })) }

                { item.type === ItemType.RELATIONSHIP &&
                  showEditField(Field.SOURCE_ENTITY, relationship.source === undefined ? "" : relationship.source, (event) => setEditedItem({ ...editedItem, source: event.target.value })) }

                { item.type === ItemType.RELATIONSHIP &&
                  showEditField(Field.TARGET_ENTITY, relationship.target === undefined ? "" : relationship.target, (event) => setEditedItem({ ...editedItem, target: event.target.value })) }

                { (item.type === ItemType.ATTRIBUTE || item.type === ItemType.RELATIONSHIP) &&
                  showEditField(Field.CARDINALITY, attribute.cardinality === undefined ? "" : attribute.cardinality, (event) => setEditedItem({ ...editedItem, target: event.target.value })) }

            </DialogContent>

            <DialogActions>
                <Button onClick={() => onClose()}>Cancel</Button>
                <Button onClick={() => { {onSave(editedItem)}; onClose()}}>Save</Button>
                <Button onClick={() => { onClose()}}>Add</Button>
            </DialogActions>
        </Dialog>
    )
}

export default OverlayEdit