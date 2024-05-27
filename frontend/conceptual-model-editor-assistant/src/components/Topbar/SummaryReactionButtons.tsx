import { Button, Stack, Tooltip } from "@mui/material"
import { TOOLTIP_ENTER_DELAY_MS, TOOLTIP_LEAVE_DELAY_MS, handleSaveSuggestionSummary } from "../../utils/utility"
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import { SummaryDescriptionsObject, UserChoice } from "../../interfaces/interfaces";
import { useRecoilState, useRecoilValue } from "recoil";
import { domainDescriptionSnapshotsState, conceptualModelSnapshotState, isSummaryReactionButtonClickedState } from "../../atoms";


interface Props
{
    userChoice: UserChoice.SUMMARY_PLAIN_TEXT | UserChoice.SUMMARY_DESCRIPTIONS
    summary: string | SummaryDescriptionsObject
}

const SummaryReactionButtons: React.FC<Props> = ({ userChoice, summary }): JSX.Element =>
{
    const [isClickedSummary, setIsClickedSummary] = useRecoilState(isSummaryReactionButtonClickedState)
    const domainDescriptionSnapshot = useRecoilValue(domainDescriptionSnapshotsState)
    const conceptualModelSnapshot = useRecoilValue(conceptualModelSnapshotState)

    const isClicked = isClickedSummary[userChoice]

    const reactionIconsColor = "inherit"
    const reactionIconsSize = "20px"
    const reactionButtonsMinSize = "30px"


    const handleSaveSuggestion = (isPositiveReaction: boolean) =>
    {
        handleSaveSuggestionSummary(userChoice, isPositiveReaction, domainDescriptionSnapshot, conceptualModelSnapshot, summary)
        setIsClickedSummary(previousValue => { return { ...previousValue, [userChoice]: true } })
    }


    return (
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
                    disabled={ isClicked }
                    onClick={ () => { handleSaveSuggestion(false) } }
                    >
                        <ThumbDownIcon sx={{ width: reactionIconsSize, height: reactionIconsSize }}/>
                </Button>
            </Tooltip>
        </Stack>
    )
}

export default SummaryReactionButtons