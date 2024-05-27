import { atom } from "recoil";
import { ItemsMessage, SidebarTab } from "../interfaces/interfaces";


export const isSidebarOpenState = atom({
    key: "isSidebarOpenState",
    default: true,
})


export const sidebarTitlesState = atom<ItemsMessage>({
    key: "sidebarTitlesState",
    default: { classes: "", attributes: "", associations: "" },
})


export const sidebarTabValueState = atom<SidebarTab>({
    key: "sidebarTabValueState",
    default: SidebarTab.CLASSES,
})


export const sidebarErrorMsgState = atom({
    key: "sidebarErrorMsgState",
    default: "",
})


export const isSidebarCollapsedState = atom({
    key: "isSidebarCollapsedState",
    default: false,
})