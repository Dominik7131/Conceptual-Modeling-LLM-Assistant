import { useRecoilValue, useSetRecoilState } from "recoil"
import { Field, ItemType, UserChoiceSingleField, UserChoiceItem } from "../definitions/utility"
import { snapshotDomainDescription, snapshotTextFilteringVariation } from "../utils/snapshot"
import { HEADER, SUGGEST_SINGLE_FIELD_URL } from "../definitions/urls"
import { SingleFieldSuggestionBody } from "../definitions/fetch"
import { editDialogErrorMsgState } from "../atoms/dialogs"
import { domainDescriptionState, isIgnoreDomainDescriptionState } from "../atoms/domainDescription"
import { regeneratedOriginalTextIndexesState } from "../atoms/originalTextIndexes"
import { domainDescriptionSnapshotsState, textFilteringVariationSnapshotsState } from "../atoms/snapshots"
import { regeneratedItemState, fieldToLoadState } from "../atoms/suggestions"
import { textFilteringVariationState } from "../atoms/textFiltering"
import { itemTypeToUserChoice } from "../utils/utility"


const useGenerateSingleField = () =>
{
    const domainDescription = useRecoilValue(domainDescriptionState)
    const isIgnoreDomainDescription = useRecoilValue(isIgnoreDomainDescriptionState)
    const textFilteringVariation = useRecoilValue(textFilteringVariationState)

    const setRegeneratedItem = useSetRecoilState(regeneratedItemState)
    const setSnapshotDomainDescription = useSetRecoilState(domainDescriptionSnapshotsState)
    const setSnapshotTextFilteringVariation = useSetRecoilState(textFilteringVariationSnapshotsState)
    const setRegeneratedOriginalTextIndexes = useSetRecoilState(regeneratedOriginalTextIndexesState)

    const setFieldToLoad = useSetRecoilState(fieldToLoadState)

    const setErrorMessage = useSetRecoilState(editDialogErrorMsgState)
    

    const onGenerateField = (itemType: ItemType, name: string, description: string, originalText: string, sourceClass: string, targetClass: string, field: Field) =>
    {
        let currentDomainDescription = isIgnoreDomainDescription ? "" : domainDescription

        const isDisableDomainDescription = field === Field.NAME
        if (isDisableDomainDescription)
        {
            currentDomainDescription = ""
        }

        snapshotDomainDescription(UserChoiceSingleField.SINGLE_FIELD, currentDomainDescription, setSnapshotDomainDescription)
        snapshotTextFilteringVariation(UserChoiceSingleField.SINGLE_FIELD, textFilteringVariation, setSnapshotTextFilteringVariation)
    
        const userChoice = itemTypeToUserChoice(itemType)
    
        if (userChoice === UserChoiceItem.CLASSES)
        {
            sourceClass = name
        }

        const bodyData: SingleFieldSuggestionBody = {
            name: name, description: description, originalText: originalText, sourceClass: sourceClass, targetClass: targetClass,
            field: field, userChoice: userChoice, domainDescription: currentDomainDescription,
            textFilteringVariation: textFilteringVariation
        }

        const bodyDataJSON = JSON.stringify(bodyData)
    
        setErrorMessage("")
        setFieldToLoad(fieldsToLoad => [...fieldsToLoad, field])
        fetchStreamedDataGeneral(bodyDataJSON, field)
    }


    const fetchStreamedDataGeneral = (bodyDataJSON: string, field: Field) =>
    {
        fetch(SUGGEST_SINGLE_FIELD_URL, { method: "POST", headers: HEADER, body: bodyDataJSON })
        .then(response =>
        {
            const stream = response.body; // Get the readable stream from the response body
    
            if (stream === null)
            {
                console.log("Stream is null")
                setFieldToLoad(fields => fields.filter(currentField => currentField !== field))
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
                            setFieldToLoad(fields => fields.filter(currentField => currentField !== field))
                            return
                        }

                        onProcessStreamedDataGeneral(value, field)
                        
                        readChunk()
                    })
                    .catch(error =>
                    {
                        console.error(error)
                        setFieldToLoad(fields => fields.filter(currentField => currentField !== field))
                    })
            }
            readChunk() // Start reading the first chunk
        })
        .catch(error =>
        {
            console.error(error)
            const message = "Server is not responding"
            setErrorMessage(message)
            setFieldToLoad(fields => fields.filter(currentField => currentField !== field))
        })
    }
    
    
    const onProcessStreamedDataGeneral = (value: Uint8Array, field: Field): void =>
    {
        const jsonString = new TextDecoder().decode(value)
    
        const parsedData = JSON.parse(jsonString)
        setRegeneratedItem((regeneratedItem) =>
        {
            return { ...regeneratedItem, [field]: parsedData[field] }
        })

        if (field === Field.ORIGINAL_TEXT)
        {
            const originalTextIndexes = parsedData[Field.ORIGINAL_TEXT_INDEXES]
            setRegeneratedOriginalTextIndexes(originalTextIndexes)
        }
    }

    return { onGenerateField }
}

export default useGenerateSingleField