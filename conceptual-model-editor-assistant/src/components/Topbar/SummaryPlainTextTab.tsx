import { Typography, CircularProgress, Button, Tooltip, Stack } from "@mui/material"
import { useRecoilValue } from "recoil"
import { isLoadingSummaryPlainTextState, summaryTextState } from "../../atoms"
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';


const SummaryPlainTextTab: React.FC = (): JSX.Element =>
{
    const summary = useRecoilValue(summaryTextState)
    const isLoadingSummaryPlainText = useRecoilValue(isLoadingSummaryPlainTextState)


    return (
        <>
            <Typography>
                { summary }
                { isLoadingSummaryPlainText && <CircularProgress /> }
            </Typography>

            {
                summary !== "" &&
                <Stack direction="row" spacing={"8px"}>
                    <Tooltip
                        title="Like"
                        enterDelay={500}
                        leaveDelay={200}>

                        <Button
                            size={ "small" }
                            color="inherit"
                            sx={{ textTransform: "none", maxWidth: '30px', maxHeight: '30px', minWidth: '30px', minHeight: '30px' }}
                            // disabled={isClicked}
                            // onClick={ () => { handleSaveSuggestion(true) } }
                            >
                                <ThumbUpIcon sx={{ width: "20px", height: "20px" }}/>
                        </Button>
                    </Tooltip>

                    <Tooltip
                        title="Dislike"
                        enterDelay={500}
                        leaveDelay={200}>

                        <Button
                            color="inherit"
                            size={ "small" }
                            sx={{ textTransform: "none", maxWidth: '50px', maxHeight: '30px', minWidth: '30px', minHeight: '30px', paddingRight: "10px" }}
                            // disabled={isClicked}
                            // onClick={ () => { handleSaveSuggestion(true) } }
                            >
                                <ThumbDownIcon sx={{ width: "20px", height: "20px" }}/>
                        </Button>
                    </Tooltip>
                </Stack>
            }
        </>
    )
}

export default SummaryPlainTextTab