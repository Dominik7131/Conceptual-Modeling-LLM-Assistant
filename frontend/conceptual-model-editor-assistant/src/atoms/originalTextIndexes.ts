import { atom } from "recoil"


export const originalTextIndexesListState = atom<number[]>({
    key: "originalTextIndexesListState",
    default: [],
})


export const regeneratedOriginalTextIndexesState = atom<number[]>({
    key: "regeneratedOriginalTextIndexesState",
    default: [],
})


export const tooltipsState = atom<string[]>({
    key: "tooltipsState",
    default: [],
})