import { Button } from "@mui/material"
import HighlightIcon from "@mui/icons-material/Highlight";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { EdgeData, Field, NodeData, OriginalTextIndexesItem } from "../../interfaces/interfaces";
import { NOTHING_SELECTED_MSG, capitalizeString } from "../../utils/utility";
import { createNameFromIRI } from "../../utils/conceptualModel";
import useFetchMergedOriginalTexts from "../../hooks/useFetchMergedOriginalTexts";
import { selectedNodesState, selectedEdgesState } from "../../atoms/conceptualModel";
import { isShowHighlightDialogState, isShowTitleDialogDomainDescriptionState } from "../../atoms/dialogs";
import { domainDescriptionState } from "../../atoms/domainDescription";


const HighlightSelectedItemsButton: React.FC = ():JSX.Element =>
{
    const selectedNodes = useRecoilValue(selectedNodesState)
    const selectedEdges = useRecoilValue(selectedEdgesState)

    const domainDescription = useRecoilValue(domainDescriptionState)
    const isDisabled = domainDescription === ""

    const setIsShowHighlightDialog = useSetRecoilState(isShowHighlightDialogState)
    const setIsShowTitleDialogDomainDescription = useSetRecoilState(isShowTitleDialogDomainDescriptionState)

    const { fetchMergedOriginalTexts } = useFetchMergedOriginalTexts()

    const buttonText = "Highlight original text"
    let originalTextsIndexesObjects : OriginalTextIndexesItem[] = []


    const onHighlightSelectedItems = (): void =>
    {
        if (selectedNodes.length === 0 && selectedEdges.length === 0)
        {
            alert(NOTHING_SELECTED_MSG)
            return
        }

        setIsShowTitleDialogDomainDescription(false)

        pushOriginalTextIndexesFromSelectedNodes()
        pushOriginalTextIndexesFromSelectedEdges()

        const bodyData = JSON.stringify({ "originalTextIndexesObject": originalTextsIndexesObjects })
    
        fetchMergedOriginalTexts(bodyData)
        setIsShowHighlightDialog(true)
    }


    const pushOriginalTextIndexesFromSelectedNodes = () =>
    {
        for (let i = 0; i < selectedNodes.length; i++)
        {
            const nodeData: NodeData = selectedNodes[i].data

            // Process each attribute for the given class
            const className: string = nodeData.class[Field.NAME]

            for (let j = 0; j < nodeData.attributes.length; j++)
            {
                const attribute = nodeData.attributes[j]
                const originalTextIndexes = attribute[Field.ORIGINAL_TEXT_INDEXES]
        
                if (!attribute[Field.ORIGINAL_TEXT_INDEXES])
                {
                    continue
                }
        
                // Process each of the original text indexes for the given attribute
                for (let k = 0; k < originalTextIndexes.length; k += 2)
                {
                    const ii1: number = originalTextIndexes[k]
                    const ii2: number = originalTextIndexes[k + 1]
            
                    originalTextsIndexesObjects.push( { indexes: [ii1, ii2], label: `${className}: ${attribute[Field.NAME]}`} )
                }
            }

            const originalTextIndexes = nodeData.class[Field.ORIGINAL_TEXT_INDEXES]

            if (!originalTextIndexes)
            {
                continue
            }
        
            // Process each of the original text indexes for the given class 
            for (let k = 0; k < originalTextIndexes.length; k += 2)
            {
                const ii1: number = originalTextIndexes[k]
                const ii2: number = originalTextIndexes[k + 1]
        
                originalTextsIndexesObjects.push( { indexes: [ii1, ii2], label: `Class: ${nodeData.class[Field.NAME]}`} )
            }
        }
    }

    const pushOriginalTextIndexesFromSelectedEdges = () =>
    {
        for (let i = 0; i < selectedEdges.length; i++)
        {
            const edgeData: EdgeData = selectedEdges[i].data
            const originalTextIndexes = edgeData.association.originalTextIndexes
            
            if (!originalTextIndexes)
            {
                continue
            }
        
            // Process each of the original text indexes for the given edge
            for (let k = 0; k < originalTextIndexes.length; k += 2)
            {
                const ii1 : number = originalTextIndexes[k]
                const ii2 : number = originalTextIndexes[k + 1]

                const sourceName = createNameFromIRI(selectedEdges[i][Field.SOURCE_CLASS])
                const targetName = createNameFromIRI(selectedEdges[i][Field.TARGET_CLASS])
        
                originalTextsIndexesObjects.push({
                    indexes: [ii1, ii2], label: `${sourceName} - ${edgeData.association[Field.NAME]} - ${targetName}`
                })
            }
        }
    }


    return (
        <Button
            disabled={ isDisabled }
            startIcon={ <HighlightIcon/> }
            variant="contained"
            sx={{ textTransform: "none" }}
            disableElevation 
            onClick={ onHighlightSelectedItems }>
                { buttonText }
        </Button>

    )
}

export default HighlightSelectedItemsButton