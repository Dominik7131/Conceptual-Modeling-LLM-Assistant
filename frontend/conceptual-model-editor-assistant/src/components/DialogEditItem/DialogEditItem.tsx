import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { editDialogErrorMsgState, editedSuggestedItemState, isShowEditDialogState, selectedSuggestedItemState } from '../../atoms';
import { Association, Field, ItemFieldUIName, ItemType } from '../../interfaces';
import ClassListSelector from './ClassListSelector';
import Title from './Title';
import ControlButtons from './ControlButtons';
import ErrorMessage from './ErrorMessage';
import EditField from './EditField';
import { onClose } from '../../utils/editItem';


const DialogEditItem: React.FC = () =>
{
    const [isOpened, setIsOpened] = useRecoilState(isShowEditDialogState)

    const setEditedItem = useSetRecoilState(editedSuggestedItemState)
    const setRegeneratedItem = useSetRecoilState(editedSuggestedItemState)

    const setErrorMessage = useSetRecoilState(editDialogErrorMsgState)

    const item = useRecoilValue(selectedSuggestedItemState)
    const editedItem = useRecoilValue(editedSuggestedItemState)

    const association = editedItem as Association

    const isAttribute = item.type === ItemType.ATTRIBUTE
    const isAssociation = item.type === ItemType.ASSOCIATION


    return (
        <Dialog open={isOpened} fullWidth maxWidth={'xl'} onClose={ () => onClose(setIsOpened, setErrorMessage) }>

            <ErrorMessage/>
            
            <DialogTitle>
                <Title item={item}/>
            </DialogTitle> 

            <DialogContent>
                <EditField label={ItemFieldUIName.NAME} field={Field.NAME} />
                <EditField label={ItemFieldUIName.ORIGINAL_TEXT} field={Field.ORIGINAL_TEXT} />
                <EditField label={ItemFieldUIName.DESCRIPTION} field={Field.DESCRIPTION} />

                { 
                    isAttribute &&
                    <>
                        <EditField label={ItemFieldUIName.DATA_TYPE} field={Field.DATA_TYPE} />
                        <EditField label={ItemFieldUIName.CARDINALITY} field={Field.SOURCE_CARDINALITY} />
                    </>
                }

                {
                    isAssociation && association[Field.TYPE] !== ItemType.GENERALIZATION &&
                    <>
                        <ClassListSelector fieldName={Field.SOURCE_CLASS} association={association} editedItem={editedItem}/>
                        <ClassListSelector fieldName={Field.TARGET_CLASS} association={association} editedItem={editedItem}/>

                        <EditField label={ItemFieldUIName.SOURCE_CARDINALITY} field={Field.SOURCE_CARDINALITY} />
                        <EditField label={ItemFieldUIName.TARGET_CARDINALITY} field={Field.TARGET_CARDINALITY} />
                    </>
                }

                {
                    isAssociation && association[Field.TYPE] === ItemType.GENERALIZATION &&
                    <>
                        <EditField label={ItemFieldUIName.GENERAl_CLASS} field={Field.SOURCE_CLASS} />
                        <EditField label={ItemFieldUIName.SPECIAL_CLASS} field={Field.TARGET_CLASS} />
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