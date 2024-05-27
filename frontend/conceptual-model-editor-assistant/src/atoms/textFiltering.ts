import { atom } from "recoil";
import { TextFilteringVariation } from "../interfaces/interfaces";
import { TEXT_FILTERING_VARIATION_DEFAULT_VALUE } from "../utils/utility";


export const textFilteringVariationState = atom<TextFilteringVariation>({
    key: "textFilteringVariationState",
    default: TEXT_FILTERING_VARIATION_DEFAULT_VALUE,
})