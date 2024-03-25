import { useState } from "react";
import { Field, ItemType } from "../App";
import { parse } from "path";

const useFetchData = (onAttributeChange: (x : string, y: string, z: string) => void) =>
{
    // TODO: Insert here methods for fetching data
    // Probably this hook should receive function what to do on data receive

    const [regeneratedItem, setRegeneratedItem] = useState<Item>({ID: -1, type: ItemType.ENTITY, name: "", description: "", inference: "", inferenceIndexes: [], dataType: ""})
    const [isLoadingEdit, setIsLoadingEdit] = useState(false);
    const [text, setText] = useState<string>("");
    const [summaryText, setSummaryText] = useState<string>("");

    const fetchStreamedDataGeneral = (endpoint : string, headers : any, bodyData : any, attributeName : string, field: Field) =>
    {
        setIsLoadingEdit(_ => true)

        let result : string = ""

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

                        if (field === Field.NAME)
                        {
                          setRegeneratedItem({...regeneratedItem, name: parsedData[field]})
                        }
                        else if (field === Field.DESCRIPTION)
                        {
                          setRegeneratedItem({...regeneratedItem, description: parsedData[field]})
                        }
                        else if (field === Field.INFERENCE)
                        {
                          setRegeneratedItem({...regeneratedItem, inference: parsedData[field]})
                        }
                        else if (field === Field.DATA_TYPE)
                        {
                          setRegeneratedItem({...regeneratedItem, dataType: parsedData[field]})
                        }
                        else if (field === Field.CARDINALITY)
                        {
                          setRegeneratedItem({...regeneratedItem, cardinality: parsedData[field]})
                        }
                        else if (field === Field.SOURCE_ENTITY)
                        {
                          setRegeneratedItem({...regeneratedItem, source: parsedData[field]})
                        }
                        else if (field === Field.TARGET_ENTITY)
                        {
                          setRegeneratedItem({...regeneratedItem, target: parsedData[field]})
                        }
                        else
                        {
                          console.log("Unknown field", field)
                        }

                        readChunk(); 
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

        return result
    }


    const fetchSummary = (endpoint : string, headers : any, bodyData : any) =>
    {
        setIsLoadingEdit(_ => true)

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
          setIsLoadingEdit(_ => false)
          alert("Error: request failed")
        });
    }

    return { isLoadingEdit, text, summaryText, regeneratedItem, setRegeneratedItem, fetchStreamedDataGeneral, fetchSummary }
}

export default useFetchData