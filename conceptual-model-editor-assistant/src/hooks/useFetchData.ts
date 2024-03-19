import { useState } from "react";

const useFetchData = (onAttributeChange: (x : string, y: string, z: string) => void) =>
{
    // TODO: Insert here methods for fetching data
    // Probably this hook should receive function what to do on data receive

    const [descriptionData, setDescriptionData] = useState<string>("");
    const [isLoadingEdit, setIsLoadingEdit] = useState(false);

    const use_fetch_streamed_data_general = (endpoint : string, headers : any, bodyData : any, attributeName : string, field: string) =>
    {
        setIsLoadingEdit(_ => true)

        // Fetch the event stream from the server
        // Code from: https://medium.com/@bs903944/event-streaming-made-easy-with-event-stream-and-javascript-fetch-8d07754a4bed
        fetch(endpoint, { method: "POST", headers, body: bodyData })
        .then(response =>
        {
            const stream = response.body; // Get the readable stream from the response body

            if (stream === null)
            {
              console.log("Stream is null")
              setIsLoadingEdit(_ => false)
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
                            setIsLoadingEdit(_ => false)
                            return
                        }

                        // Convert the `value` to a string
                        var jsonString = new TextDecoder().decode(value)
                        console.log(jsonString)
                        console.log("\n")

                        const parsedData = JSON.parse(jsonString)
                        setDescriptionData(parsedData[field])
                        onAttributeChange(attributeName, parsedData[field], field)

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
          setIsLoadingEdit(_ => false)
          alert("Error: request failed")
        });
    }

    return { isLoadingEdit, descriptionData, use_fetch_streamed_data_general }
}

export default useFetchData