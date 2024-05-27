import { atom } from "recoil"
import { Class, Attribute, Association, Item, BLANK_CLASS } from "../definitions/conceptualModel"
import { Field, ItemType } from "../definitions/utility"


export const suggestedClassesState = atom<Class[]>({
    key: "suggestedClassesState",
    default: [],
})


export const suggestedAttributesState = atom<Attribute[]>({
    key: "suggestedAttributesState",
    default: [],
})


export const suggestedAssociationsState = atom<Association[]>({
    key: "suggestedAssociationsState",
    default: [],
})


export const fieldToLoadState = atom<Field[]>({
    key: "fieldToLoadState",
    default: [],
})


export const itemTypesToLoadState = atom<ItemType[]>({
    key: "itemTypesToLoadState",
    default: [],
})


export const selectedSuggestedItemState = atom<Item>({
    key: "selectedSuggestedItemState",
    default: BLANK_CLASS,
})


export const editedSuggestedItemState = atom<Item>({
    key: "editedSuggestedItemState",
    default: BLANK_CLASS,
})


export const regeneratedItemState = atom<Item>({
    key: "regeneratedItemState",
    default: BLANK_CLASS,
})


export const isSuggestedItemState = atom({
    key: "isSuggestedItemState",
    default: true,
})