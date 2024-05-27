import { atom } from "recoil"


export const isShowEditDialogState = atom({
    key: "isShowEditDialogState",
    default: false,
})


export const isShowHighlightDialogState = atom({
    key: "isShowHighlightDialogState",
    default: false,
})


export const isShowCreateEdgeDialogState = atom({
    key: "isShowCreateEdgeDialogState",
    default: false,
})


export const isShowTitleDialogDomainDescriptionState = atom({
    key: "isShowTitleDialogDomainDescriptionState",
    default: true,
})


export const isDialogEnterIRIOpenedState = atom({
    key: "isDialogEnterIRIOpenedState",
    default: false,
})


export const isDialogImportState = atom({
    key: "isDialogImportState",
    default: true,
})


export const editDialogErrorMsgState = atom({
    key: "editDialogErrorMsgState",
    default: "",
})