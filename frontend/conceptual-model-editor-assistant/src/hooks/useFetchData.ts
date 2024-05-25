import { Attribute, Field, Item, ItemType, Association, UserChoice } from "../interfaces/interfaces";
import { useRecoilState, useSetRecoilState } from "recoil";
import { isLoadingSummaryPlainTextState, isLoadingSummaryDescriptionsState, summaryDescriptionsState, summaryTextState, sidebarErrorMsgState, itemTypesToLoadState, suggestedClassesState, suggestedAttributesState, suggestedAssociationsState } from "../atoms";
import { onClearSuggestedItems } from "../utils/utility";
import { HEADER, SUGGEST_ITEMS_URL, SUGGEST_SUMMARY_URL } from "../utils/urls";
import { createIRIFromName } from "../utils/conceptualModel";


const useFetchData = () =>
{
    // TODO: Split all fetch data methods into separate files
    const [itemTypesToLoad, setItemTypesToLoad] = useRecoilState(itemTypesToLoadState)
    const setIsLoadingSummaryPlainText = useSetRecoilState(isLoadingSummaryPlainTextState)
    const setIsLoadingSummaryDescriptions = useSetRecoilState(isLoadingSummaryDescriptionsState)

    const setSummaryText = useSetRecoilState(summaryTextState)
    const setSummaryDescriptions = useSetRecoilState(summaryDescriptionsState)

    const setSuggestedEntities = useSetRecoilState(suggestedClassesState)
    const setSuggestedAttributes = useSetRecoilState(suggestedAttributesState)
    const setSuggestedRelationships = useSetRecoilState(suggestedAssociationsState)

    const setErrorMessage = useSetRecoilState(sidebarErrorMsgState)


    const fetchStreamedData = (bodyData: any, sourceClassName: string, itemType: ItemType) =>
    {
      // TODO: add object interface for header and bodyData

      // Fetch the event stream from the server
      // Code from: https://medium.com/@bs903944/event-streaming-made-easy-with-event-stream-and-javascript-fetch-8d07754a4bed

      setItemTypesToLoad(previousItems => [...previousItems, itemType])
      setErrorMessage("")

      const controller = new AbortController()
      const signal = controller.signal
      let isEmptyResponse = true
      
      fetch(SUGGEST_ITEMS_URL, { method: "POST", headers: HEADER, body: bodyData, signal: signal })
      .then(response =>
        {
          // Reset all suggested items
          onClearSuggestedItems(itemType, setSuggestedEntities, setSuggestedAttributes, setSuggestedRelationships)
          setErrorMessage("")

          if (!itemTypesToLoad.includes(itemType))
          {
            setItemTypesToLoad(previousItems => [...previousItems, itemType])
          }

          const stream = response.body // Get the readable stream from the response body

          if (stream === null)
          {
            console.log("Stream is null")
            setItemTypesToLoad(previousItems => previousItems.filter(currentItemType => currentItemType !== itemType))
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
                        setItemTypesToLoad(previousItems => previousItems.filter(currentItemType => currentItemType !== itemType))

                        const isNothingFound = (itemType === ItemType.CLASS && isEmptyResponse) ||
                                               (itemType === ItemType.ATTRIBUTE && isEmptyResponse) ||
                                               (itemType === ItemType.ASSOCIATION && isEmptyResponse)

                        if (isNothingFound)
                        {
                          const message = "No suggestions found"
                          setErrorMessage(message)
                        }
                        return
                      }

                      isEmptyResponse = false
                      onProcessStreamedData(value, sourceClassName, itemType)

                      // Read the next chunk
                      readChunk()
                  })
                  .catch(error =>
                  {
                    console.error(error)
                    setItemTypesToLoad(previousItems => previousItems.filter(currentItemType => currentItemType !== itemType))
                    const errorMessage = `Backend error: ${error}\n\nFor more info check the console.`
                    setErrorMessage(errorMessage)
                  })
          }
          // Start reading the first chunk
          readChunk()
      })
      .catch(error =>
      {
        console.error(error)
        setItemTypesToLoad(previousItems => previousItems.filter(currentItemType => currentItemType !== itemType))
        const errorMessage = `Backend error: ${error}\n\nFor more info check the console.`
        setErrorMessage(errorMessage)
      })
    }


  const onProcessStreamedData = (value: any, sourceClassName: string, itemType: ItemType): void =>
  {
    // Convert the `value` to a string
    var jsonString = new TextDecoder().decode(value)

    // Handle situation when the `jsonString` contains more than one JSON object because of stream buffering
    const jsonStringParts = jsonString.split('\n').filter((string => string !== ''))

    for (let i = 0; i < jsonStringParts.length; i++)
    {
      let item : Item = JSON.parse(jsonStringParts[i])
      item[Field.IRI] = createIRIFromName(item[Field.NAME])
      item[Field.TYPE] = itemType

      if (itemType === ItemType.CLASS)
      {
        setSuggestedEntities(previousSuggestedItems => {
          return [...previousSuggestedItems, item]
        })
      }


      if (itemType === ItemType.ATTRIBUTE)
      {
        let attribute: Attribute = item as Attribute
        const sourceClassIRI = createIRIFromName(sourceClassName)
        attribute[Field.SOURCE_CLASS] = sourceClassIRI

        setSuggestedAttributes(previousSuggestedItems => {
          return [...previousSuggestedItems, attribute]
        })
      }
      else if (itemType === ItemType.ASSOCIATION)
      {
        let association: Association = item as Association
        const sourceClassIRI = createIRIFromName(association[Field.SOURCE_CLASS])
        const targetClassIRI = createIRIFromName(association[Field.TARGET_CLASS])
        
        association[Field.SOURCE_CLASS] = sourceClassIRI
        association[Field.TARGET_CLASS] = targetClassIRI

        setSuggestedRelationships(previousSuggestedItems => {
          return [...previousSuggestedItems, association]
        })
      }
    }
  }


  const fetchSummaryPlainText = (bodyData : any) =>
  {
    setIsLoadingSummaryPlainText(_ => true)

    fetch(SUGGEST_SUMMARY_URL, { method: "POST", headers: HEADER, body: bodyData })
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

                    // Convert the `value` to a string
                    var jsonString = new TextDecoder().decode(value)
                    console.log("JsonString: ", jsonString)
                    
                    const parsedData = JSON.parse(jsonString)
                    console.log("Parsed data:", parsedData)
                    setSummaryText(parsedData["summary"])

                    readChunk() // Read the next chunk
                })
                .catch(error =>
                {
                  console.error(error)
                })
        }
        readChunk() // Start reading the first chunk
    })
    .catch(error =>
    {
      console.error(error)
      setIsLoadingSummaryPlainText(_ => false)
      alert("Error: request failed")
    })
  }

  const fetchSummaryDescriptions = (bodyData : any) =>
  {
    setIsLoadingSummaryDescriptions(_ => true)

    fetch(SUGGEST_SUMMARY_URL, { method: "POST", headers: HEADER, body: bodyData })
    .then(response =>
    {
        const stream = response.body // Get the readable stream from the response body

        if (stream === null)
        {
          console.log("Stream is null")
          setIsLoadingSummaryDescriptions(_ => false)
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
                        setIsLoadingSummaryDescriptions(_ => false)
                        return
                    }

                    // Convert the `value` to a string
                    var jsonString = new TextDecoder().decode(value)
                    console.log("JsonString: ", jsonString)


                    // Handle situation when the `jsonString` contains more than one JSON object because of stream buffering
                    const jsonStringParts = jsonString.split('\n').filter((string => string !== ''))

                    for (let i = 0; i < jsonStringParts.length; i++)
                    {
                      const parsedData = JSON.parse(jsonStringParts[i])

                      if (!parsedData[UserChoice.ATTRIBUTES])
                      {
                        parsedData[UserChoice.ATTRIBUTES] = []
                      }
                      
                      console.log("Parsed data:", parsedData)

                      if (parsedData.hasOwnProperty(ItemType.CLASS))
                      {
                        setSummaryDescriptions(previousSummary => ({
                          ...previousSummary,
                          classes: [...previousSummary.classes, parsedData],
                        }))
                      }
                      else if (parsedData.hasOwnProperty(ItemType.ASSOCIATION))
                      {
                        setSummaryDescriptions(previousSummary => ({
                          ...previousSummary,
                          associations: [...previousSummary.associations, parsedData],
                        }))
                      }
                      else
                      {
                        console.log("Received unknown object: ", parsedData)
                      }
                    }

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
      setIsLoadingSummaryDescriptions(_ => false)
      alert("Error: request failed")
    })
  }


  return { fetchSummaryPlainText, fetchSummaryDescriptions, fetchStreamedData }
}

export default useFetchData