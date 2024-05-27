import { atom } from "recoil"


export const isIgnoreDomainDescriptionState = atom({
    key: "isIgnoreDomainDescriptionState",
    default: false,
})

export const domainDescriptionState = atom({
    key: "domainDescriptionState",
    default: "",
})