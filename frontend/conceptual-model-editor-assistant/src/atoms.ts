import { atom, selector } from 'recoil'
import { Attribute, ConceptualModelSnapshot, DomainDescriptionSnapshot, Class, Field, Item, ItemType, ItemsMessage, Association, SummaryObject, UserChoice } from './interfaces';
import { Node, Edge } from 'reactflow';
import { blankEntity } from './hooks/useUtility';


export const isShowEditDialogState = atom({
    key: 'isShowEditDialogState',
    default: false,
})

export const isShowHighlightDialogState = atom({
    key: 'isShowHighlightDialogState',
    default: false,
})

export const isShowCreateEdgeDialogState = atom({
    key: 'isShowCreateEdgeDialogState',
    default: false,
})


export const suggestedEntitiesState = atom<Class[]>({
    key: 'suggestedEntitiesState',
    default: [],
})

export const suggestedAttributesState = atom<Attribute[]>({
    key: 'suggestedAttributesState',
    default: [],
})

export const suggestedRelationshipsState = atom<Association[]>({
    key: 'suggestedRelationshipsState',
    default: [],
})


export const sidebarTitlesState = atom<ItemsMessage>({
    key: 'sidebarTitlesState',
    default: { classes: "", attributes: "", associations: "" },
})


export const isIgnoreDomainDescriptionState = atom({
    key: 'isIgnoreDomainDescriptionState',
    default: false,
})

export const domainDescriptionState = atom({
    key: 'domainDescriptionState',
    default: "",
})

export const domainDescriptionSnapshotsState = atom<DomainDescriptionSnapshot>({
    key: 'domainDescriptionSnapshotsState',
    default: { [UserChoice.CLASSES]: "", [UserChoice.ATTRIBUTES]: "", [UserChoice.ASSOCIATIONS]: "", [UserChoice.ASSOCIATIONS2]: "",
    [UserChoice.SINGLE_FIELD]: "", [UserChoice.SUMMARY_PLAIN_TEXT]: "", [UserChoice.SUMMARY_DESCRIPTIONS]: ""},
})

export const conceptualModelSnapshotState = atom<ConceptualModelSnapshot>({
    key: 'conceptualModelSnapshotState',
    default: { [UserChoice.SUMMARY_PLAIN_TEXT]: "", [UserChoice.SUMMARY_DESCRIPTIONS]: ""},
})


export const fieldToLoadState = atom<Field[]>({
    key: 'fieldToLoadState',
    default: [],
})


export const itemTypesToLoadState = atom<ItemType[]>({
    key: 'itemTypesToLoadState',
    default: [],
})


// TODO: Do not use initial invalid item, instead make a type: Item | null
export const selectedSuggestedItemState = atom<Item>({
    key: 'selectedSuggestedItemState',
    default: blankEntity,
})

export const editedSuggestedItemState = atom<Item>({
    key: 'editedSuggestedItemState',
    default: blankEntity,
})

export const regeneratedItemState = atom<Item>({
    key: 'regeneratedItemState',
    default: blankEntity,
})

export const isSuggestedItemState = atom({
    key: 'isSuggestedItemState',
    default: true,
})


export const isItemInConceptualModelState = atom({
    key: 'isItemInConceptualModelState',
    default: true,
})


export const originalTextIndexesListState = atom<number[]>({
    key: 'originalTextIndexesListState',
    default: [],
})

export const tooltipsState = atom<string[]>({
    key: 'tooltipsState',
    default: [],
})



export const isLoadingSuggestedItemsState = atom({
    key: 'isLoadingSuggestedItemsState',
    default: false,
})

export const isLoadingEditState = atom({
    key: 'isLoadingEditState',
    default: false,
})

export const isLoadingSummaryPlainTextState = atom({
    key: 'isLoadingSummaryPlainTextState',
    default: false,
})

export const isLoadingSummaryDescriptionsState = atom({
    key: 'isLoadingSummaryDescriptionsState',
    default: false,
})

export const summaryTextState = atom({
    key: 'summaryTextState',
    default: "",
})

// TODO: This object should contain descriptions for "entities": array of entities and "relationships": array of relationships
export const summaryDescriptionsState = atom<SummaryObject>({
    key: 'summaryDescriptionsState',
    default: { classes: [], associations: []},
})


export const isSidebarOpenState = atom({
    key: 'isSidebarOpenState',
    default: true,
})


export const sidebarWidthPercentageState = atom({
    key: 'sidebarWidthPercentageState',
    default: 20,
})


export const nodesState = atom<Node[]>({
    key: 'nodesState',
    default: [],
})


// Possible optimization: save only indexes of the selected nodes
export const selectedNodesState = selector<Node[]>({
    key: "selectedNodesState",
    get: ({get}) =>
    {
        const nodes = get(nodesState)
        return nodes.filter((node) => node.selected)   
    }
})

export const edgesState = atom<Edge[]>({
    key: 'edgesState',
    default: [],
})


export const selectedEdgesState = selector<Edge[]>({
    key: "selectedEdgesState",
    get: ({get}) =>
    {
        const edges = get(edgesState)
        return edges.filter((edge) => edge.selected)
    }
})


export const topbarTabValueState = atom({
    key: 'topbarTabValueState',
    default: "0",
})


export const sidebarTabValueState = atom({
    key: 'sidebarTabValueState',
    default: "0",
})


export const editDialogErrorMsgState = atom({
    key: 'editDialogErrorMsgState',
    default: "",
})


export const sidebarErrorMsgState = atom({
    key: 'sidebarErrorMsgState',
    default: "",
})


export const importedFileNameState = atom({
    key: 'importedFileNameState',
    default: "",
})


export const isDialogEnterIRIOpenedState = atom({
    key: 'isDialogEnterIRIOpenedState',
    default: false,
})


export const isShowTitleDialogDomainDescriptionState = atom({
    key: 'isShowTitleDialogDomainDescriptionState',
    default: true,
})

export const modelIDState = atom({
    key: 'modelIDState',
    default: "",
})


export const isSummaryPlainTextReactButtonClickedState = atom({
    key: 'isSummaryPlainTextReactButtonClickedState',
    default: false,
})

export const isSummaryDescriptionReactButtonClickedState = atom({
    key: 'isSummaryDescriptionReactButtonClickedState',
    default: false,
})