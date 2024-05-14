import Stack from '@mui/material/Stack';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal';
import CircularProgress from '@mui/material/CircularProgress';
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { domainDescriptionSnapshotsState, domainDescriptionState, editDialogErrorMsgState, editedSuggestedItemState, fieldToLoadState, isIgnoreDomainDescriptionState, isShowEditDialogState, regeneratedItemState } from "../../atoms";
import { Association, Attribute, Field, Item, ItemType, UserChoice } from '../../interfaces';
import { onClearRegeneratedItem, onItemEdit } from '../../utils/editItem';
import { getSnapshotDomainDescription, snapshotDomainDescription } from '../../utils/snapshot';
import { HEADER, SAVE_SUGESTED_SINGLE_FIELD_URL, SUGGEST_SINGLE_FIELD_URL } from '../../utils/urls';
import { itemTypeToUserChoice } from '../../utils/utility';
import { useEffect, useRef } from 'react';


interface Props
{
    label: string
    field: Field
}

const EditField: React.FC<Props> = ({ label, field }) =>
{
    const [editedItem, setEditedItem] = useRecoilState(editedSuggestedItemState)
    const [regeneratedItem, setRegeneratedItem] = useRecoilState(regeneratedItemState)

    const domainDescription = useRecoilValue(domainDescriptionState)
    const isIgnoreDomainDescription = useRecoilValue(isIgnoreDomainDescriptionState)
    const [domainDescriptionSnapshot, setSnapshotDomainDescription] = useRecoilState(domainDescriptionSnapshotsState)
    
    const setFieldToLoad = useSetRecoilState(fieldToLoadState)

    const setErrorMessage = useSetRecoilState(editDialogErrorMsgState)

    const fieldToLoad = useRecoilValue(fieldToLoadState)

    const value = editedItem[field as keyof Item]

    let newValue : string | number[] = ""
    let isRegeneratedText : boolean = true
    let color : string = "gray"

    if (regeneratedItem.hasOwnProperty(field))
    {
        newValue = regeneratedItem[field as keyof Item]
    }

    if (!newValue)
    {
        if (value)
        {
            newValue = value
        }
        isRegeneratedText = false
    }

    if (!isRegeneratedText)
    {
        color = "black"
    }

    const isDisableOriginalTextSuggestion = field === Field.ORIGINAL_TEXT && (domainDescription === "" || isIgnoreDomainDescription)
    const isDisabledFieldSuggestion = field === Field.NAME || field === Field.SOURCE_CLASS || field === Field.TARGET_CLASS || isDisableOriginalTextSuggestion


    // When the component is unmounted clear the generated suggestion
    useEffect(() =>
    {
        return () => { onClearRegeneratedItem(field, setRegeneratedItem) }
    }, [])


    const saveSingleFieldSuggestion = (fieldName: string, fieldText: string, itemType: ItemType, sourceClass: string): void =>
    {
        // Save generated single field to backend
    
        const currentDomainDescription = getSnapshotDomainDescription(UserChoice.SINGLE_FIELD, domainDescriptionSnapshot)
        const userChoice = itemTypeToUserChoice(itemType)
    
        const suggestionData = {
            domainDescription: currentDomainDescription, fieldName: fieldName, fieldText: fieldText,
            userChoice: userChoice, sourceClass: sourceClass, isPositive: true
        }
    
        fetch(SAVE_SUGESTED_SINGLE_FIELD_URL, { method: 'POST', headers: HEADER, body: JSON.stringify(suggestionData)})
    }
    
        
    const onConfirmRegeneratedText = (field : Field) =>
    {
        let itemType = ItemType.CLASS
        let sourceClass = ""
    
        setEditedItem((editedItem: Item) =>
        {
            // Set type to "any" because Typescript doesn't recognise that we already did the check
            // Otherwise we need to write an if-statement for each field of type Item
            if (regeneratedItem.hasOwnProperty(field))
            {
                itemType = editedItem[Field.TYPE]
    
                if (itemType === ItemType.CLASS)
                {
                    sourceClass = editedItem[Field.NAME]
                }
                else
                {
                    sourceClass = (editedItem as Attribute)[Field.SOURCE_CLASS]
                }
    
                return {...editedItem, [field]: (regeneratedItem as any)[field]}
            }
            return editedItem
        })
    
        saveSingleFieldSuggestion(field, (regeneratedItem as any)[field], itemType, sourceClass)
    
        onClearRegeneratedItem(field, setRegeneratedItem)
    }
    
    
    const onGenerateField = (itemType: ItemType, name: string, sourceClass: string, targetClass: string, field: Field) =>
    {
        const currentDomainDescription = isIgnoreDomainDescription ? "" : domainDescription
        snapshotDomainDescription(UserChoice.SINGLE_FIELD, currentDomainDescription, setSnapshotDomainDescription)
    
        let userChoice = UserChoice.CLASSES
    
        if (itemType === ItemType.ATTRIBUTE)
        {
            userChoice = UserChoice.ATTRIBUTES 
        }
        else if (itemType === ItemType.ASSOCIATION)
        {
            userChoice = UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS
        }
    
        if (userChoice === UserChoice.CLASSES)
        {
            sourceClass = name
        }
    
        if (!sourceClass) { sourceClass = "" }
        if (!targetClass) { targetClass = "" }
    
        const bodyData = JSON.stringify({
            "name": name, "sourceClass": sourceClass, "targetClass": targetClass, "field": field, "userChoice": userChoice,
            "domainDescription": currentDomainDescription
        })
    
        setErrorMessage("")
        setFieldToLoad(fieldsToLoad => [...fieldsToLoad, field])
        fetchStreamedDataGeneral(bodyData, field)
    }
    
    // TODO: Put this fetch-function into a separate file
    const fetchStreamedDataGeneral = (bodyData: any, field: Field) =>
    {
        fetch(SUGGEST_SINGLE_FIELD_URL, { method: "POST", headers: HEADER, body: bodyData })
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
    
    
    function onProcessStreamedDataGeneral(value: any, field: Field): void
    {
        // Convert the `value` to a string
        var jsonString = new TextDecoder().decode(value)
        console.log(jsonString)
        console.log("\n")
    
        const parsedData = JSON.parse(jsonString)
        setRegeneratedItem((regeneratedItem) =>
        {
            return {...regeneratedItem, [field]: parsedData[field]}
        })
    }


    return (
        <Stack direction="row" spacing={4}>

                <TextField margin="dense" fullWidth variant="standard" spellCheck={false} label={label} multiline
                    sx={{'& textarea': {color: color} }}
                    onChange={(event) => onItemEdit(field, event.target.value, setEditedItem)}
                    value={newValue}
                />

                { !isRegeneratedText ?
                    ( (fieldToLoad.includes(field)) ? <CircularProgress sx={{position: "relative", right: "3px", top: "5px"}} size={"30px"} /> :
                    <IconButton disabled={isDisabledFieldSuggestion} color="primary" size="small" onClick={() => onGenerateField(editedItem[Field.TYPE], editedItem[Field.NAME], (editedItem as Association)[Field.SOURCE_CLASS], (editedItem as Association)[Field.TARGET_CLASS], field)}>
                        <AutoFixNormalIcon/>
                    </IconButton>)
                    :
                    <Stack direction="row">
                        <IconButton onClick={() => onConfirmRegeneratedText(field)}>
                            <CheckIcon color="success"/>
                        </IconButton>
                        <IconButton onClick={() => { onClearRegeneratedItem(field, setRegeneratedItem) }}>
                            <CloseIcon color="error"/>
                        </IconButton>
                    </Stack>
                }
        </Stack>
    )
}
    
export default EditField