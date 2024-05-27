import { SummaryUserEvaluationBody } from "../definitions/bodies"
import { UserChoice } from "../definitions/utility"
import { DomainDescriptionSnapshot, ConceptualModelSnapshot } from "../definitions/snapshots"
import { getSnapshotDomainDescription, getSnapshotConceptualModel } from "./snapshot"
import { SAVE_SUGESTED_SUMMARY_URL, HEADER } from "../definitions/urls"
import { SummaryDescriptionsObject } from "../definitions/summary"


export const SUMMARY_PLAIN_TEXT_NAME = "Summary: plain text"
export const SUMMARY_DESCRIPTIONS_NAME = "Summary: descriptions"


export const handleSaveSuggestionSummary = (userChoice: UserChoice, isPositiveReaction: boolean, domainDescriptionSnapshot: DomainDescriptionSnapshot, conceptualModelSnapshot: ConceptualModelSnapshot, summary: string | SummaryDescriptionsObject) =>
{
    const currentDomainDescription = getSnapshotDomainDescription(userChoice, domainDescriptionSnapshot)        
    const currentConceptualModel = getSnapshotConceptualModel(userChoice, conceptualModelSnapshot)

    const suggestionData: SummaryUserEvaluationBody = {
        domainDescription: currentDomainDescription, isPositive: isPositiveReaction, summary: summary,
        summaryType: userChoice, conceptualModel: currentConceptualModel
    }

    const bodyDataJSON = JSON.stringify(suggestionData)

    fetch(SAVE_SUGESTED_SUMMARY_URL, { method: "POST", headers: HEADER, body: bodyDataJSON })
}