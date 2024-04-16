import { Button, Stack } from "@mui/material"
import DomainDescriptionTextArea from "../DomainDescriptionTextArea";
import AddIcon from '@mui/icons-material/Add';
import HighlightIcon from '@mui/icons-material/Highlight';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ImportButton from "./ImportButton";
import ExportButton from "./ExportButton";
import HighlightSelectedItemsButton from "./HighlightSelectedItemsButton";
import useConceptualModel from "../../hooks/useConceptualModel";
import { UserChoice } from "../../interfaces";
import { SUMMARY_DESCRIPTIONS_NAME, SUMMARY_PLAIN_TEXT_NAME } from "../../hooks/useUtility";


const ControlButtons: React.FC = (): JSX.Element =>
{
    const { onAddNewEntity, onSuggestItems, onSummaryPlainTextClick, onSummaryDescriptionsClick } = useConceptualModel()


    return (
        <>
            <DomainDescriptionTextArea/>
            
            <Stack direction="row" justifyContent="space-between" paddingX={1} paddingY={"8px"}>
                <Stack direction="row" spacing={2}>
                    <Button variant="contained" sx={{textTransform: "none"}} disableElevation startIcon={<AutoFixHighIcon/>} onClick={() => onSuggestItems(UserChoice.ENTITIES, null, null)}> Suggest entities </Button>
                    <Button variant="contained" sx={{textTransform: "none"}} disableElevation startIcon={<AddIcon/>} onClick={onAddNewEntity}> Add new entity </Button>
                </Stack>

                <Stack direction="row" spacing={2}>
                    <Button variant="contained" sx={{textTransform: "none"}} disableElevation startIcon={<AutoFixHighIcon/>} onClick={ onSummaryPlainTextClick }> { SUMMARY_PLAIN_TEXT_NAME }</Button>
                    <Button variant="contained" sx={{textTransform: "none"}} disableElevation startIcon={<AutoFixHighIcon/>} onClick={ onSummaryDescriptionsClick }> { SUMMARY_DESCRIPTIONS_NAME }</Button>
                    <HighlightSelectedItemsButton/>
                </Stack>

                <Stack direction="row" spacing={2}>
                    <ImportButton/>
                    <ExportButton/>
                </Stack>
            </Stack>
        </>
    )
}

export default ControlButtons