import { useState } from "react";
import { Attribute, Field, Item, ItemType, Relationship, SummaryObject } from "../interfaces";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { isLoadingEditState, isLoadingSuggestedItemsState, isLoadingSummaryPlainTextState, isLoadingSummaryDescriptionsState, summaryDescriptionsState, summaryTextState, sidebarErrorMsgState, itemTypesToLoadState, suggestedEntitiesState, suggestedAttributesState, suggestedRelationshipsState } from "../atoms";
import { HEADER, SUGGEST_ITEMS_URL, SUMMARY_DESCRIPTIONS_URL, SUMMARY_PLAIN_TEXT_URL, createIRIFromName, onClearSuggestedItems } from "./useUtility";


const useFetchData = () =>
{
    // TODO: Split all fetch data methods into separate files
    const [itemTypesToLoad, setItemTypesToLoad] = useRecoilState(itemTypesToLoadState)
    const setIsLoadingSummary1 = useSetRecoilState(isLoadingSummaryPlainTextState)
    const setIsLoadingSummaryDescriptions = useSetRecoilState(isLoadingSummaryDescriptionsState)

    const setSummaryText = useSetRecoilState(summaryTextState)
    const setSummaryDescriptions = useSetRecoilState(summaryDescriptionsState)

    const setSuggestedEntities = useSetRecoilState(suggestedEntitiesState)
    const setSuggestedAttributes = useSetRecoilState(suggestedAttributesState)
    const setSuggestedRelationships = useSetRecoilState(suggestedRelationshipsState)

    const setErrorMessage = useSetRecoilState(sidebarErrorMsgState)


    const fetchStreamedData = (bodyData: any, sourceEntityIRI: string, itemType: ItemType) =>
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

                        const isNothingFound = (itemType === ItemType.ENTITY && isEmptyResponse) ||
                                               (itemType === ItemType.ATTRIBUTE && isEmptyResponse) ||
                                               (itemType === ItemType.RELATIONSHIP && isEmptyResponse)

                        if (isNothingFound)
                        {
                          const message = "No suggestions found"
                          setErrorMessage(message)
                        }
                        return
                      }

                      isEmptyResponse = false
                      onProcessStreamedData(value, sourceEntityIRI, itemType)

                      // Read the next chunk
                      readChunk()
                  })
                  .catch(error =>
                  {
                    console.error(error)
                  })
          }
          // Start reading the first chunk
          readChunk()
      })
      .catch(error =>
      {
        console.log(error)
        setItemTypesToLoad(previousItems => previousItems.filter(currentItemType => currentItemType !== itemType))
        const errorMessage = `Backend error: ${error}\n\nFor more info check the console.`
        setErrorMessage(errorMessage)
      })
    }


  const onProcessStreamedData = (value: any, sourceEntityName: string, itemType: ItemType): void =>
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

      if (itemType === ItemType.ENTITY)
      {
        setSuggestedEntities(previousSuggestedItems => {
          return [...previousSuggestedItems, item]
        })
      }

      if (itemType === ItemType.ATTRIBUTE)
      {
        let attribute: Attribute = item as Attribute
        attribute[Field.SOURCE_ENTITY] = sourceEntityName

        setSuggestedAttributes(previousSuggestedItems => {
          return [...previousSuggestedItems, attribute]
        })
      }
      else if (itemType === ItemType.RELATIONSHIP)
      {
        let relationship: Relationship = item as Relationship
        relationship[Field.SOURCE_ENTITY] = sourceEntityName

        setSuggestedRelationships(previousSuggestedItems => {
          return [...previousSuggestedItems, relationship]
        })
      }
    }
  }


  const fetchSummaryPlainText = (bodyData : any) =>
  {
    setIsLoadingSummary1(_ => true)

    fetch(SUMMARY_PLAIN_TEXT_URL, { method: "POST", headers: HEADER, body: bodyData })
    .then(response =>
    {
        const stream = response.body // Get the readable stream from the response body

        if (stream === null)
        {
          console.log("Stream is null")
          setIsLoadingSummary1(_ => false)
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
                        setIsLoadingSummary1(_ => false)
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
      setIsLoadingSummary1(_ => false)
      alert("Error: request failed")
    })
  }

  const fetchSummaryDescriptions = (bodyData : any) =>
  {
    setIsLoadingSummaryDescriptions(_ => true)

    fetch(SUMMARY_DESCRIPTIONS_URL, { method: "POST", headers: HEADER, body: bodyData })
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

                      if (!parsedData["attributes"])
                      {
                        parsedData["attributes"] = []
                      }
                      
                      console.log("Parsed data:", parsedData)

                      if (parsedData.hasOwnProperty("entity"))
                      {
                        setSummaryDescriptions(previousSummary => ({
                          ...previousSummary,
                          entities: [...previousSummary.entities, parsedData],
                        }))
                      }
                      else if (parsedData.hasOwnProperty("relationship"))
                      {
                        setSummaryDescriptions(previousSummary => ({
                          ...previousSummary,
                          relationships: [...previousSummary.relationships, parsedData],
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