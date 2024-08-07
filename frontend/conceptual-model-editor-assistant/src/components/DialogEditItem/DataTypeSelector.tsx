import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import { useRecoilState, useSetRecoilState } from "recoil"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import { onClearRegeneratedItem, onItemEdit } from "../../utils/editItem"
import { Stack } from "@mui/material"
import Suggestion from "./Suggestion"
import { editedSuggestedItemState, regeneratedItemState } from "../../atoms/suggestions"
import { Attribute, DATA_TYPE_CHOICES } from "../../definitions/conceptualModel"
import { BLACK_COLOR, Field, GRAY_COLOR, ItemFieldUIName } from "../../definitions/utility"


interface Props
{
    attribute: Attribute
}

const DataTypeSelector: React.FC<Props> = ({ attribute }) =>
{
    const setEditedItem = useSetRecoilState(editedSuggestedItemState)
    const [regeneratedItem, setRegeneratedItem] = useRecoilState(regeneratedItemState)

    const regeneratedAttribute = regeneratedItem as Attribute

    const isRegeneratedText: boolean = regeneratedAttribute[Field.DATA_TYPE] !== undefined && regeneratedAttribute[Field.DATA_TYPE] !== ""
    const actualValue = isRegeneratedText ? regeneratedAttribute[Field.DATA_TYPE] : attribute[Field.DATA_TYPE] ?? ""

    const textColor = isRegeneratedText ? GRAY_COLOR : BLACK_COLOR


    const handleChange = (event: SelectChangeEvent) =>
    {
        // If user manually changed data type then cancel any suggested data type
        onClearRegeneratedItem(Field.DATA_TYPE, setRegeneratedItem)

        onItemEdit(Field.DATA_TYPE, event.target.value, setEditedItem)
    }


    return (
        <Stack direction="row">
            <FormControl fullWidth variant="standard">

                <InputLabel>
                    { ItemFieldUIName.DATA_TYPE }
                </InputLabel>

                <Select
                    value={ actualValue }
                    onChange={ handleChange }
                    sx={{ color: textColor }}
                >
                    { DATA_TYPE_CHOICES.map((dataType: string) => <MenuItem key={dataType} value={dataType}> {dataType} </MenuItem>) }
                </Select>
                
            </FormControl>

            <Suggestion item={attribute} field={Field.DATA_TYPE} isRegeneratedText={isRegeneratedText} isDisabledFieldSuggestion={false}/>
        </Stack>
    )
}

export default DataTypeSelector