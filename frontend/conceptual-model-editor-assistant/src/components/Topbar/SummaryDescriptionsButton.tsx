import { Button } from "@mui/material"
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { SUMMARY_DESCRIPTIONS_NAME, convertConceptualModelToJSON, snapshotConceptualModel, snapshotDomainDescription } from "../../hooks/useUtility";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { conceptualModelSnapshotState, domainDescriptionSnapshotsState, domainDescriptionState, isIgnoreDomainDescriptionState, isSummaryDescriptionReactButtonClickedState, selectedEdgesState, selectedNodesState, summaryDescriptionsState, topbarTabValueState } from "../../atoms";
import { TopbarTabs, UserChoice } from "../../interfaces";
import useFetchData from "../../hooks/useFetchData";


const SummaryDescriptionsButton: React.FC= (): JSX.Element =>
{
    const selectedNodes = useRecoilValue(selectedNodesState)
    const selectedEdges = useRecoilValue(selectedEdgesState)

    const setTopbarTab = useSetRecoilState(topbarTabValueState)
    const setSummaryDescriptions = useSetRecoilState(summaryDescriptionsState)

    const domainDescription = useRecoilValue(domainDescriptionState)
    const isIgnoreDomainDescription = useRecoilValue(isIgnoreDomainDescriptionState)
    const setDomainDescriptionSnapshot = useSetRecoilState(domainDescriptionSnapshotsState)
    const setConceptualModelSnapshot = useSetRecoilState(conceptualModelSnapshotState)


    const setIsReactButtonClicked = useSetRecoilState(isSummaryDescriptionReactButtonClickedState)

    const { fetchSummaryDescriptions } = useFetchData()

    
    const handleSummaryDescriptionsClick = (): void =>
    {
        if (selectedNodes.length === 0 && selectedEdges.length === 0)
        {
            alert("Nothing was selected")
            return
        }

        setSummaryDescriptions({classes: [], associations: []})
        setIsReactButtonClicked(false)

        const currentDomainDescription = isIgnoreDomainDescription ? "" : domainDescription
        snapshotDomainDescription(UserChoice.SUMMARY_DESCRIPTIONS, currentDomainDescription, setDomainDescriptionSnapshot)

        const conceptualModel = convertConceptualModelToJSON(selectedNodes, selectedEdges, true)
        snapshotConceptualModel(UserChoice.SUMMARY_DESCRIPTIONS, conceptualModel, setConceptualModelSnapshot)

        setTopbarTab(TopbarTabs.SUMMARY_DESCRIPTION)  

        const bodyData = JSON.stringify({"conceptualModel": conceptualModel, "domainDescription": currentDomainDescription})
    
        fetchSummaryDescriptions(bodyData)
        return
    }


    return (
        <Button
            variant="contained"
            sx={{textTransform: "none"}}
            disableElevation
            startIcon={<AutoFixHighIcon/>}
            onClick={ handleSummaryDescriptionsClick }>
                { SUMMARY_DESCRIPTIONS_NAME }
        </Button>
    )
}

export default SummaryDescriptionsButton