import { atom } from "recoil"
import { SummaryConceptualModel } from "../definitions/summary"


export const summaryTextState = atom({
    key: "summaryTextState",
    default: "",
})


export const summaryDescriptionsState = atom<SummaryConceptualModel>({
    key: "summaryDescriptionsState",
    default: { classes: [], associations: [] },
})