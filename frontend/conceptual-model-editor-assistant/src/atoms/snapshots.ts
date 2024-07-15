import { atom } from "recoil"
import { Field, TEXT_FILTERING_VARIATION_DEFAULT_VALUE, UserChoiceItem, UserChoiceSingleField, UserChoiceSummary } from "../definitions/utility"
import { DomainDescriptionSnapshot, TextFilteringVariationSnapshot, ConceptualModelSnapshot, SummaryStyleSnapshot, ItemSnapshot } from "../definitions/snapshots"
import { EMPTY_SUMMARY_CONCEPTUAL_MODEL, SUMMARY_DESCRIPTIONS_STYLE_DEFAULT, SUMMARY_PLAIN_TEXT_STYLE_DEFAULT, SummaryStyle } from "../definitions/summary"


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


export const summaryStyleSnapshotState = atom<SummaryStyleSnapshot>({
    key: "summaryStyleSnapshotState",
    default: { [UserChoiceSummary.SUMMARY_PLAIN_TEXT]: SUMMARY_PLAIN_TEXT_STYLE_DEFAULT, [UserChoiceSummary.SUMMARY_DESCRIPTIONS]: SUMMARY_DESCRIPTIONS_STYLE_DEFAULT },
})


export const itemSnapshotState = atom<ItemSnapshot>({
    key: "itemSnapshotState",
    default: { [Field.NAME]: "", [Field.DESCRIPTION]: "", [Field.ORIGINAL_TEXT]: ""},
})