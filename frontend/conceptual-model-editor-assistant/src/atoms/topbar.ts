import { atom } from "recoil";
import { TopbarTab } from "../definitions/tabs";


export const topbarTabValueState = atom<TopbarTab>({
    key: "topbarTabValueState",
    default: TopbarTab.MAIN,
})