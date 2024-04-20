import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import { Attribute, Field, Item, ItemFieldUIName, ItemType, Relationship } from '../interfaces';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { domainDescriptionState, edgesState, editDialogErrorMsgState, editedSuggestedItemState, fieldToLoadState, isDisableChangeState, isDisableSaveState, isLoadingEditState, isShowEditDialogState, isSuggestedItemState, nodesState, regeneratedItemState, selectedSuggestedItemState } from '../atoms';
import useEditItemDialog from '../hooks/useEditItemDialog';
import useConceptualModel from '../hooks/useConceptualModel';
import Alert from '@mui/material/Alert';
import { createErrorMessage, onAddItem } from '../hooks/useUtility';


const DialogEditItem: React.FC = () =>
{
    const isOpened = useRecoilValue(isShowEditDialogState)
    const fieldToLoad = useRecoilValue(fieldToLoadState)

    const setNodes = useSetRecoilState(nodesState)
    const setEdges = useSetRecoilState(edgesState)

    const item = useRecoilValue(selectedSuggestedItemState)
    const editedItem = useRecoilValue(editedSuggestedItemState)
    const regeneratedItem = useRecoilValue(regeneratedItemState)
    const isSuggestedItem = useRecoilValue(isSuggestedItemState)
    const isDisableSave = useRecoilValue(isDisableSaveState)
    const isDisableChange = useRecoilValue(isDisableChangeState)

    const [errorMessage, setErrorMessage] = useRecoilState(editDialogErrorMsgState)

    const { onSave, onClose, onRemove, onItemEdit, onGenerateField, onConfirmRegeneratedText, onClearRegeneratedItem, onChangeItemType } = useEditItemDialog()

    const attribute = editedItem as Attribute
    const relationship = editedItem as Relationship

    const isAttribute = item.type === ItemType.ATTRIBUTE
    const isRelationship = item.type === ItemType.RELATIONSHIP


    const handleAddItem = (item: Item): void =>
    {
        if (item.name === "")
        {
            const message = "Name cannot be empty"
            setErrorMessage(_ => message)
            return
        }

        const isOperationSuccessful = onAddItem(item, setNodes, setEdges)

        if (isOperationSuccessful)
        {
            onClose()
            return
        }

        createErrorMessage(item, setErrorMessage)
    }


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
                        ( (fieldToLoad.includes(field)) ? <CircularProgress sx={{position: 'relative', right: '3px', top: '5px'}} size={"30px"} /> :
                        <IconButton disabled={field === Field.NAME} color="primary" size="small" onClick={() => onGenerateField(editedItem.type, editedItem.name, (editedItem as Relationship).source, (editedItem as Relationship).target, field)}>
                            <AutoFixHighIcon/>
                        </IconButton>)
                        :
                        <Stack direction="row">
                            <IconButton onClick={() => onConfirmRegeneratedText(field)}>
                                <CheckIcon color="success"/>
                            </IconButton>
                            <IconButton onClick={() => { onClearRegeneratedItem(field, false) }}>
                                <CloseIcon color="error"/>
                            </IconButton>
                        </Stack>
                    }
                </Stack>
        )
    }


    const showDialogTitle = (item: Item): JSX.Element =>
    {
        return <Typography variant="h5" component="span"> Editing {item.type}: <strong>{item.name}</strong> </Typography>
    }


    return (
        <Dialog open={isOpened} fullWidth maxWidth={'xl'} onClose={onClose}>

            {
                errorMessage !== "" &&
                <Alert variant="outlined" severity="warning" sx={{marginX:"20px", marginTop: "20px"}}>
                    { errorMessage }
                </Alert>
            }
            
            <DialogTitle> { showDialogTitle(item) } </DialogTitle> 

            <DialogContent>

                { showEditField(ItemFieldUIName.NAME, Field.NAME, editedItem[Field.NAME]) } 
                { showEditField(ItemFieldUIName.ORIGINAL_TEXT, Field.ORIGINAL_TEXT, editedItem[Field.ORIGINAL_TEXT]) }
                { showEditField(ItemFieldUIName.DESCRIPTION, Field.DESCRIPTION, editedItem[Field.DESCRIPTION]) }

                { 
                    isAttribute &&
                    <>
                        { showEditField(ItemFieldUIName.DATA_TYPE, Field.DATA_TYPE, attribute[Field.DATA_TYPE]) }
                        { showEditField(ItemFieldUIName.CARDINALITY, Field.SOURCE_CARDINALITY, attribute[Field.SOURCE_CARDINALITY]) }
                    </>
                }

                {
                    isRelationship &&
                    <>
                        { showEditField(ItemFieldUIName.SOURCE_ENTITY, Field.SOURCE_ENTITY, relationship[Field.SOURCE_ENTITY]) }
                        { showEditField(ItemFieldUIName.TARGET_ENTITY, Field.TARGET_ENTITY, relationship[Field.TARGET_ENTITY]) }
                        { showEditField(ItemFieldUIName.SOURCE_CARDINALITY, Field.SOURCE_CARDINALITY, relationship[Field.SOURCE_CARDINALITY]) }
                        { showEditField(ItemFieldUIName.TARGET_CARDINALITY, Field.TARGET_CARDINALITY, relationship[Field.TARGET_CARDINALITY]) }
                    </>
                }

            </DialogContent>

            <DialogActions>
                <ButtonGroup>

                    {
                        isSuggestedItem ?
                        <Button
                            variant="contained"
                            color="success"
                            sx={{ textTransform: "none" }}
                            onClick={() => { handleAddItem(editedItem) }}> Add </Button>
                        :
                        <Button
                            variant="contained"
                            color="error"
                            sx={{ textTransform: "none" }}
                            onClick={() => { onRemove(item); onClose()}}> Remove </Button>
                    }
                    

                    {
                        isSuggestedItem && !isDisableChange && isAttribute &&
                            <Button
                                variant="contained"
                                sx={{ textTransform: "none" }}
                                onClick={ () => onChangeItemType(item)}>
                                Change to relationship
                            </Button>
                    }

                    {
                        isSuggestedItem && !isDisableChange && isRelationship &&
                            <Button
                                variant="contained"
                                sx={{ textTransform: "none" }}
                                onClick={ () => onChangeItemType(item)}>
                                Change to attribute
                            </Button>
                    }
                    
                    { !isDisableSave &&
                        <Button
                            variant="contained"
                            sx={{ textTransform: "none" }}
                            onClick={() => {onSave(editedItem, item)}}>
                            Save
                        </Button>
                    }

                    <Button
                        variant="contained"
                        sx={{ textTransform: "none" }}
                        onClick={() => onClose()}>
                        Cancel
                    </Button>
                </ButtonGroup>
            </DialogActions>
        </Dialog>
    )
}

export default DialogEditItem