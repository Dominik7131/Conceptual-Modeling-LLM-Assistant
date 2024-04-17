import { atom, selector } from 'recoil'
import { Attribute, Entity, Field, Item, ItemType, Relationship, SummaryObject } from './interfaces';
import { Node, Edge } from 'reactflow';


export const isShowEditDialogState = atom({
    key: 'isShowEditDialogState',
    default: false,
});

export const isShowHighlightDialogState = atom({
    key: 'isShowHighlightDialogState',
    default: false,
});

export const isShowCreateEdgeDialogState = atom({
    key: 'isShowCreateEdgeDialogState',
    default: false,
});


export const suggestedEntitiesState = atom<Entity[]>({
    key: 'suggestedEntitiesState',
    default: [],
});

export const suggestedAttributesState = atom<Attribute[]>({
    key: 'suggestedAttributesState',
    default: [],
});

export const suggestedRelationshipsState = atom<Relationship[]>({
    key: 'suggestedRelationshipsState',
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

export const fieldToLoadState = atom<Field[]>({
    key: 'fieldToLoadState',
    default: [],
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

export const isLoadingSummaryPlainTextState = atom({
    key: 'isLoadingSummaryPlainTextState',
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


export const sidebarWidthPercentageState = atom({
    key: 'sidebarWidthPercentageState',
    default: 20,
});


export const nodesState = atom<Node[]>({
    key: 'nodesState',
    default: [],
});


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


export const editDialogWarningMsgState = atom({
    key: 'editDialogWarningMsgState',
    default: "",
})