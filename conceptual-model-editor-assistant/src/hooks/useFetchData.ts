import { useState } from "react";
import { Field, Item, ItemType } from "../App";
import { parse } from "path";

const useFetchData = () =>
{
    // TODO: Insert here methods for fetching data
    // Probably this hook should receive function what to do on data receive

    const [regeneratedItem, setRegeneratedItem] = useState<Item>({ID: -1, type: ItemType.ENTITY, name: "", description: "", inference: "", inferenceIndexes: [], dataType: ""})
    const [isLoadingEdit, setIsLoadingEdit] = useState<boolean>(false)
    const [isLoadingSummary1, setIsLoadingSummary1] = useState<boolean>(false)
    const [fieldToLoad, setFieldToLoad] = useState<Field>(Field.ID)
    const [summaryText, setSummaryText] = useState<string>("")

    const fetchStreamedDataGeneral = (endpoint : string, headers : any, bodyData : any, attributeName : string, field: Field) =>
    {
        setIsLoadingEdit(_ => true)
        setFieldToLoad(field)

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

    const OnClearRegeneratedItem = (field: string, clearAll: boolean) =>
    {
      if (clearAll)
      {
        setRegeneratedItem({ID: -1, type: ItemType.ENTITY, name: "", description: "", inference: "", inferenceIndexes: [], dataType: ""})
      }

      if (field === Field.NAME)
      {
        setRegeneratedItem({...regeneratedItem, name: "" })
      }
      else if (field === Field.DESCRIPTION)
      {
        setRegeneratedItem({...regeneratedItem, description: "" })
      }
      else if (field === Field.INFERENCE)
      {
        setRegeneratedItem({...regeneratedItem, inference: "" })
      }
      else if (field === Field.DATA_TYPE)
      {
        setRegeneratedItem({...regeneratedItem, dataType: "" })
      }
      else if (field === Field.CARDINALITY)
      {
        setRegeneratedItem({...regeneratedItem, cardinality: "" })
      }
      else if (field === Field.SOURCE_ENTITY)
      {
        setRegeneratedItem({...regeneratedItem, source: "" })
      }
      else if (field === Field.TARGET_ENTITY)
      {
        setRegeneratedItem({...regeneratedItem, target: "" })
      }
    }

    return { isLoadingEdit, isLoadingSummary1, fieldToLoad, summaryText, regeneratedItem, OnClearRegeneratedItem, fetchStreamedDataGeneral, fetchSummary }
}

export default useFetchData