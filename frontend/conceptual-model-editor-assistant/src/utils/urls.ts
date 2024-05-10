const BASE_URL = "http://127.0.0.1:5000/" // https://llm-backend.opendata.cz/
export const HEADER = { "Content-Type": "application/json" }

export const SIDEBAR_BUTTON_SIZE = "small"
export const SIDEBAR_BUTTON_COLOR = "secondary"

const SUGGEST_ITEMS_ENDPOINT = "suggest"
const SUMMARY_PLAIN_TEXT_ENDPOINT = "summary_plain_text"
const SUMMARY_DESCRIPTIONS_ENDPOINT = "summary_descriptions"
const EDIT_ITEM_ENDPOINT = "getOnly"
const MERGE_ORIGINAL_TEXT_ENDPOINT = "merge_original_texts"
const SAVE_SUGESTED_ITEM = "save_suggested_item"
const SAVE_SUGESTED_SINGLE_FIELD = "save_suggested_single_field"
const SAVE_SUGESTED_DESCRIPTION = "save_suggested_description"

export const SUGGEST_ITEMS_URL = BASE_URL + SUGGEST_ITEMS_ENDPOINT
export const SUMMARY_PLAIN_TEXT_URL = BASE_URL + SUMMARY_PLAIN_TEXT_ENDPOINT
export const SUMMARY_DESCRIPTIONS_URL = BASE_URL + SUMMARY_DESCRIPTIONS_ENDPOINT
export const EDIT_ITEM_URL = BASE_URL + EDIT_ITEM_ENDPOINT
export const MERGE_ORIGINAL_TEXT_URL = BASE_URL + MERGE_ORIGINAL_TEXT_ENDPOINT
export const SAVE_SUGESTED_ITEM_URL = BASE_URL + SAVE_SUGESTED_ITEM
export const SAVE_SUGESTED_SINGLE_FIELD_URL = BASE_URL + SAVE_SUGESTED_SINGLE_FIELD
export const SAVE_SUGESTED_DESCRIPTION_URL = BASE_URL + SAVE_SUGESTED_DESCRIPTION
export const DATASPECER_MODEL_URL = "https://backend.dataspecer.com/simplified-semantic-model?iri="