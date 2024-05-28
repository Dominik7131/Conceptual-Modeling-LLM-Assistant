import { SetterOrUpdater } from "recoil"
import { ConceptualModelSnapshot, DomainDescriptionSnapshot, TextFilteringVariationSnapshot } from "../definitions/snapshots"
import { SummaryConceptualModel } from "../definitions/summary"
import { TextFilteringVariation } from "../definitions/textFilteringVariation"
import { UserChoice, UserChoiceSummary } from "../definitions/utility"


export const snapshotDomainDescription = (userChoice: UserChoice, domainDescription: string, setSnapshotDomainDescription: SetterOrUpdater<DomainDescriptionSnapshot>) =>
{
    setSnapshotDomainDescription((previousDomain: DomainDescriptionSnapshot) => ({ ...previousDomain, [userChoice]: domainDescription }))
}


export const snapshotConceptualModel = (userChoice: UserChoice, conceptualModel: SummaryConceptualModel, setSnapshotConceptualModel: SetterOrUpdater<ConceptualModelSnapshot>) =>
{
    setSnapshotConceptualModel((previousModel: ConceptualModelSnapshot) => ({ ...previousModel, [userChoice]: conceptualModel }))
}


export const snapshotTextFilteringVariation = (userChoice: UserChoice, textFilteringVariation: TextFilteringVariation, setTextFilteringVariation: SetterOrUpdater<TextFilteringVariationSnapshot>) =>
{
    setTextFilteringVariation((previousFilteringVariation: TextFilteringVariationSnapshot) => ({ ...previousFilteringVariation, [userChoice]: textFilteringVariation }))
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