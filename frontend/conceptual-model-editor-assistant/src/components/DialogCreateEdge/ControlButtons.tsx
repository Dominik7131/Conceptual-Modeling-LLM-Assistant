import { Stack, Button } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import AutoFixNormalIcon from "@mui/icons-material/AutoFixNormal"
import { useSetRecoilState } from "recoil"
import useSuggestItems from "../../hooks/useSuggestItems"
import { isShowCreateEdgeDialogState, isShowEditDialogState } from "../../atoms/dialogs"
import { selectedSuggestedItemState, editedSuggestedItemState } from "../../atoms/suggestions"
import { Association } from "../../definitions/conceptualModel"
import { ItemType, Field, UserChoiceItem } from "../../definitions/utility"


interface Props
{
    association: Association
    sourceClassName: string
    targetClassName: string
}

const ControlButtons: React.FC<Props> = ({ association, sourceClassName, targetClassName }): JSX.Element =>
{
    const setIsOpened = useSetRecoilState(isShowCreateEdgeDialogState)
    const setIsShowEditDialog = useSetRecoilState(isShowEditDialogState)

    const setSelectedSuggestedItem = useSetRecoilState(selectedSuggestedItemState)
    const setEditedSuggestedItem = useSetRecoilState(editedSuggestedItemState)
  
    const { onSuggestItems } = useSuggestItems()

    const buttonVariation = "outlined"
    const textTransform = "none"

    const createAssociationManuallyText = "Create association manually"
    const createGeneralizationManuallyText = "Create generalization manually"
    const suggestAssociationsText = "Suggest associations"


    const handleClose = (): void =>
    {
        setIsOpened(false)
    }


    const handleManuallyAddNewAssociation = (isGeneralization: boolean): void =>
    {
        const itemType: ItemType = isGeneralization ? ItemType.GENERALIZATION : ItemType.ASSOCIATION
        const newObject = { ...association, [Field.TYPE]: itemType}
        setSelectedSuggestedItem(newObject)
        setEditedSuggestedItem(newObject)
    
        setIsShowEditDialog(true)
        handleClose()
    }


    const handleSuggestAssociations = (): void =>
    {
        onSuggestItems(UserChoiceItem.ASSOCIATIONS_TWO_KNOWN_CLASSES, sourceClassName, targetClassName)
        handleClose()
    }
    

    return (
        <Stack direction="row" sx={{ justifyContent:"space-around" }}>

            <Button
                startIcon={ <AddIcon/> }
                variant={ buttonVariation }
                sx={{ textTransform: "none" }}
                onClick={() => { handleManuallyAddNewAssociation(false) } }
                >
                    { createAssociationManuallyText }
            </Button>

            <Button
                startIcon={ <AddIcon/> }
                variant={ buttonVariation }
                sx={{ textTransform: textTransform }}
                onClick={() => { handleManuallyAddNewAssociation(true) } }
                >
                    { createGeneralizationManuallyText }
            </Button>

            <Button
                startIcon={ <AutoFixNormalIcon/> }
                variant={ buttonVariation }
                sx={{ textTransform: textTransform }}
                onClick={ handleSuggestAssociations }
                >
                    { suggestAssociationsText }
            </Button>

        </Stack>
    )
}

export default ControlButtons