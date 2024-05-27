import { atom } from "recoil"
import { SummaryDescriptionsObject } from "../definitions/summary"
import { UserChoice } from "../definitions/utility"


export const summaryTextState = atom({
    key: "summaryTextState",
    default: "",
})


export const summaryDescriptionsState = atom<SummaryDescriptionsObject>({
    key: "summaryDescriptionsState",
    default: { classes: [], associations: [] },
})


export const isSummaryReactionButtonClickedState = atom({
    key: "isSummaryReactionButtonClickedState",
    default: { [UserChoice.SUMMARY_PLAIN_TEXT]: false, [UserChoice.SUMMARY_DESCRIPTIONS]: false},
})