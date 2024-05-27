import { Typography, CircularProgress, Button, Tooltip, Stack } from "@mui/material"
import { useRecoilState, useRecoilValue } from "recoil"
import { conceptualModelSnapshotState, domainDescriptionSnapshotsState, isLoadingSummaryPlainTextState, isSummaryPlainTextReactButtonClickedState, summaryTextState } from "../../atoms"
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import { UserChoice } from "../../interfaces/interfaces";
import { TOOLTIP_ENTER_DELAY_MS, TOOLTIP_LEAVE_DELAY_MS, handleSaveSuggestionSummary } from "../../utils/utility";


const SummaryPlainTextTab: React.FC = (): JSX.Element =>
{
    const [isClicked, setIsClicked] = useRecoilState(isSummaryPlainTextReactButtonClickedState)
    
    const summary = useRecoilValue(summaryTextState)

    const isLoadingSummaryPlainText = useRecoilValue(isLoadingSummaryPlainTextState)
    const domainDescriptionSnapshot = useRecoilValue(domainDescriptionSnapshotsState)
    const conceptualModelSnapshot = useRecoilValue(conceptualModelSnapshotState)

    const reactionIconsColor = "inherit"
    const reactionIconsSize = "20px"
    const reactionButtonsMinSize = "30px"


    const handleSaveSuggestion = (isPositiveReaction: boolean) =>
    {
        const userChoice = UserChoice.SUMMARY_PLAIN_TEXT
        handleSaveSuggestionSummary(userChoice, isPositiveReaction, domainDescriptionSnapshot, conceptualModelSnapshot, summary)

        setIsClicked(true)
    }


    return (
        <>
            <Typography>
                { summary }
                { isLoadingSummaryPlainText && <CircularProgress /> }
            </Typography>

            {
                summary !== "" && !isLoadingSummaryPlainText &&
                <Stack direction="row" spacing={"8px"}>
                    <Tooltip
                        title="Like"
                        enterDelay={TOOLTIP_ENTER_DELAY_MS}
                        leaveDelay={TOOLTIP_LEAVE_DELAY_MS}>

                        <Button
                            size={ "small" }
                            color={ reactionIconsColor }
                            sx={{ minWidth: reactionButtonsMinSize, minHeight: reactionButtonsMinSize }}
                            disabled={ isClicked }
                            onClick={ () => { handleSaveSuggestion(true) } }
                            >
                                <ThumbUpIcon sx={{ width: reactionIconsSize, height: reactionIconsSize }}/>
                        </Button>
                    </Tooltip>

                    <Tooltip
                        title="Dislike"
                        enterDelay={TOOLTIP_ENTER_DELAY_MS}
                        leaveDelay={TOOLTIP_LEAVE_DELAY_MS}>

                        <Button
                            color={ reactionIconsColor }
                            size={ "small" }
                            sx={{ minWidth: reactionButtonsMinSize, minHeight: reactionButtonsMinSize }}
                            disabled={isClicked}
                            onClick={ () => { handleSaveSuggestion(false) } }
                            >
                                <ThumbDownIcon sx={{ width: reactionIconsSize, height: reactionIconsSize }}/>
                        </Button>
                    </Tooltip>
                </Stack>
            }
        </>
    )
}

export default SummaryPlainTextTab