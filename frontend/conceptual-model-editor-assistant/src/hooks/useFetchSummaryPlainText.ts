import { useSetRecoilState } from "recoil"
import { SUGGEST_SUMMARY_URL, HEADER } from "../definitions/urls"
import { summaryTextState } from "../atoms/summary"
import { isLoadingSummaryPlainTextState } from "../atoms/loadings"


const useFetchSummaryPlainText = () =>
{
    const setIsLoadingSummaryPlainText = useSetRecoilState(isLoadingSummaryPlainTextState)
    const setSummaryText = useSetRecoilState(summaryTextState)


    const fetchSummaryPlainText = (bodyDataJSON : string) =>
    {
        setIsLoadingSummaryPlainText(true)
    
        fetch(SUGGEST_SUMMARY_URL, { method: "POST", headers: HEADER, body: bodyDataJSON })
        .then(response =>
        {
            const stream = response.body // Get the readable stream from the response body
    
            if (stream === null)
            {
                console.log("Stream is null")
                setIsLoadingSummaryPlainText(false)
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
                        setIsLoadingSummaryPlainText(false)
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
                    setIsLoadingSummaryPlainText(false)
                })
            }
            readChunk()
        })
        .catch(error =>
        {
            console.error(error)
            setIsLoadingSummaryPlainText(false)
            alert("Error: request failed")
        })
    }

    return { fetchSummaryPlainText }
}

export default useFetchSummaryPlainText