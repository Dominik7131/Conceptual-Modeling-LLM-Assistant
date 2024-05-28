import { useSetRecoilState } from "recoil"
import { UserChoiceItem, ItemType } from "../definitions/utility"
import { SUGGEST_SUMMARY_URL, HEADER } from "../definitions/urls"
import { isLoadingSummaryDescriptionsState } from "../atoms/loadings"
import { summaryDescriptionsState } from "../atoms/summary"
import { SummaryClass } from "../definitions/summary"
import { Association } from "../definitions/conceptualModel"


const useFetchSummaryDescriptions = () =>
{
    const setIsLoadingSummaryDescriptions = useSetRecoilState(isLoadingSummaryDescriptionsState)
    const setSummaryDescriptions = useSetRecoilState(summaryDescriptionsState)


    const fetchSummaryDescriptions = (bodyDataJSON : string) =>
    {
        setIsLoadingSummaryDescriptions(true)
    
        fetch(SUGGEST_SUMMARY_URL, { method: "POST", headers: HEADER, body: bodyDataJSON })
        .then(response =>
        {
            const stream = response.body // Get the readable stream from the response body
    
            if (stream === null)
            {
                console.log("Stream is null")
                setIsLoadingSummaryDescriptions(false)
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
                        setIsLoadingSummaryDescriptions(false)
                        return
                    }

                    parseSummaryDescriptions(value)

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
            setIsLoadingSummaryDescriptions(false)
            alert("Error: request failed")
        })
    }


    const parseSummaryDescriptions = (value: Uint8Array) =>
    {
        const stringJSON: string = new TextDecoder().decode(value)
        console.log("JsonString: ", stringJSON)


        // Handle situation when the `jsonString` contains more than one JSON object because of stream buffering
        const jsonStringParts = stringJSON.split('\n').filter((string => string !== ""))

        for (let i = 0; i < jsonStringParts.length; i++)
        {
            const parsedData = JSON.parse(jsonStringParts[i])

            console.log("Parsed data:", parsedData)

            let classes: SummaryClass[] = []
            let associations: Association[] = []

            if (parsedData.hasOwnProperty(UserChoiceItem.CLASSES))
            {
                classes = parsedData[UserChoiceItem.CLASSES]
            }
            else
            {
                console.log("Received unknown object: ", parsedData)
            }

            if (parsedData.hasOwnProperty("associations"))
            {
                associations = parsedData["associations"]
            }
            else
            {
                console.log("Received unknown object: ", parsedData)
            }

            for (let index = 0; index < classes.length; index++)
            {
                console.log("Class: ", classes[index])
                setSummaryDescriptions(previousSummary => ({
                    ...previousSummary,
                    classes: [...previousSummary.classes, classes[index]],
                }))
            }

            for (let index = 0; index < associations.length; index++)
            {
                console.log("Association: ", associations[index])
                setSummaryDescriptions(previousSummary => ({
                    ...previousSummary,
                    associations: [...previousSummary.associations, associations[index]],
                }))
            }
        }
    }


    return { fetchSummaryDescriptions }
}

export default useFetchSummaryDescriptions