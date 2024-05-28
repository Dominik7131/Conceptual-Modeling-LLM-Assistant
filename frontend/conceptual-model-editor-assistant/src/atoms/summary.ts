import { atom } from "recoil"
import { SummaryConceptualModel } from "../definitions/summary"
import { UserChoiceSummary } from "../definitions/utility"


export const summaryTextState = atom({
    key: "summaryTextState",
    default: "",
})


export const summaryDescriptionsState = atom<SummaryConceptualModel>({
    key: "summaryDescriptionsState",
    default: { classes: [], associations: [] },
})


export const isSummaryReactionButtonClickedState = atom({
    key: "isSummaryReactionButtonClickedState",
    default: { [UserChoiceSummary.SUMMARY_PLAIN_TEXT]: false, [UserChoiceSummary.SUMMARY_DESCRIPTIONS]: false},
})