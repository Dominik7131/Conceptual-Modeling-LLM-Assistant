import { useState } from "react";
import { Field, ItemType, SummaryObject } from "../interfaces";
import { useSetRecoilState } from "recoil";
import { isLoadingEditState, isLoadingSuggestedItemsState, isLoadingSummary1State, isLoadingSummaryDescriptionsState, suggestedItemsState, summaryDescriptionsState, summaryTextState } from "../atoms";


interface Props
{
  onProcessStreamedData: (value: any, sourceEntityName: string, itemType: ItemType) => void
}

const useFetchData = ({ onProcessStreamedData }: Props) =>
{
    // TODO: Split all fetch data methods to a separate files
    const setIsLoadingSuggestedItems = useSetRecoilState(isLoadingSuggestedItemsState)
    const setIsLoadingSummary1 = useSetRecoilState(isLoadingSummary1State)
    const setIsLoadingSummaryDescriptions = useSetRecoilState(isLoadingSummaryDescriptionsState)

    const setSummaryText = useSetRecoilState(summaryTextState)
    const setSummaryDescriptions = useSetRecoilState(summaryDescriptionsState)

    const setSuggestedItems = useSetRecoilState(suggestedItemsState)


    const fetchStreamedData = (url: string, headers: any, bodyData: any, sourceEntityName: string, itemType: ItemType) =>
    {
      // TODO: add object interface for header and bodyData

      // Fetch the event stream from the server
      // Code from: https://medium.com/@bs903944/event-streaming-made-easy-with-event-stream-and-javascript-fetch-8d07754a4bed

      setIsLoadingSuggestedItems(_ => true)

      const controller = new AbortController()
      const signal = controller.signal
      
      fetch(url, { method: "POST", headers, body: bodyData, signal: signal })
      .then(response =>
        {
          // Reset all suggested items
          setSuggestedItems(_ => [])

          setIsLoadingSuggestedItems(_ => true)
          const stream = response.body; // Get the readable stream from the response body

          if (stream === null)
          {
            console.log("Stream is null")
            setIsLoadingSuggestedItems(_ => false)
            return
          }

          const reader = stream.getReader();

          const readChunk = () =>
          {
              reader.read()
                  .then(({value, done}) =>
                  {
                      if (done)
                      {
                          console.log("Stream finished")
                          setIsLoadingSuggestedItems(_ => false)
                          return
                      }

                      onProcessStreamedData(value, sourceEntityName, itemType)

                      // Read the next chunk
                      readChunk()
                  })
                  .catch(error =>
                  {
                    console.error(error);
                  });
          };
          // Start reading the first chunk
          readChunk();
      })
      .catch(error =>
      {
        console.error(error);
        setIsLoadingSuggestedItems(_ => false)
        alert("Error: request failed")
      });
    }


    const fetchSummary = (endpoint : string, headers : any, bodyData : any) =>
    {
      setIsLoadingSummary1(_ => true)

      fetch(endpoint, { method: "POST", headers, body: bodyData })
      .then(response =>
      {
          const stream = response.body; // Get the readable stream from the response body

          if (stream === null)
          {
            console.log("Stream is null")
            setIsLoadingSummary1(_ => false)
            return
          }

          const reader = stream.getReader();

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

                      readChunk(); // Read the next chunk
                  })
                  .catch(error =>
                  {
                    console.error(error);
                  });
          };
          readChunk(); // Start reading the first chunk
      })
      .catch(error =>
      {
        console.error(error);
        setIsLoadingSummary1(_ => false)
        alert("Error: request failed")
      });
    }

    const fetchSummaryDescriptions = (endpoint : string, headers : any, bodyData : any) =>
    {
      setIsLoadingSummaryDescriptions(_ => true)

      setSummaryDescriptions({entities: [], relationships: []})

      fetch(endpoint, { method: "POST", headers, body: bodyData })
      .then(response =>
      {
          const stream = response.body; // Get the readable stream from the response body

          if (stream === null)
          {
            console.log("Stream is null")
            setIsLoadingSummaryDescriptions(_ => false)
            return
          }

          const reader = stream.getReader();

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
                        console.log("Parsed data:", parsedData)

                        if (parsedData.hasOwnProperty("entity"))
                        {
                          setSummaryDescriptions(previousSummary => ({
                            ...previousSummary,
                            entities: [...previousSummary.entities, parsedData],
                          }));
                        }
                        else if (parsedData.hasOwnProperty("relationship"))
                        {
                          setSummaryDescriptions(previousSummary => ({
                            ...previousSummary,
                            relationships: [...previousSummary.relationships, parsedData],
                          }));
                        }
                        else
                        {
                          console.log("Received unknown object: ", parsedData)
                        }
                      }


                      readChunk();
                  })
                  .catch(error =>
                  {
                    console.error(error);
                  });
          };
          readChunk();
      })
      .catch(error =>
      {
        console.error(error);
        setIsLoadingSummaryDescriptions(_ => false)
        alert("Error: request failed")
      });
    }




    return { fetchSummary, fetchSummaryDescriptions, fetchStreamedData }
}

export default useFetchData