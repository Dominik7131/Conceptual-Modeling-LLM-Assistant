import { Stack, Button } from "@mui/material";
import { Association, Field, ItemType, UserChoice } from "../../interfaces/interfaces";
import AddIcon from "@mui/icons-material/Add";
import AutoFixNormalIcon from "@mui/icons-material/AutoFixNormal";
import { useSetRecoilState } from "recoil";
import { isShowEditDialogState, selectedSuggestedItemState, editedSuggestedItemState } from "../../atoms";
import useSuggestItems from "../../hooks/useSuggestItems";


interface Props
{
    association: Association
    sourceClassName: string
    targetClassName: string
    setIsOpened: any
}

const ControlButtons: React.FC<Props> = ({ association, setIsOpened, sourceClassName, targetClassName }): JSX.Element =>
{
    const setIsShowEditDialog = useSetRecoilState(isShowEditDialogState)

    const setSelectedSuggestedItem = useSetRecoilState(selectedSuggestedItemState)
    const setEditedSuggestedItem = useSetRecoilState(editedSuggestedItemState)
  
    const { onSuggestItems } = useSuggestItems()

    
    const handleManuallyAddNewAssociation = (isGeneralization: boolean): void =>
    {
        const itemType: ItemType = isGeneralization ? ItemType.GENERALIZATION : ItemType.ASSOCIATION
        const newObject = { ...association, [Field.TYPE]: itemType}
        setSelectedSuggestedItem(newObject)
        setEditedSuggestedItem(newObject)
    
        setIsShowEditDialog(true)
        setIsOpened(false)
    }
    

    return (
        <Stack direction="row" sx={{justifyContent:"space-around"}}>
            <Button
                startIcon={ <AddIcon/> }
                variant="outlined"
                sx={{textTransform: "none"}}
                onClick={() => { handleManuallyAddNewAssociation(false) } }
                >
                Create association manually
            </Button>

            <Button
                startIcon={ <AddIcon/> }
                variant="outlined"
                sx={{textTransform: "none"}}
                onClick={() => { handleManuallyAddNewAssociation(true) } }
                >
                Create generalization manually
            </Button>

            <Button
                startIcon={ <AutoFixNormalIcon/> }
                variant="outlined"
                sx={{textTransform: "none"}}
                onClick={() => { onSuggestItems(UserChoice.ASSOCIATIONS_TWO_KNOWN_CLASSES, sourceClassName, targetClassName); setIsOpened(false) } }
                >
                Suggest associations
            </Button>
            </Stack>
    )
}

export default ControlButtons