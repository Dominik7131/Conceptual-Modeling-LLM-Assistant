import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { domainDescriptionState, edgesState, editDialogErrorMsgState, editedSuggestedItemState, fieldToLoadState, isItemInConceptualModelState, isShowEditDialogState, isSuggestedItemState, nodesState, regeneratedItemState, selectedSuggestedItemState } from '../../atoms';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Association, Attribute, Field, Item, ItemFieldUIName, ItemType } from '../../interfaces';
import { createErrorMessage } from '../../utils/utility';
import ClassListSelector from './ClassListSelector';
import useEditItemDialog from '../../hooks/useEditItemDialog';
import Title from './Title';
import ControlButtons from './ControlButtons';
import ErrorMessage from './ErrorMessage';


const DialogEditItem: React.FC = () =>
{
    const isOpened = useRecoilValue(isShowEditDialogState)
    const fieldToLoad = useRecoilValue(fieldToLoadState)

    const item = useRecoilValue(selectedSuggestedItemState)
    const editedItem = useRecoilValue(editedSuggestedItemState)
    const regeneratedItem = useRecoilValue(regeneratedItemState)

    const { onClose, onItemEdit, onGenerateField, onConfirmRegeneratedText, onClearRegeneratedItem } = useEditItemDialog()

    const attribute = editedItem as Attribute
    const association = editedItem as Association

    const isAttribute = item.type === ItemType.ATTRIBUTE
    const isAssociation = item.type === ItemType.ASSOCIATION


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

        const isDisabledFieldSuggestion = field === Field.NAME || field === Field.SOURCE_CLASS || field === Field.TARGET_CLASS

        return (
            <Stack direction="row" spacing={4}>
                    <TextField margin="dense" fullWidth variant="standard" spellCheck={false} label={label} multiline
                        sx={{'& textarea': {color: color} }}
                        onChange={(event) => onItemEdit(field, event.target.value)}
                        value={newValue}
                    />
                    { !isRegeneratedText ?
                        ( (fieldToLoad.includes(field)) ? <CircularProgress sx={{position: 'relative', right: '3px', top: '5px'}} size={"30px"} /> :
                        <IconButton disabled={isDisabledFieldSuggestion} color="primary" size="small" onClick={() => onGenerateField(editedItem[Field.TYPE], editedItem[Field.NAME], (editedItem as Association)[Field.SOURCE_CLASS], (editedItem as Association)[Field.TARGET_CLASS], field)}>
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


    return (
        <Dialog open={isOpened} fullWidth maxWidth={'xl'} onClose={onClose}>

            <ErrorMessage/>
            
            <DialogTitle>
                <Title item={item}/>
            </DialogTitle> 

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
                    isAssociation && association[Field.TYPE] !== ItemType.GENERALIZATION &&
                    <>
                        { <ClassListSelector fieldName={Field.SOURCE_CLASS} association={association} editedItem={editedItem}/> }
                        { <ClassListSelector fieldName={Field.TARGET_CLASS} association={association} editedItem={editedItem}/> }
                        { showEditField(ItemFieldUIName.SOURCE_CARDINALITY, Field.SOURCE_CARDINALITY, association[Field.SOURCE_CARDINALITY]) }
                        { showEditField(ItemFieldUIName.TARGET_CARDINALITY, Field.TARGET_CARDINALITY, association[Field.TARGET_CARDINALITY]) }
                    </>
                }

                {
                    isAssociation && association[Field.TYPE] === ItemType.GENERALIZATION &&
                    <>
                        { showEditField(ItemFieldUIName.GENERAl_CLASS, Field.SOURCE_CLASS, association[Field.SOURCE_CLASS]) }
                        { showEditField(ItemFieldUIName.SPECIAL_CLASS, Field.TARGET_CLASS, association[Field.TARGET_CLASS]) }
                    </>
                }

            </DialogContent>

            <DialogActions>
                <ControlButtons/>
            </DialogActions>

        </Dialog>
    )
}

export default DialogEditItem