import { useRecoilState, useSetRecoilState } from "recoil"
import { HEADER, SUGGEST_ITEMS_URL } from "../definitions/urls"
import { createIRIFromName, onClearSuggestedItems } from "../utils/conceptualModel"
import { sidebarErrorMsgState } from "../atoms/sidebar"
import { itemTypesToLoadState, suggestedClassesState, suggestedAttributesState, suggestedAssociationsState } from "../atoms/suggestions"
import { Item, Attribute, Association } from "../definitions/conceptualModel"
import { ItemType, Field } from "../definitions/utility"


const useFetchSuggestedItems = () =>
{
    const [itemTypesToLoad, setItemTypesToLoad] = useRecoilState(itemTypesToLoadState)

    const setSuggestedClasses = useSetRecoilState(suggestedClassesState)
    const setSuggestedAttributes = useSetRecoilState(suggestedAttributesState)
    const setSuggestedAssociations = useSetRecoilState(suggestedAssociationsState)

    const setErrorMessage = useSetRecoilState(sidebarErrorMsgState)


    const fetchSuggestedItems = (bodyDataJSON: string, sourceClassName: string, itemType: ItemType) =>
    {
      setItemTypesToLoad(previousItems => [...previousItems, itemType])
      setErrorMessage("")

      const controller = new AbortController()
      const signal = controller.signal
      let isEmptyResponse = true
      
      fetch(SUGGEST_ITEMS_URL, { method: "POST", headers: HEADER, body: bodyDataJSON, signal: signal })
      .then(response =>
        {
          // Reset all suggested items
          onClearSuggestedItems(itemType, setSuggestedClasses, setSuggestedAttributes, setSuggestedAssociations)
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
                      parseSuggestedItem(value, sourceClassName, itemType)

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


  const parseSuggestedItem = (value: Uint8Array, sourceClassName: string, itemType: ItemType): void =>
  {
    // Convert the `value` to a string
    var jsonString = new TextDecoder().decode(value)

    // Handle situation when the `jsonString` contains more than one JSON object because of stream buffering
    const jsonStringParts = jsonString.split("\n").filter((string => string !== ""))

    for (let i = 0; i < jsonStringParts.length; i++)
    {
      let item : Item = JSON.parse(jsonStringParts[i])

      item[Field.IRI] = createIRIFromName(item[Field.NAME])
      item[Field.TYPE] = itemType

      if (itemType === ItemType.CLASS)
      {
        setSuggestedClasses(previousSuggestedItems => {
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

        setSuggestedAssociations(previousSuggestedItems => {
          return [...previousSuggestedItems, association]
        })
      }
    }
  }


  return { fetchSuggestedItems }
}

export default useFetchSuggestedItems