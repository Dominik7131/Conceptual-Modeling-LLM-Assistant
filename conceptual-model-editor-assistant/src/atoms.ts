import { atom } from 'recoil'
import { Field, Item, ItemType, SummaryObject } from './interfaces';


export const isShowEditDialog = atom({
    key: 'isShowDialogEdit',
    default: false,
});

export const isShowHighlightDialog = atom({
    key: 'isShowDialogHighlight',
    default: false,
});

export const isShowCreateEdgeDialog = atom({
    key: 'isShowCreateEdgeDialog',
    default: false,
});


export const suggestedItemsState = atom<Item[]>({
    key: 'suggestedItems',
    default: [],
});

export const isIgnoreDomainDescriptionState = atom({
    key: 'isIgnoreDomainDescriptionState',
    default: false,
});

export const domainDescriptionState = atom({
    key: 'domainDescriptionState',
    default: "",
});

export const fieldToLoadState = atom<Field>({
    key: 'fieldToLoadState',
    default: Field.ID,
});


// TODO: Do not use initial invalid item, instead make a type: Item | null
export const selectedSuggestedItemState = atom<Item>({
    key: 'selectedSuggestedItemState',
    default: {ID: -1, type: ItemType.ENTITY, name: "", description: "", originalText: "", originalTextIndexes: []},
});

export const editedSuggestedItemState = atom<Item>({
    key: 'editedSuggestedItemState',
    default: {ID: -1, type: ItemType.ENTITY, name: "", description: "", originalText: "", originalTextIndexes: []},
});

export const regeneratedItemState = atom<Item>({
    key: 'regeneratedItemState',
    default: {ID: -1, type: ItemType.ENTITY, name: "", description: "", originalText: "", originalTextIndexes: []},
});

export const isSuggestedItemState = atom({
    key: 'isSuggestedItemState',
    default: true,
});

export const isDisableSaveState = atom({
    key: 'isDisableSaveState',
    default: true,
});

export const isDisableChangeState = atom({
    key: 'isDisableChangeState',
    default: true,
});


export const originalTextIndexesListState = atom<number[]>({
    key: 'originalTextIndexesListState',
    default: [],
});

export const tooltipsState = atom<string[]>({
    key: 'tooltipsState',
    default: [],
});



export const isLoadingSuggestedItemsState = atom({
    key: 'isLoadingSuggestedItemsState',
    default: false,
});

export const isLoadingEditState = atom({
    key: 'isLoadingEditState',
    default: false,
});

export const isLoadingSummary1State = atom({
    key: 'isLoadingSummary1State',
    default: false,
});

export const isLoadingSummaryDescriptionsState = atom({
    key: 'isLoadingSummaryDescriptionsState',
    default: false,
});

export const summaryTextState = atom({
    key: 'summaryTextState',
    default: "",
});

// TODO: This object should contain descriptions for "entities": array of entities and "relationships": array of relationships
export const summaryDescriptionsState = atom<SummaryObject>({
    key: 'summaryDescriptionsState',
    default: { entities: [], relationships: []},
});


export const isSidebarOpenState = atom({
    key: 'isSidebarOpenState',
    default: true,
});