import { atom } from "recoil"
import { TEXT_FILTERING_VARIATION_DEFAULT_VALUE, UserChoiceItem, UserChoiceSingleField, UserChoiceSummary } from "../definitions/utility"
import { DomainDescriptionSnapshot, TextFilteringVariationSnapshot, ConceptualModelSnapshot } from "../definitions/snapshots"
import { EMPTY_SUMMARY_CONCEPTUAL_MODEL } from "../definitions/summary"


export const domainDescriptionSnapshotsState = atom<DomainDescriptionSnapshot>({
    key: "domainDescriptionSnapshotsState",
    default: { [UserChoiceItem.CLASSES]: "", [UserChoiceItem.ATTRIBUTES]: "", [UserChoiceItem.ASSOCIATIONS_ONE_KNOWN_CLASS]: "", [UserChoiceItem.ASSOCIATIONS_TWO_KNOWN_CLASSES]: "",
    [UserChoiceSingleField.SINGLE_FIELD]: "", [UserChoiceSummary.SUMMARY_PLAIN_TEXT]: "", [UserChoiceSummary.SUMMARY_DESCRIPTIONS]: ""},
})


export const textFilteringVariationSnapshotsState = atom<TextFilteringVariationSnapshot>({
    key: "textFilteringVariationSnapshotsState",
    default: {
        [UserChoiceItem.CLASSES]: TEXT_FILTERING_VARIATION_DEFAULT_VALUE, [UserChoiceItem.ATTRIBUTES]: TEXT_FILTERING_VARIATION_DEFAULT_VALUE,
        [UserChoiceItem.ASSOCIATIONS_ONE_KNOWN_CLASS]: TEXT_FILTERING_VARIATION_DEFAULT_VALUE, [UserChoiceItem.ASSOCIATIONS_TWO_KNOWN_CLASSES]: TEXT_FILTERING_VARIATION_DEFAULT_VALUE,
        [UserChoiceSingleField.SINGLE_FIELD]: TEXT_FILTERING_VARIATION_DEFAULT_VALUE, [UserChoiceSummary.SUMMARY_PLAIN_TEXT]: TEXT_FILTERING_VARIATION_DEFAULT_VALUE,
        [UserChoiceSummary.SUMMARY_DESCRIPTIONS]: TEXT_FILTERING_VARIATION_DEFAULT_VALUE
    },
})


export const conceptualModelSnapshotState = atom<ConceptualModelSnapshot>({
    key: "conceptualModelSnapshotState",
    default: { [UserChoiceSummary.SUMMARY_PLAIN_TEXT]: EMPTY_SUMMARY_CONCEPTUAL_MODEL, [UserChoiceSummary.SUMMARY_DESCRIPTIONS]: EMPTY_SUMMARY_CONCEPTUAL_MODEL },
})