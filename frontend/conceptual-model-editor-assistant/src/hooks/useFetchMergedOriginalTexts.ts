import { useSetRecoilState } from "recoil"
import { HEADER, MERGE_ORIGINAL_TEXT_URL } from "../definitions/urls"
import { originalTextIndexesListState, tooltipsState } from "../atoms/originalTextIndexes"
import { isLoadingHighlightOriginalTextState } from "../atoms/loadings"
import { OriginalTextIndexesProcessedItem } from "../definitions/originalTextIndexes"


const useFetchMergedOriginalTexts = () =>
{
    const setIsLoading = useSetRecoilState(isLoadingHighlightOriginalTextState)
    const setOriginalTextIndexesList = useSetRecoilState(originalTextIndexesListState)
    const setTooltips = useSetRecoilState(tooltipsState)

    
    const fetchMergedOriginalTexts = (bodyDataJSON: string) =>
    {
        setIsLoading(true)
        
        fetch(MERGE_ORIGINAL_TEXT_URL, { method: "POST", headers: HEADER, body: bodyDataJSON})
        .then(response => response.json())
        .then(data =>
        {
            onProcessMergedOriginalTexts(data)
            setIsLoading(false)
        })
        .catch(error =>
        {
            setIsLoading(false)
            console.log(error)
            alert("Error: request failed")
        })

        return
    }


    const onProcessMergedOriginalTexts = (data: OriginalTextIndexesProcessedItem[]): void =>
    {
        let tooltips : string[] = []
        let originalTextIndexes : number[] = []

        for (let index = 0; index < data.length; index++)
        {
            const element: OriginalTextIndexesProcessedItem = data[index]
            originalTextIndexes.push(element[0])
            originalTextIndexes.push(element[1])
            tooltips.push(element[2])
        }

        setOriginalTextIndexesList(originalTextIndexes)
        setTooltips(tooltips)
    }

    return { fetchMergedOriginalTexts }
}

export default useFetchMergedOriginalTexts