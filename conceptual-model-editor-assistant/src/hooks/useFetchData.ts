import { useState } from "react";
import { Field, Item, ItemType } from "../App";
import { parse } from "path";

const useFetchData = () =>
{
    // TODO: Insert here methods for fetching data
    // Probably this hook should receive function what to do on data receive

    const [isLoadingSummary1, setIsLoadingSummary1] = useState<boolean>(false)
    const [summaryText, setSummaryText] = useState<string>("")

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

    return { isLoadingSummary1, summaryText, fetchSummary }
}

export default useFetchData