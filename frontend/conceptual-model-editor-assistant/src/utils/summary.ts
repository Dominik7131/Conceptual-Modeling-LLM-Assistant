import { SummaryUserEvaluationBody } from "../definitions/fetch"
import { UserChoiceSummary } from "../definitions/utility"
import { DomainDescriptionSnapshot, ConceptualModelSnapshot } from "../definitions/snapshots"
import { getSnapshotDomainDescription, getSnapshotConceptualModel } from "./snapshot"
import { SAVE_SUGESTED_SUMMARY_URL, HEADER } from "../definitions/urls"
import { FORCE_NO_DOMAIN_DESCRIPTION, SummaryConceptualModel } from "../definitions/summary"


export const SUMMARY_PLAIN_TEXT_NAME = "Summary: plain text"
export const SUMMARY_DESCRIPTIONS_NAME = "Summary: descriptions"


export const handleSaveSuggestionSummary = (userChoice: UserChoiceSummary, isPositiveReaction: boolean, domainDescriptionSnapshot: DomainDescriptionSnapshot, conceptualModelSnapshot: ConceptualModelSnapshot, summary: string | SummaryConceptualModel) =>
{
    let currentDomainDescription = getSnapshotDomainDescription(userChoice, domainDescriptionSnapshot)        
    const currentConceptualModel = getSnapshotConceptualModel(userChoice, conceptualModelSnapshot)

    if (FORCE_NO_DOMAIN_DESCRIPTION)
    {
        currentDomainDescription = ""
    }

    const suggestionData: SummaryUserEvaluationBody = {
        domainDescription: currentDomainDescription, isPositive: isPositiveReaction, summary: summary,
        summaryType: userChoice, conceptualModel: currentConceptualModel
    }

    const bodyDataJSON = JSON.stringify(suggestionData)

    fetch(SAVE_SUGESTED_SUMMARY_URL, { method: "POST", headers: HEADER, body: bodyDataJSON })
}