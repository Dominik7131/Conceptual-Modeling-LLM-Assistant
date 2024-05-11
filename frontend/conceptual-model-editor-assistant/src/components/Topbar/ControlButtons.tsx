import { Button, Stack } from "@mui/material"
import DomainDescriptionTextArea from "./DomainDescriptionTextArea";
import AddIcon from '@mui/icons-material/Add';
import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal';
import useConceptualModel from "../../hooks/useConceptualModel";
import HighlightSelectedItemsButton from "./HighlightSelectedItemsButton";
import { Class, Field, ItemType, TopbarTabs, UserChoice } from "../../interfaces";
import { SUMMARY_DESCRIPTIONS_NAME, SUMMARY_PLAIN_TEXT_NAME, blankClass, convertConceptualModelToJSON } from "../../utils/utility";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { domainDescriptionState, editedSuggestedItemState, isIgnoreDomainDescriptionState, isItemInConceptualModelState, isShowEditDialogState, isSuggestedItemState, selectedEdgesState, selectedNodesState, selectedSuggestedItemState, topbarTabValueState } from "../../atoms";
import SummaryPlainTextButton from "./SummaryPlainTextButton";
import SummaryDescriptionsButton from "./SummaryDescriptionsButton";


const ControlButtons: React.FC = (): JSX.Element =>
{
    const setIsSuggestedItem = useSetRecoilState(isSuggestedItemState)
    const setIsShowEditDialog = useSetRecoilState(isShowEditDialogState)
    const setIsItemInConceptualModel = useSetRecoilState(isItemInConceptualModelState)

    const setSelectedSuggestedItem = useSetRecoilState(selectedSuggestedItemState)
    const setEditedSuggestedItem = useSetRecoilState(editedSuggestedItemState)

    const { onSuggestItems } = useConceptualModel()


    const onAddNewClass = () : void =>
    {    
        setIsItemInConceptualModel(false)
        setIsSuggestedItem(true)
        setSelectedSuggestedItem(blankClass)
        setEditedSuggestedItem(blankClass)
    
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