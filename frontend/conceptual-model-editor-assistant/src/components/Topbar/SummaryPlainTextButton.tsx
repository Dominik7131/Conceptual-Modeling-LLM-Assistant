import { Button } from "@mui/material"
import AutoFixNormalIcon from "@mui/icons-material/AutoFixNormal";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { snapshotConceptualModel, snapshotDomainDescription } from "../../utils/snapshot";
import { convertConceptualModelToObjectSummary } from "../../utils/serialization";
import useFetchSummaryPlainText from "../../hooks/useFetchSummaryPlainText";
import { SummarySuggestionBody } from "../../definitions/bodies";
import { selectedNodesState, selectedEdgesState } from "../../atoms/conceptualModel";
import { domainDescriptionState, isIgnoreDomainDescriptionState } from "../../atoms/domainDescription";
import { domainDescriptionSnapshotsState, conceptualModelSnapshotState } from "../../atoms/snapshots";
import { summaryTextState } from "../../atoms/summary";
import { topbarTabValueState } from "../../atoms/topbar";
import { ConceptualModelObject } from "../../definitions/conceptualModel";
import { TopbarTab } from "../../definitions/tabs";
import { NOTHING_SELECTED_MSG, UserChoice } from "../../definitions/utility";
import { SUMMARY_PLAIN_TEXT_NAME } from "../../utils/summary";


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
    
    const isDisabled = domainDescription === "" || isIgnoreDomainDescription

    const { fetchSummaryPlainText } = useFetchSummaryPlainText()

    
    const handleSummaryPlainTextClick = (): void =>
    {
        if (selectedNodes.length === 0 && selectedEdges.length === 0)
        {
            alert(NOTHING_SELECTED_MSG)
            return
        }

        const userChoice = UserChoice.SUMMARY_PLAIN_TEXT
        setSummaryText("")
        
        const currentDomainDescription = isIgnoreDomainDescription ? "" : domainDescription
        snapshotDomainDescription(userChoice, currentDomainDescription, setDomainDescriptionSnapshot)

        const conceptualModel: ConceptualModelObject = convertConceptualModelToObjectSummary(selectedNodes, selectedEdges, false)
        snapshotConceptualModel(userChoice, conceptualModel, setConceptualModelSnapshot)

        setTopbarTab(TopbarTab.SUMMARY_PLAIN_TEXT)

        const bodyData: SummarySuggestionBody = {
            summaryType: userChoice, conceptualModelJSON: conceptualModel, domainDescription: currentDomainDescription
        }
        const bodyDataJSON = JSON.stringify(bodyData)

        fetchSummaryPlainText(bodyDataJSON)
    }


    return (
        <Button
            disabled={isDisabled}
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