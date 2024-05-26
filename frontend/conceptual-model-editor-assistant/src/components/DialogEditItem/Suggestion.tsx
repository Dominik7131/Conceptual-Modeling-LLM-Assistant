import AutoFixNormalIcon from "@mui/icons-material/AutoFixNormal";
import { CircularProgress, IconButton, Stack } from "@mui/material"
import { Association, Field, Item } from "../../interfaces/interfaces"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { fieldToLoadState, regeneratedItemState } from "../../atoms"
import useGenerateSingleField from "../../hooks/useGenerateSingleField"
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import useConfirmRegeneratedField from "../../hooks/useConfirmRegeneratedField";
import { onClearRegeneratedItem } from "../../utils/editItem";
import { useEffect } from "react";


interface Props
{
    item: Item
    field: Field
    isRegeneratedText: boolean
    isDisabledFieldSuggestion: boolean
}


const Suggestion: React.FC<Props> = ({ item, field, isRegeneratedText, isDisabledFieldSuggestion }) =>
{
    const fieldToLoad = useRecoilValue(fieldToLoadState)
    const setRegeneratedItem = useSetRecoilState(regeneratedItemState)
    
    const { onGenerateField } = useGenerateSingleField()
    const { onConfirmRegeneratedText } = useConfirmRegeneratedField()


    const handleGenerateField = (): void =>
    {
        onGenerateField(item[Field.TYPE], item[Field.NAME], (item as Association)[Field.SOURCE_CLASS], (item as Association)[Field.TARGET_CLASS], field)
    }


    const handleSuggestionConfirmation = (): void =>
    {
        onConfirmRegeneratedText(field)
    }


    const handleSuggestionRejection = (): void =>
    {
        onClearRegeneratedItem(field, setRegeneratedItem)
    }


    // Clear the generated suggestion when the component is unmounted
    useEffect(() =>
    {
        return () => { onClearRegeneratedItem(field, setRegeneratedItem) }
    }, [])


    // Let user confirm or reject given suggestion
    if (isRegeneratedText)
    {
        return (
            <Stack direction="row">

                <IconButton onClick={ handleSuggestionConfirmation }>
                    <CheckIcon color="success"/>
                </IconButton>

                <IconButton onClick={ handleSuggestionRejection }>
                    <CloseIcon color="error"/>
                </IconButton>

            </Stack>
        )
    }


    const isShowLoadingIndicator = fieldToLoad.includes(field)
    if (isShowLoadingIndicator)
    {
        return (
            <CircularProgress sx={{ position: "relative", right: "3px", top: "5px" }} size={ "30px" } />
        )
    }


    // Show icon for generating new suggestion
    return (
        <IconButton
            disabled={isDisabledFieldSuggestion}
            color="primary"
            size="small"
            onClick={ handleGenerateField }>
                <AutoFixNormalIcon/>
        </IconButton>
    )
}

export default Suggestion