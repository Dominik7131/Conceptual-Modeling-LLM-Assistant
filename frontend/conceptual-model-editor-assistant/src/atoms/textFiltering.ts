import { atom } from "recoil"
import { TextFilteringVariation } from "../definitions/textFilteringVariation"
import { TEXT_FILTERING_VARIATION_DEFAULT_VALUE } from "../definitions/utility"


export const textFilteringVariationState = atom<TextFilteringVariation>({
    key: "textFilteringVariationState",
    default: TEXT_FILTERING_VARIATION_DEFAULT_VALUE,
})