import { atom } from "recoil"
import { SummaryConceptualModel, SummaryPlainTextStyle } from "../definitions/summary"


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
    default: SummaryPlainTextStyle.DEFAULT,
})