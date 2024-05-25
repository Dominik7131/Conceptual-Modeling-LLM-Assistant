import { useSetRecoilState } from "recoil"
import { isLoadingSummaryPlainTextState, summaryTextState } from "../atoms"
import { SUGGEST_SUMMARY_URL, HEADER } from "../utils/urls"


const useFetchSummaryPlainText = () =>
{
    const setIsLoadingSummaryPlainText = useSetRecoilState(isLoadingSummaryPlainTextState)
    const setSummaryText = useSetRecoilState(summaryTextState)


    const fetchSummaryPlainText = (bodyDataJSON : string) =>
    {
        setIsLoadingSummaryPlainText(_ => true)
    
        fetch(SUGGEST_SUMMARY_URL, { method: "POST", headers: HEADER, body: bodyDataJSON })
        .then(response =>
        {
            const stream = response.body // Get the readable stream from the response body
    
            if (stream === null)
            {
                console.log("Stream is null")
                setIsLoadingSummaryPlainText(_ => false)
                return
            }
    
            const reader = stream.getReader()
    
            const readChunk = () =>
            {
                reader.read()
                .then(({value, done}) =>
                {
                    if (done)
                    {
                        console.log("Stream finished")
                        setIsLoadingSummaryPlainText(_ => false)
                        return
                    }

                    const valueJSON: string = new TextDecoder().decode(value)
                    const parsedData = JSON.parse(valueJSON)

                    setSummaryText(parsedData["summary"])

                    readChunk()
                })
                .catch(error =>
                {
                    console.error(error)
                })
            }
            readChunk()
        })
        .catch(error =>
        {
            console.error(error)
            setIsLoadingSummaryPlainText(_ => false)
            alert("Error: request failed")
        })
    }

    return { fetchSummaryPlainText }
}

export default useFetchSummaryPlainText