import { atom } from "recoil"


export const isLoadingSuggestedItemsState = atom({
    key: "isLoadingSuggestedItemsState",
    default: false,
})

export const isLoadingEditState = atom({
    key: "isLoadingEditState",
    default: false,
})

export const isLoadingSummaryPlainTextState = atom({
    key: "isLoadingSummaryPlainTextState",
    default: false,
})

export const isLoadingSummaryDescriptionsState = atom({
    key: "isLoadingSummaryDescriptionsState",
    default: false,
})

export const isLoadingHighlightOriginalTextState = atom({
    key: "isLoadingHighlightOriginalTextState",
    default: false,
})