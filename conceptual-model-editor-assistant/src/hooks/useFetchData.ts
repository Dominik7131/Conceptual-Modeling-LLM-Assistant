import { useState } from "react";
import { Field, Item, ItemType, summaryObject } from "../interfaces";
import { parse } from "path";


const useFetchData = () =>
{
    // TODO: Insert here methods for fetching data
    // Probably this hook should receive function what to do on data receive

    const [isLoadingSummary1, setIsLoadingSummary1] = useState<boolean>(false)
    const [isLoadingSummaryDescriptions, setIsLoadingSummaryDescriptions] = useState<boolean>(false)
    const [summaryText, setSummaryText] = useState<string>("")

    // TODO: This object should contain descriptions for "entities": array of entities and "relationships": array of relationships
    const [summaryDescriptions, setSummaryDescriptions] = useState<summaryObject>({ entities: [], relationships: []})

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

    return { isLoadingSummary1, isLoadingSummaryDescriptions, summaryText, summaryDescriptions, fetchSummary, fetchSummaryDescriptions }
}

export default useFetchData