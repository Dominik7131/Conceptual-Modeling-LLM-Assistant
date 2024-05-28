import { Button } from "@mui/material"
import AutoFixNormalIcon from "@mui/icons-material/AutoFixNormal";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { NOTHING_SELECTED_MSG, UserChoiceSummary } from "../../definitions/utility";
import { snapshotConceptualModel, snapshotDomainDescription } from "../../utils/snapshot";
import { convertConceptualModelToObjectSummary } from "../../utils/serialization";
import useFetchSummaryDescriptions from "../../hooks/useFetchSummaryDescriptions";
import { SummarySuggestionBody } from "../../definitions/bodies";
import { selectedNodesState, selectedEdgesState } from "../../atoms/conceptualModel";
import { domainDescriptionState, isIgnoreDomainDescriptionState } from "../../atoms/domainDescription";
import { domainDescriptionSnapshotsState, conceptualModelSnapshotState } from "../../atoms/snapshots";
import { summaryDescriptionsState } from "../../atoms/summary";
import { topbarTabValueState } from "../../atoms/topbar";
import { TopbarTab } from "../../definitions/tabs";
import { SUMMARY_DESCRIPTIONS_NAME } from "../../utils/summary";


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

    const { fetchSummaryDescriptions } = useFetchSummaryDescriptions()

    
    const handleSummaryDescriptionsClick = (): void =>
    {
        if (selectedNodes.length === 0 && selectedEdges.length === 0)
        {
            alert(NOTHING_SELECTED_MSG)
            return
        }

        const userChoice = UserChoiceSummary.SUMMARY_DESCRIPTIONS
        setSummaryDescriptions({classes: [], associations: []})

        const currentDomainDescription = isIgnoreDomainDescription ? "" : domainDescription
        snapshotDomainDescription(userChoice, currentDomainDescription, setDomainDescriptionSnapshot)

        const conceptualModel = convertConceptualModelToObjectSummary(selectedNodes, selectedEdges)
        snapshotConceptualModel(userChoice, conceptualModel, setConceptualModelSnapshot)

        setTopbarTab(TopbarTab.SUMMARY_DESCRIPTION)

        const bodyData: SummarySuggestionBody = {
            summaryType: userChoice, conceptualModel: conceptualModel, domainDescription: currentDomainDescription
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