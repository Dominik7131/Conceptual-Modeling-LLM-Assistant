import { Button, Stack } from "@mui/material"
import DomainDescriptionTextArea from "./DomainDescriptionTextArea";
import AddIcon from "@mui/icons-material/Add";
import AutoFixNormalIcon from "@mui/icons-material/AutoFixNormal";
import useSuggestItems from "../../hooks/useSuggestItems";
import HighlightSelectedItemsButton from "./HighlightSelectedItemsButton";
import { UserChoice } from "../../definitions/utility";
import { useSetRecoilState } from "recoil";
import SummaryPlainTextButton from "./SummaryPlainTextButton";
import SummaryDescriptionsButton from "./SummaryDescriptionsButton";
import { isItemInConceptualModelState } from "../../atoms/conceptualModel";
import { isShowEditDialogState } from "../../atoms/dialogs";
import { isSuggestedItemState, selectedSuggestedItemState, editedSuggestedItemState } from "../../atoms/suggestions";
import { BLANK_CLASS } from "../../definitions/conceptualModel";


const ControlButtons: React.FC = (): JSX.Element =>
{
    const setIsSuggestedItem = useSetRecoilState(isSuggestedItemState)
    const setIsShowEditDialog = useSetRecoilState(isShowEditDialogState)
    const setIsItemInConceptualModel = useSetRecoilState(isItemInConceptualModelState)

    const setSelectedSuggestedItem = useSetRecoilState(selectedSuggestedItemState)
    const setEditedSuggestedItem = useSetRecoilState(editedSuggestedItemState)

    const { onSuggestItems } = useSuggestItems()


    const onAddNewClass = () : void =>
    {    
        setIsItemInConceptualModel(false)
        setIsSuggestedItem(true)
        setSelectedSuggestedItem(BLANK_CLASS)
        setEditedSuggestedItem(BLANK_CLASS)
    
        setIsShowEditDialog(true)
    }


    return (
        <>
            <DomainDescriptionTextArea/>
            
            <Stack direction="row" justifyContent="space-between">
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        sx={{textTransform: "none"}}
                        disableElevation
                        startIcon={<AutoFixNormalIcon/>}
                        onClick={() => onSuggestItems(UserChoice.CLASSES, null, null)}>
                            Suggest classes
                    </Button>

                    <Button
                        variant="contained"
                        sx={{textTransform: "none"}}
                        disableElevation
                        startIcon={<AddIcon/>}
                        onClick={ onAddNewClass }>
                            Add new class
                    </Button>
                </Stack>

                <Stack direction="row" spacing={2}>

                    <SummaryPlainTextButton/>

                    <SummaryDescriptionsButton/>
                    
                    <HighlightSelectedItemsButton/>
                </Stack>
            </Stack>
        </>
    )
}

export default ControlButtons