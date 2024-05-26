import Stack from "@mui/material/Stack";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import AutoFixNormalIcon from "@mui/icons-material/AutoFixNormal";
import CircularProgress from "@mui/material/CircularProgress";
import { useRecoilState, useRecoilValue } from "recoil";
import { domainDescriptionState, editedSuggestedItemState, fieldToLoadState, isIgnoreDomainDescriptionState, regeneratedItemState } from "../../atoms";
import { Association, Field, Item } from "../../interfaces/interfaces";
import { onClearRegeneratedItem, onItemEdit } from "../../utils/editItem";
import { useEffect } from "react";
import useGenerateSingleField from "../../hooks/useGenerateSingleField";
import useConfirmRegeneratedField from "../../hooks/useConfirmRegeneratedField";
import { BLACK_COLOR, GRAY_COLOR } from "../../utils/utility";
import Suggestion from "./Suggestion";


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
    const isDisabledFieldSuggestion = field === Field.NAME || field === Field.SOURCE_CLASS || field === Field.TARGET_CLASS || isDisableOriginalTextSuggestion


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