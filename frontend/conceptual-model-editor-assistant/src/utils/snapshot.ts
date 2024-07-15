import { SetterOrUpdater } from "recoil"
import { ConceptualModelSnapshot, DomainDescriptionSnapshot, SummaryStyleSnapshot, TextFilteringVariationSnapshot } from "../definitions/snapshots"
import { SummaryConceptualModel, SummaryStyle } from "../definitions/summary"
import { TextFilteringVariation } from "../definitions/textFilteringVariation"
import { UserChoice, UserChoiceSummary } from "../definitions/utility"


export const snapshotDomainDescription = (userChoice: UserChoice, domainDescription: string, setSnapshotDomainDescription: SetterOrUpdater<DomainDescriptionSnapshot>) =>
{
    setSnapshotDomainDescription((previousDomain: DomainDescriptionSnapshot) => ({ ...previousDomain, [userChoice]: domainDescription }))
}


export const snapshotConceptualModel = (userChoice: UserChoiceSummary, conceptualModel: SummaryConceptualModel, setSnapshotConceptualModel: SetterOrUpdater<ConceptualModelSnapshot>) =>
{
    setSnapshotConceptualModel((previousModel: ConceptualModelSnapshot) => ({ ...previousModel, [userChoice]: conceptualModel }))
}


export const snapshotTextFilteringVariation = (userChoice: UserChoice, textFilteringVariation: TextFilteringVariation, setSnapshotTextFilteringVariation: SetterOrUpdater<TextFilteringVariationSnapshot>) =>
{
    setSnapshotTextFilteringVariation((previousFilteringVariation: TextFilteringVariationSnapshot) => ({ ...previousFilteringVariation, [userChoice]: textFilteringVariation }))
}


export const snapshotSummaryStyle = (userChoice: UserChoiceSummary, summaryStyle: SummaryStyle, setSnapshotSummaryStyle: SetterOrUpdater<SummaryStyleSnapshot>) =>
{
    setSnapshotSummaryStyle((previousSummaryStyle: SummaryStyleSnapshot) => ({ ...previousSummaryStyle, [userChoice]: summaryStyle }))
}


export const getSnapshotDomainDescription = (userChoice: UserChoice, snapshot: DomainDescriptionSnapshot): string =>
{
    return snapshot[userChoice]
}


export const getSnapshotConceptualModel = (userChoice: UserChoiceSummary, snapshot: ConceptualModelSnapshot) =>
{
    if (userChoice === UserChoiceSummary.SUMMARY_PLAIN_TEXT || userChoice === UserChoiceSummary.SUMMARY_DESCRIPTIONS)
    {
        return snapshot[userChoice]
    }
    throw Error(`Received unexpected user choice: ${userChoice}`)
}


export const getSnapshotTextFilteringVariation = (userChoice: UserChoice, snapshot: TextFilteringVariationSnapshot): TextFilteringVariation =>
{
    return snapshot[userChoice]
}


export const getSnapshotSummaryStyle = (userChoice: UserChoiceSummary, snapshot: SummaryStyleSnapshot): SummaryStyle =>
{
    return snapshot[userChoice]
}