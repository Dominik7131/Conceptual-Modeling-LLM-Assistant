import { Node, Edge } from "reactflow"
import { atom, selector } from "recoil"
import { DATASPECER_MODEL_URL } from "../definitions/urls"


export const nodesState = atom<Node[]>({
    key: "nodesState",
    default: [],
})


export const selectedNodesState = selector<Node[]>({
    key: "selectedNodesState",
    get: ({get}) =>
    {
        const nodes = get(nodesState)
        return nodes.filter((node) => node.selected)   
    }
})

export const edgesState = atom<Edge[]>({
    key: "edgesState",
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


export const isItemInConceptualModelState = atom({
    key: "isItemInConceptualModelState",
    default: true,
})


export const modelIDState = atom({
    key: "modelIDState",
    default: DATASPECER_MODEL_URL,
})


export const importedFileNameState = atom({
    key: "importedFileNameState",
    default: "",
})