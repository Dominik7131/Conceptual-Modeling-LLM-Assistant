import { Button } from "@mui/material"
import HighlightIcon from '@mui/icons-material/Highlight';
import { isShowHighlightDialogState, originalTextIndexesListState, selectedEdgesState, selectedNodesState, selectedSuggestedItemState, suggestedItemsState, tooltipsState } from "../../atoms";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { Attribute, EdgeData, Field, Item, ItemType, NodeData, OriginalTextIndexesItem } from "../../interfaces";
import { HEADER, MERGE_ORIGINAL_TEXT_URL, capitalizeString } from "../../hooks/useUtility";


const HighlightSelectedItemsButton: React.FC = ():JSX.Element =>
{
    const selectedNodes = useRecoilValue(selectedNodesState)
    const selectedEdges = useRecoilValue(selectedEdgesState)

    const setIsShowHighlightDialog = useSetRecoilState(isShowHighlightDialogState)
    const setoriginalTextIndexesList = useSetRecoilState(originalTextIndexesListState)
    const setTooltips = useSetRecoilState(tooltipsState)


    // TODO: Put this fetch logic into a separate file
    const fetchMergedOriginalTexts = (bodyData: any) =>
    {
        fetch(MERGE_ORIGINAL_TEXT_URL, { method: "POST", headers: HEADER, body: bodyData})
        .then(response => response.json())
        .then(data => 
        {
            // TODO: Specify `data` type
            onProcessMergedOriginalTexts(data)
        })
        .catch(error => console.log(error))
        return
    }


    function onProcessMergedOriginalTexts(data: any): void
    {
        let tooltips : string[] = []
        let originalTextIndexes : number[] = []

        for (let index = 0; index < data.length; index++)
        {
            const element = data[index];
            originalTextIndexes.push(element[0])
            originalTextIndexes.push(element[1])
            tooltips.push(element[2])
        }

        setoriginalTextIndexesList(_ => originalTextIndexes)
        setTooltips(_ => tooltips)
    }


    const onHighlightSelectedItems = (): void =>
    {
        let originalTextsIndexesObjects : OriginalTextIndexesItem[] = []
    
        // Process all selected nodes
        for (let i = 0; i < selectedNodes.length; i++)
        {
            const nodeData: NodeData = selectedNodes[i].data

            // Process each attribute for the given entity
            const entityName: string = capitalizeString(selectedNodes[i].id)
            for (let j = 0; j < nodeData.attributes.length; j++)
            {
                const attribute = nodeData.attributes[j]
                const originalTextIndexes = attribute.originalTextIndexes
        
                if (!attribute.originalTextIndexes)
                {
                    continue
                }
        
                // Process each original text indexes for the given attribute
                for (let k = 0; k < originalTextIndexes.length; k += 2)
                {
                    const ii1: number = originalTextIndexes[k]
                    const ii2: number = originalTextIndexes[k + 1]
            
                    originalTextsIndexesObjects.push( { indexes: [ii1, ii2], label: `${entityName}: ${attribute.name}`} )
                }
            }

            const originalTextIndexes = nodeData.entity.originalTextIndexes

            if (!originalTextIndexes)
            {
                continue
            }
        
            // Process each original text indexes for the given entity 
            for (let k = 0; k < originalTextIndexes.length; k += 2)
            {
                const ii1 : number = originalTextIndexes[k]
                const ii2 : number = originalTextIndexes[k + 1]
        
                originalTextsIndexesObjects.push( { indexes: [ii1, ii2], label: `Entity: ${selectedNodes[i].id}`} )
            }
        }
    
        // Process also all selected edges
        for (let i = 0; i < selectedEdges.length; i++)
        {
            const edgeData: EdgeData = selectedEdges[i].data
            const originalTextIndexes = edgeData.relationship.originalTextIndexes
            
            if (!originalTextIndexes)
            {
                continue
            }
        
            // Process each original text indexes for the given edge 
            for (let k = 0; k < originalTextIndexes.length; k += 2)
            {
                const ii1 : number = originalTextIndexes[k]
                const ii2 : number = originalTextIndexes[k + 1]
        
                originalTextsIndexesObjects.push({
                    indexes: [ii1, ii2], label: `${selectedEdges[i].source} – ${edgeData.relationship.name} – ${selectedEdges[i].target}`
                })
            }
        }

        const url = MERGE_ORIGINAL_TEXT_URL
        const headers = { "Content-Type": "application/json" }
        const bodyData = JSON.stringify({ "originalTextIndexesObject": originalTextsIndexesObjects})
    
        fetchMergedOriginalTexts(bodyData)
        setIsShowHighlightDialog(true)
    }


    return (
        <Button
            startIcon={<HighlightIcon/>}
            variant="contained"
            sx={{textTransform: "none"}}
            disableElevation 
            onClick={onHighlightSelectedItems}>
                { capitalizeString("Highlight original text") }
        </Button>

    )
}

export default HighlightSelectedItemsButton