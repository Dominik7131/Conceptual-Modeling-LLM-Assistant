import { useRecoilValue, useSetRecoilState } from "recoil"
import { selectedNodesState, selectedEdgesState } from "../atoms/conceptualModel"
import { domainDescriptionState, isIgnoreDomainDescriptionState } from "../atoms/domainDescription"
import { domainDescriptionSnapshotsState, conceptualModelSnapshotState } from "../atoms/snapshots"
import { topbarTabValueState } from "../atoms/topbar"
import { SummarySuggestionBody } from "../definitions/fetch"
import { FORCE_NO_DOMAIN_DESCRIPTION, SummaryPlainTextStyle } from "../definitions/summary"
import { TopbarTab } from "../definitions/tabs"
import { NOTHING_SELECTED_MSG, UserChoiceSummary } from "../definitions/utility"
import { convertConceptualModelToObjectSummary } from "../utils/serialization"
import { snapshotDomainDescription, snapshotConceptualModel } from "../utils/snapshot"


const useSummaryButtonClick = () =>
{
    const selectedNodes = useRecoilValue(selectedNodesState)
    const selectedEdges = useRecoilValue(selectedEdgesState)

    const setTopbarTab = useSetRecoilState(topbarTabValueState)

    const domainDescription = useRecoilValue(domainDescriptionState)
    const isIgnoreDomainDescription = useRecoilValue(isIgnoreDomainDescriptionState)
    const setDomainDescriptionSnapshot = useSetRecoilState(domainDescriptionSnapshotsState)
    const setConceptualModelSnapshot = useSetRecoilState(conceptualModelSnapshotState)


    const onButtonClick = (userChoice: UserChoiceSummary, summaryStyle: SummaryPlainTextStyle = SummaryPlainTextStyle.NOT_SPECIFIED): string =>
    {
        if (selectedNodes.length === 0 && selectedEdges.length === 0)
        {
            alert(NOTHING_SELECTED_MSG)
            return ""
        }

        let currentDomainDescription = isIgnoreDomainDescription ? "" : domainDescription
        
        if (FORCE_NO_DOMAIN_DESCRIPTION)
        {
            currentDomainDescription = ""
        }

        snapshotDomainDescription(userChoice, currentDomainDescription, setDomainDescriptionSnapshot)

        const conceptualModel = convertConceptualModelToObjectSummary(selectedNodes, selectedEdges)
        snapshotConceptualModel(userChoice, conceptualModel, setConceptualModelSnapshot)

        if (userChoice === UserChoiceSummary.SUMMARY_PLAIN_TEXT)
        {
            setTopbarTab(TopbarTab.SUMMARY_PLAIN_TEXT)
        }
        else
        {
            setTopbarTab(TopbarTab.SUMMARY_DESCRIPTION)
        }

        const bodyData: SummarySuggestionBody = {
            summaryType: userChoice, conceptualModel: conceptualModel, domainDescription: currentDomainDescription, style: summaryStyle
        }
        
        const bodyDataJSON = JSON.stringify(bodyData)

        return bodyDataJSON
    }

    return { onButtonClick }
}

export default useSummaryButtonClick