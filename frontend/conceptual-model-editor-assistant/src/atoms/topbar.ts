import { atom } from "recoil";
import { TopbarTab } from "../interfaces/interfaces";


export const topbarTabValueState = atom<TopbarTab>({
    key: "topbarTabValueState",
    default: TopbarTab.MAIN,
})