import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useRecoilValue } from "recoil";
import { Field } from "../../interfaces/interfaces";
import { isShowTitleDialogDomainDescriptionState } from "../../atoms/dialogs";
import { isLoadingHighlightOriginalTextState } from "../../atoms/loadings";
import { originalTextIndexesListState } from "../../atoms/originalTextIndexes";
import { selectedSuggestedItemState } from "../../atoms/suggestions";


const Title: React.FC = (): JSX.Element =>
{
    const originalTextIndexes = useRecoilValue(originalTextIndexesListState)
    const isLoading = useRecoilValue(isLoadingHighlightOriginalTextState)
    const selectedItem = useRecoilValue(selectedSuggestedItemState)
    const isShowTitleDialogDomainDescription = useRecoilValue(isShowTitleDialogDomainDescriptionState)

    const isOriginalTextIndexesEmpty = originalTextIndexes.length === 0

    const emptyOriginalTextIndexesText = "Unable to find original text in domain description"
    const highlightingSelectedItemsText = "Highlighting selected items in domain description"

    
    return (
        <DialogTitle>
            <Stack spacing={2}>

            {
                isLoading &&
                <Alert variant="outlined" severity="info">

                <Box display="flex" overflow="hidden">
                    <Box mr={1}> Updating </Box>
                    <CircularProgress size={20} />
                </Box>

                </Alert>
            }

            { isOriginalTextIndexesEmpty && !isLoading &&
                <Alert variant="outlined" severity="warning">
                { emptyOriginalTextIndexesText }
                </Alert>
            }

            {  isShowTitleDialogDomainDescription ?
                <Typography variant="h5"> Selected { selectedItem[Field.TYPE] }: <strong>{ selectedItem[Field.NAME] }</strong> </Typography>
                : <Typography variant="h5"> { highlightingSelectedItemsText } </Typography>
            }

            </Stack>
        </DialogTitle>
    )
}

export default Title