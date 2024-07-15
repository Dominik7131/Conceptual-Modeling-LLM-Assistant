import { atom } from "recoil"
import { SUMMARY_PLAIN_TEXT_STYLE_DEFAULT, SummaryConceptualModel } from "../definitions/summary"


export const summaryTextState = atom({
    key: "summaryTextState",
    default: "",
})


export const summaryDescriptionsState = atom<SummaryConceptualModel>({
    key: "summaryDescriptionsState",
    default: { classes: [], associations: [] },
})


export const summaryPlainTextStyleState = atom({
    key: "summaryPlainTextStyleState",
    default: SUMMARY_PLAIN_TEXT_STYLE_DEFAULT,
})