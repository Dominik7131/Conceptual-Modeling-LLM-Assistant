import { Button } from "@mui/material"
import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal';
import { SUMMARY_PLAIN_TEXT_NAME, convertConceptualModelToJSON, snapshotConceptualModel, snapshotDomainDescription } from "../../hooks/useUtility";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { conceptualModelSnapshotState, domainDescriptionSnapshotsState, domainDescriptionState, isIgnoreDomainDescriptionState, isSummaryPlainTextReactButtonClickedState, selectedEdgesState, selectedNodesState, summaryTextState, topbarTabValueState } from "../../atoms";
import { TopbarTabs, UserChoice } from "../../interfaces";
import useFetchData from "../../hooks/useFetchData";


const SummaryPlainTextButton: React.FC= (): JSX.Element =>
{
    const selectedNodes = useRecoilValue(selectedNodesState)
    const selectedEdges = useRecoilValue(selectedEdgesState)

    const setTopbarTab = useSetRecoilState(topbarTabValueState)
    const setSummaryText = useSetRecoilState(summaryTextState)

    const domainDescription = useRecoilValue(domainDescriptionState)
    const isIgnoreDomainDescription = useRecoilValue(isIgnoreDomainDescriptionState)
    const setDomainDescriptionSnapshot = useSetRecoilState(domainDescriptionSnapshotsState)
    const setConceptualModelSnapshot = useSetRecoilState(conceptualModelSnapshotState)

    const setIsReactButtonClicked = useSetRecoilState(isSummaryPlainTextReactButtonClickedState)
    
    const { fetchSummaryPlainText } = useFetchData()

    
    const handleSummaryPlainTextClick = (): void =>
    {
        if (selectedNodes.length === 0 && selectedEdges.length === 0)
        {
            alert("Nothing was selected")
            return
        }

        setSummaryText("")
        setIsReactButtonClicked(false)
        
        const currentDomainDescription = isIgnoreDomainDescription ? "" : domainDescription
        snapshotDomainDescription(UserChoice.SUMMARY_PLAIN_TEXT, currentDomainDescription, setDomainDescriptionSnapshot)

        const conceptualModel = convertConceptualModelToJSON(selectedNodes, selectedEdges, false)
        snapshotConceptualModel(UserChoice.SUMMARY_PLAIN_TEXT, conceptualModel, setConceptualModelSnapshot)

        setTopbarTab(TopbarTabs.SUMMARY_PLAIN_TEXT)

        const bodyData = JSON.stringify({"conceptualModel": conceptualModel, "domainDescription": currentDomainDescription})

        fetchSummaryPlainText(bodyData)
    }


    return (
        <Button
            variant="contained"
            sx={{textTransform: "none"}}
            disableElevation
            startIcon={<AutoFixNormalIcon/>}
            onClick={ handleSummaryPlainTextClick }>
                { SUMMARY_PLAIN_TEXT_NAME }
        </Button>
    )
}

export default SummaryPlainTextButton