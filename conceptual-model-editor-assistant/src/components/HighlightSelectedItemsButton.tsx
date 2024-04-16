import { Button } from "@mui/material"
import HighlightIcon from '@mui/icons-material/Highlight';
import { isShowHighlightDialogState, originalTextIndexesListState, selectedEdgesState, selectedNodesState, selectedSuggestedItemState, suggestedItemsState, tooltipsState } from "../atoms";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { Attribute, Field, Item, ItemType, OriginalTextIndexesItem } from "../interfaces";
import { BASE_URL, capitalizeString } from "../hooks/useUtility";


const HighlightSelectedItemsButton: React.FC = ():JSX.Element =>
{
    const selectedNodes = useRecoilValue(selectedNodesState)
    const selectedEdges = useRecoilValue(selectedEdgesState)

    const setIsShowHighlightDialog = useSetRecoilState(isShowHighlightDialogState)
    const setoriginalTextIndexesList = useSetRecoilState(originalTextIndexesListState)
    const setTooltips = useSetRecoilState(tooltipsState)


    // TODO: Put this fetch logic into a separate file
    const fetchMergedOriginalTexts = (url: string, headers: any, bodyData: any) =>
    {
        fetch(url, { method: "POST", headers, body: bodyData})
        .then(response => response.json())
        .then(data => 
        {
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
            // Process each attribute for the given entity
            const entityName: string = capitalizeString(selectedNodes[i].id)
            for (let j = 0; j < selectedNodes[i].data.attributes.length; j++)
            {
                const element = selectedNodes[i].data.attributes[j];
        
                if (!element.originalTextIndexes)
                {
                    continue
                }
        
                // Process each original text indexes for the given attribute
                for (let k = 0; k < element.originalTextIndexes.length; k += 2)
                {
                const ii1: number = element.originalTextIndexes[k]
                const ii2: number = element.originalTextIndexes[k + 1]
        
                originalTextsIndexesObjects.push( { indexes: [ii1, ii2], label: `${entityName}: ${element.name}`} )
                }
            }
        
        
            if (!selectedNodes[i].data.originalTextIndexes)
            {
                continue
            }
        
            // Process each original text indexes for the given entity 
            for (let k = 0; k < selectedNodes[i].data.originalTextIndexes.length; k += 2)
            {
                const ii1 : number = selectedNodes[i].data.originalTextIndexes[k]
                const ii2 : number = selectedNodes[i].data.originalTextIndexes[k + 1]
        
                originalTextsIndexesObjects.push( { indexes: [ii1, ii2], label: `Entity: ${selectedNodes[i].id}`} )
            }
        }
    
        // Process also all selected edges
        for (let i = 0; i < selectedEdges.length; i++)
        {
            if (!selectedEdges[i].data.originalTextIndexes)
            {
                continue
            }
        
            // Process each original text indexes for the given edge 
            for (let k = 0; k < selectedEdges[i].data.originalTextIndexes.length; k += 2)
            {
                const ii1 : number = selectedEdges[i].data.originalTextIndexes[k]
                const ii2 : number = selectedEdges[i].data.originalTextIndexes[k + 1]
        
                originalTextsIndexesObjects.push( { indexes: [ii1, ii2], label: `${selectedEdges[i].source} – ${selectedEdges[i].data.name} – ${selectedEdges[i].target}`} )
            }
        }
    
        const endpoint = "merge_original_texts"
        const url = BASE_URL + endpoint
        const headers = { "Content-Type": "application/json" }
        const bodyData = JSON.stringify({ "originalTextIndexesObject": originalTextsIndexesObjects})
    
        fetchMergedOriginalTexts(url, headers, bodyData)
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