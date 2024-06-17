import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import { useRecoilState, useRecoilValue } from "recoil"
import { BLACK_COLOR, Field, GRAY_COLOR } from "../../definitions/utility"
import { onItemEdit } from "../../utils/editItem"
import Suggestion from "./Suggestion"
import { editedSuggestedItemState, regeneratedItemState } from "../../atoms/suggestions"
import { domainDescriptionState, isIgnoreDomainDescriptionState } from "../../atoms/domainDescription"
import { Item } from "../../definitions/conceptualModel"


interface Props
{
    label: string
    field: Field
}

const EditField: React.FC<Props> = ({ label, field }) =>
{
    const [editedItem, setEditedItem] = useRecoilState(editedSuggestedItemState)
    const regeneratedItem = useRecoilValue(regeneratedItemState)

    const domainDescription = useRecoilValue(domainDescriptionState)
    const isIgnoreDomainDescription = useRecoilValue(isIgnoreDomainDescriptionState)
    

    const currentText = editedItem[field as keyof Item]

    let newText : string | number[] = ""
    let isRegeneratedText : boolean = true
    let textColor : string = GRAY_COLOR

    if (regeneratedItem.hasOwnProperty(field))
    {
        newText = regeneratedItem[field as keyof Item]
    }

    if (!newText)
    {
        if (currentText)
        {
            newText = currentText
        }
        isRegeneratedText = false
    }

    if (!isRegeneratedText)
    {
        textColor = BLACK_COLOR
    }

    const isDisableOriginalTextSuggestion = field === Field.ORIGINAL_TEXT && (domainDescription === "" || isIgnoreDomainDescription)

    let isDisableFieldName = false

    if (field === Field.NAME)
    {
        const description = editedItem[Field.DESCRIPTION] ?? ""
        const originalText = editedItem[Field.ORIGINAL_TEXT] ?? ""
        const isNotEnoughInfoToGenerateName: boolean = description === "" && originalText === ""

        isDisableFieldName = field === Field.NAME && isNotEnoughInfoToGenerateName
    }

    const isDisabledFieldSuggestion = isDisableFieldName || field === Field.SOURCE_CLASS || field === Field.TARGET_CLASS || isDisableOriginalTextSuggestion


    return (
        <Stack direction="row" spacing={4}>

            <TextField margin="dense" fullWidth variant="standard" spellCheck={false} label={label} multiline
                sx={{"& textarea": { color: textColor } }}
                onChange={(event) => onItemEdit(field, event.target.value, setEditedItem)}
                value={newText}
            />

            <Suggestion item={editedItem} field={field} isRegeneratedText={isRegeneratedText} isDisabledFieldSuggestion={isDisabledFieldSuggestion}/>

        </Stack>
    )
}
    
export default EditField