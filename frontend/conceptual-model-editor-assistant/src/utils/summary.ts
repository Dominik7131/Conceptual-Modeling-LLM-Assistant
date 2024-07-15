import { SummaryUserEvaluationBody } from "../definitions/fetch"
import { UserChoiceSummary } from "../definitions/utility"
import { DomainDescriptionSnapshot, ConceptualModelSnapshot, SummaryStyleSnapshot } from "../definitions/snapshots"
import { getSnapshotDomainDescription, getSnapshotConceptualModel, getSnapshotSummaryStyle } from "./snapshot"
import { SAVE_SUGESTED_SUMMARY_URL, HEADER } from "../definitions/urls"
import { FORCE_NO_DOMAIN_DESCRIPTION, SummaryConceptualModel } from "../definitions/summary"


export const SUMMARY_PLAIN_TEXT_NAME = "Summary: plain text"
export const SUMMARY_DESCRIPTIONS_NAME = "Summary: descriptions"


export const handleSaveSuggestionSummary = (userChoice: UserChoiceSummary, isPositiveReaction: boolean, domainDescriptionSnapshot: DomainDescriptionSnapshot, conceptualModelSnapshot: ConceptualModelSnapshot, summaryStyleSnapshot: SummaryStyleSnapshot, summary: string | SummaryConceptualModel) =>
{
    let currentDomainDescription = getSnapshotDomainDescription(userChoice, domainDescriptionSnapshot)        
    const currentConceptualModel = getSnapshotConceptualModel(userChoice, conceptualModelSnapshot)
    const currentStyle = getSnapshotSummaryStyle(userChoice, summaryStyleSnapshot)

    if (FORCE_NO_DOMAIN_DESCRIPTION)
    {
        currentDomainDescription = ""
    }

    const suggestionData: SummaryUserEvaluationBody = {
        domainDescription: currentDomainDescription, isPositive: isPositiveReaction, summary: summary,
        summaryType: userChoice, style: currentStyle, conceptualModel: currentConceptualModel
    }

    const bodyDataJSON = JSON.stringify(suggestionData)

    fetch(SAVE_SUGESTED_SUMMARY_URL, { method: "POST", headers: HEADER, body: bodyDataJSON })
}