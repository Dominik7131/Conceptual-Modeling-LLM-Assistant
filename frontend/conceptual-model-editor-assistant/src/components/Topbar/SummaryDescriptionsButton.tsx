import { Button } from "@mui/material"
import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal';
import { NOTHING_SELECTED_MSG, SUMMARY_DESCRIPTIONS_NAME } from "../../utils/utility";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { conceptualModelSnapshotState, domainDescriptionSnapshotsState, domainDescriptionState, isIgnoreDomainDescriptionState, isSummaryDescriptionReactButtonClickedState, selectedEdgesState, selectedNodesState, summaryDescriptionsState, topbarTabValueState } from "../../atoms";
import { TopbarTab, UserChoice } from "../../interfaces/interfaces";
import { snapshotConceptualModel, snapshotDomainDescription } from "../../utils/snapshot";
import { convertConceptualModelToObjectSummary } from "../../utils/serialization";
import useFetchSummaryDescriptions from "../../hooks/useFetchSummaryDescriptions";
import { SummarySuggestionBody } from "../../interfaces/bodies";


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

    const isDisabled = domainDescription === "" || isIgnoreDomainDescription

    const setIsReactButtonClicked = useSetRecoilState(isSummaryDescriptionReactButtonClickedState)

    const { fetchSummaryDescriptions } = useFetchSummaryDescriptions()

    
    const handleSummaryDescriptionsClick = (): void =>
    {
        if (selectedNodes.length === 0 && selectedEdges.length === 0)
        {
            alert(NOTHING_SELECTED_MSG)
            return
        }

        const userChoice = UserChoice.SUMMARY_DESCRIPTIONS
        setSummaryDescriptions({classes: [], associations: []})
        setIsReactButtonClicked(false)

        const currentDomainDescription = isIgnoreDomainDescription ? "" : domainDescription
        snapshotDomainDescription(userChoice, currentDomainDescription, setDomainDescriptionSnapshot)

        const conceptualModel = convertConceptualModelToObjectSummary(selectedNodes, selectedEdges, true)
        snapshotConceptualModel(userChoice, conceptualModel, setConceptualModelSnapshot)

        setTopbarTab(TopbarTab.SUMMARY_DESCRIPTION)  

        const bodyData: SummarySuggestionBody = {
            summaryType: userChoice, conceptualModelJSON: conceptualModel, domainDescription: currentDomainDescription
        }
        
        const bodyDataJSON = JSON.stringify(bodyData)
    
        fetchSummaryDescriptions(bodyDataJSON)
    }


    return (
        <Button
            disabled={isDisabled}
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