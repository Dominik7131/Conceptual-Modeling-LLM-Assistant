import { ConceptualModelSnapshot, DomainDescriptionSnapshot, UserChoice } from "../interfaces"


export const snapshotDomainDescription = (userChoice: UserChoice, domainDescription: string, setSnapshotDomainDescription: any) =>
{
    setSnapshotDomainDescription((previousDomain: DomainDescriptionSnapshot) => ({...previousDomain, [userChoice]: domainDescription}))
}

export const snapshotConceptualModel = (userChoice: UserChoice, conceptualModel: any, setSnapshotConceptualModel: any) =>
{
    setSnapshotConceptualModel((previousModel: ConceptualModelSnapshot) => ({...previousModel, [userChoice]: conceptualModel}))
} 

export const getSnapshotDomainDescription = (userChoice: UserChoice, snapshot: DomainDescriptionSnapshot): string =>
{
    return snapshot[userChoice]
}

export const getSnapshotConceptualModel = (userChoice: UserChoice, snapshot: ConceptualModelSnapshot) =>
{
    if (userChoice === UserChoice.SUMMARY_PLAIN_TEXT || userChoice === UserChoice.SUMMARY_DESCRIPTIONS)
    {
        return snapshot[userChoice]
    }
    throw Error(`Received unexpected user choice: ${userChoice}`)
}