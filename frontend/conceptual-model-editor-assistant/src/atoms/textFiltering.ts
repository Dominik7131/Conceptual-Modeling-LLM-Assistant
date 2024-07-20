import { atom } from "recoil"
import { TEXT_FILTERING_VARIATION_DEFAULT_VALUE, TextFilteringVariation } from "../definitions/textFilteringVariation"


export const textFilteringVariationState = atom<TextFilteringVariation>({
    key: "textFilteringVariationState",
    default: TEXT_FILTERING_VARIATION_DEFAULT_VALUE,
})