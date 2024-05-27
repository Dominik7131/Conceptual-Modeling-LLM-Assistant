import { atom } from "recoil"
import { UserChoice } from "../interfaces/interfaces"
import { DomainDescriptionSnapshot, TextFilteringVariationSnapshot, ConceptualModelSnapshot } from "../interfaces/snapshots"
import { TEXT_FILTERING_VARIATION_DEFAULT_VALUE } from "../utils/utility"


export const domainDescriptionSnapshotsState = atom<DomainDescriptionSnapshot>({
    key: "domainDescriptionSnapshotsState",
    default: { [UserChoice.CLASSES]: "", [UserChoice.ATTRIBUTES]: "", [UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS]: "", [UserChoice.ASSOCIATIONS_TWO_KNOWN_CLASSES]: "",
    [UserChoice.SINGLE_FIELD]: "", [UserChoice.SUMMARY_PLAIN_TEXT]: "", [UserChoice.SUMMARY_DESCRIPTIONS]: ""},
})


export const textFilteringVariationSnapshotsState = atom<TextFilteringVariationSnapshot>({
    key: "textFilteringVariationSnapshotsState",
    default: {
        [UserChoice.CLASSES]: TEXT_FILTERING_VARIATION_DEFAULT_VALUE, [UserChoice.ATTRIBUTES]: TEXT_FILTERING_VARIATION_DEFAULT_VALUE,
        [UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS]: TEXT_FILTERING_VARIATION_DEFAULT_VALUE, [UserChoice.ASSOCIATIONS_TWO_KNOWN_CLASSES]: TEXT_FILTERING_VARIATION_DEFAULT_VALUE,
        [UserChoice.SINGLE_FIELD]: TEXT_FILTERING_VARIATION_DEFAULT_VALUE, [UserChoice.SUMMARY_PLAIN_TEXT]: TEXT_FILTERING_VARIATION_DEFAULT_VALUE,
        [UserChoice.SUMMARY_DESCRIPTIONS]: TEXT_FILTERING_VARIATION_DEFAULT_VALUE
    },
})


export const conceptualModelSnapshotState = atom<ConceptualModelSnapshot>({
    key: "conceptualModelSnapshotState",
    default: { [UserChoice.SUMMARY_PLAIN_TEXT]: "", [UserChoice.SUMMARY_DESCRIPTIONS]: ""},
})