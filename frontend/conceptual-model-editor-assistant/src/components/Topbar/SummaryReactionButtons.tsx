import { Button, Stack, Tooltip } from "@mui/material"
import ThumbUpIcon from "@mui/icons-material/ThumbUp"
import ThumbDownIcon from "@mui/icons-material/ThumbDown"
import { useRecoilValue } from "recoil"
import { domainDescriptionSnapshotsState, conceptualModelSnapshotState, summaryStyleSnapshotState } from "../../atoms/snapshots"
import { SummaryConceptualModel } from "../../definitions/summary"
import { TOOLTIP_ENTER_DELAY_MS, TOOLTIP_LEAVE_DELAY_MS, UserChoiceSummary } from "../../definitions/utility"
import { handleSaveSuggestionSummary } from "../../utils/summary"
import { useState } from "react"


interface Props
{
    userChoice: UserChoiceSummary
    summary: string | SummaryConceptualModel
}

const SummaryReactionButtons: React.FC<Props> = ({ userChoice, summary }): JSX.Element =>
{
    const [isReactionButtonClicked, setIsReactionButtonClicked] = useState(false)
    const domainDescriptionSnapshot = useRecoilValue(domainDescriptionSnapshotsState)
    const conceptualModelSnapshot = useRecoilValue(conceptualModelSnapshotState)
    const summaryStyleSnapshot = useRecoilValue(summaryStyleSnapshotState)

    const reactionIconsColor = "inherit"
    const reactionIconsSize = "20px"
    const reactionButtonsMinSize = "30px"


    const handleSaveSuggestion = (isPositiveReaction: boolean) =>
    {
        handleSaveSuggestionSummary(userChoice, isPositiveReaction, domainDescriptionSnapshot, conceptualModelSnapshot, summaryStyleSnapshot, summary)
        setIsReactionButtonClicked(true)
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
                    disabled={ isReactionButtonClicked }
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
                    disabled={ isReactionButtonClicked }
                    onClick={ () => { handleSaveSuggestion(false) } }
                    >
                        <ThumbDownIcon sx={{ width: reactionIconsSize, height: reactionIconsSize }}/>
                </Button>
            </Tooltip>
        </Stack>
    )
}

export default SummaryReactionButtons