import { Button } from "@mui/material"
import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal';
import { SUMMARY_DESCRIPTIONS_NAME } from "../../utils/utility";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { conceptualModelSnapshotState, domainDescriptionSnapshotsState, domainDescriptionState, isIgnoreDomainDescriptionState, isSummaryDescriptionReactButtonClickedState, selectedEdgesState, selectedNodesState, summaryDescriptionsState, topbarTabValueState } from "../../atoms";
import { TopbarTabs, UserChoice } from "../../interfaces";
import useFetchData from "../../hooks/useFetchData";
import { convertConceptualModelToJSON } from "../../utils/conceptualModel";
import { snapshotConceptualModel, snapshotDomainDescription } from "../../utils/snapshot";


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

        const userChoice = UserChoice.SUMMARY_DESCRIPTIONS
        setSummaryDescriptions({classes: [], associations: []})
        setIsReactButtonClicked(false)

        const currentDomainDescription = isIgnoreDomainDescription ? "" : domainDescription
        snapshotDomainDescription(userChoice, currentDomainDescription, setDomainDescriptionSnapshot)

        const conceptualModel = convertConceptualModelToJSON(selectedNodes, selectedEdges, true)
        snapshotConceptualModel(userChoice, conceptualModel, setConceptualModelSnapshot)

        setTopbarTab(TopbarTabs.SUMMARY_DESCRIPTION)  

        const bodyData = JSON.stringify({"summaryType": userChoice, "conceptualModel": conceptualModel, "domainDescription": currentDomainDescription})
    
        fetchSummaryDescriptions(bodyData)
    }


    return (
        <Button
            variant="contained"
            sx={{textTransform: "none"}}
            disableElevation
            startIcon={<AutoFixNormalIcon/>}
            onClick={ handleSummaryDescriptionsClick }>
                { SUMMARY_DESCRIPTIONS_NAME }
        </Button>
    )
}

export default SummaryDescriptionsButton