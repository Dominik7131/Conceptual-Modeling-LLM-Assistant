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
import { Field, UserChoice } from '../App';


interface Props
{
    item : Item
    isShow : boolean
    userChoice : string
    isDisableSave : boolean
    onClose : () => void
    onSave : (editedItem : Item) => void
    onPlus : (name: string, field: string) => void
}

const OverlayEdit: React.FC<Props> = ({item, isShow, userChoice, isDisableSave, onClose, onSave, onPlus} : Props) =>
{
    const [editedItem, setEditedItem] = useState<Item>(item)

    const attribute = (item as Attribute)
    const relationship = (item as Relationship)
    const entity = (item as Entity)

    useEffect(() => {
        setEditedItem(item);
    }, [item]);

    const onAdd = () =>
    {
        // TODO: Put this code into useConceptualModel hook
        // TODO: Try to less repeat yourself
        if (userChoice === UserChoice.ATTRIBUTES)
        {
            //onAddAttributesToNode(editedItem)
            
        }
        else if (userChoice === UserChoice.RELATIONSHIPS)
        {
            //onAddRelationshipsToNodes(editedItem)
        }
        else if (userChoice === UserChoice.ENTITIES)
        {
            //onAddEntity(editedItem)
        }
    }

    return (
        <Dialog
            open={isShow}
            fullWidth={true}
            maxWidth={'lg'}
        >

            <DialogTitle>
                Edit
            </DialogTitle>

            {/* TODO: Do not repeat the same code: either try to do one component for this or break it down into more components/functions */}
            <DialogContent>
                <Stack direction="row" paddingX={1}>
                    <TextField margin="dense" label="Name" fullWidth variant="standard" spellCheck={false}
                        onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })}
                        value={editedItem.name}
                    />
                    <Fab color="primary" size="small">
                        <AddIcon onClick={() => console.log("hi")}/>
                    </Fab>
                </Stack>

                <Stack direction="row" paddingX={1}>
                    <TextField margin="dense" label="Original text" fullWidth variant="standard" spellCheck={false} multiline
                        onChange={(e) => setEditedItem({ ...editedItem, inference: e.target.value })}
                        value={editedItem.inference}
                    />
                    <Fab color="primary" aria-label="add" size="small">
                        <AddIcon onClick={() => console.log("hi")}/>
                    </Fab>
                </Stack>

                <Stack direction="row" paddingX={1}>
                    <TextField margin="dense" label="Description" fullWidth variant="standard" spellCheck={false}
                        onChange={(e) => setEditedItem({ ...editedItem, description: e.target.value })}
                        value={editedItem.description === undefined ? "" : editedItem.description}
                    />
                    <Fab color="primary" aria-label="add" size="small">
                        <AddIcon onClick={() => onPlus(editedItem.name, Field.DESCRIPTION)}/>
                    </Fab>
                </Stack>

                {userChoice === UserChoice.ATTRIBUTES &&
                    <Stack direction="row" paddingX={1}>
                        
                        <TextField margin="dense" label="Data type" fullWidth variant="standard" spellCheck={false}
                            onChange={(e) => setEditedItem({ ...editedItem, dataType: e.target.value })}
                            value={editedItem.dataType === undefined ? "" : editedItem.dataType}
                        />
                        <Fab color="primary" aria-label="add" size="small">
                            <AddIcon onClick={() => console.log("hi")}/>
                        </Fab>
                    </Stack>
                }

                {userChoice === UserChoice.RELATIONSHIPS &&
                    <Stack direction="row" paddingX={1}>
                        <TextField margin="dense" label="Source entity" fullWidth variant="standard" spellCheck={false}
                            onChange={(e) => setEditedItem({ ...editedItem, source: e.target.value })}
                            value={editedItem.dataType === undefined ? "" : editedItem.source}
                        />
                        <Fab color="primary" aria-label="add" size="small">
                            <AddIcon onClick={() => console.log("hi")}/>
                        </Fab>
                    </Stack>
                }

                {userChoice === UserChoice.RELATIONSHIPS &&
                    <Stack direction="row" paddingX={1}>
                        <TextField margin="dense" label="Target entity" fullWidth variant="standard" spellCheck={false}
                            onChange={(e) => setEditedItem({ ...editedItem, target: e.target.value })}
                            value={editedItem.dataType === undefined ? "" : editedItem.target}
                        />
                        <Fab color="primary" aria-label="add" size="small">
                            <AddIcon onClick={() => console.log("hi")}/>
                        </Fab>
                    </Stack>
                }

                {(userChoice === UserChoice.ATTRIBUTES || userChoice === UserChoice.RELATIONSHIPS) &&
                    <Stack direction="row" paddingX={1}>
                        
                        <TextField margin="dense" label="Cardinality" fullWidth variant="standard" spellCheck={false}
                            onChange={(e) => setEditedItem({ ...editedItem, cardinality: e.target.value })}
                            value={editedItem.dataType === undefined ? "" : editedItem.cardinality}
                        />
                        <Fab color="primary" aria-label="add" size="small">
                            <AddIcon onClick={() => console.log("hi")}/>
                        </Fab>
                    </Stack>
                }

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