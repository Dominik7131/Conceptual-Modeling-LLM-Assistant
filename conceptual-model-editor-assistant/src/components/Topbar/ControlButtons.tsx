import { Button, Stack } from "@mui/material"
import DomainDescriptionTextArea from "./DomainDescriptionTextArea";
import AddIcon from '@mui/icons-material/Add';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import useConceptualModel from "../../hooks/useConceptualModel";
import HighlightSelectedItemsButton from "./HighlightSelectedItemsButton";
import { Entity, Field, ItemType, UserChoice } from "../../interfaces";
import { SUMMARY_DESCRIPTIONS_NAME, SUMMARY_PLAIN_TEXT_NAME } from "../../hooks/useUtility";
import { useSetRecoilState } from "recoil";
import { editedSuggestedItemState, isItemInConceptualModelState, isShowEditDialogState, isSuggestedItemState, selectedSuggestedItemState } from "../../atoms";


const ControlButtons: React.FC = (): JSX.Element =>
{
    const setIsSuggestedItem = useSetRecoilState(isSuggestedItemState)
    const setIsShowEditDialog = useSetRecoilState(isShowEditDialogState)
    const setIsItemInConceptualModel = useSetRecoilState(isItemInConceptualModelState)

    const setSelectedSuggestedItem = useSetRecoilState(selectedSuggestedItemState)
    const setEditedSuggestedItem = useSetRecoilState(editedSuggestedItemState)
        
    const { onSuggestItems, onSummaryPlainTextClick, onSummaryDescriptionsClick } = useConceptualModel()


    const onAddNewEntity = () : void =>
    {
        const blankEntity: Entity = {
            [Field.ID]: -1, [Field.NAME]: "", [Field.DESCRIPTION]: "", [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: [],
            [Field.TYPE]: ItemType.ENTITY,
        }
    
        setIsItemInConceptualModel(false)
        setIsSuggestedItem(true)
        setSelectedSuggestedItem(blankEntity)
        setEditedSuggestedItem(blankEntity)
    
        setIsShowEditDialog(true)
    }


    return (
        <>
            <DomainDescriptionTextArea/>
            
            <Stack direction="row" justifyContent="space-between" paddingX={1} paddingY={"8px"}>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        sx={{textTransform: "none"}}
                        disableElevation
                        startIcon={<AutoFixHighIcon/>}
                        onClick={() => onSuggestItems(UserChoice.ENTITIES, null, null)}>
                            Suggest entities
                    </Button>

                    <Button
                        variant="contained"
                        sx={{textTransform: "none"}}
                        disableElevation
                        startIcon={<AddIcon/>}
                        onClick={onAddNewEntity}>
                            Add new entity
                    </Button>
                </Stack>

                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        sx={{textTransform: "none"}}
                        disableElevation
                        startIcon={<AutoFixHighIcon/>}
                        onClick={ onSummaryPlainTextClick }>
                            { SUMMARY_PLAIN_TEXT_NAME }
                    </Button>

                    <Button
                        variant="contained"
                        sx={{textTransform: "none"}}
                        disableElevation
                        startIcon={<AutoFixHighIcon/>}
                        onClick={ onSummaryDescriptionsClick }>
                            { SUMMARY_DESCRIPTIONS_NAME }
                    </Button>
                    
                    <HighlightSelectedItemsButton/>
                </Stack>
            </Stack>
        </>
    )
}

export default ControlButtons