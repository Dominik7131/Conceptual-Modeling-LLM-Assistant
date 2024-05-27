import { Typography, CircularProgress } from "@mui/material"
import { useRecoilValue } from "recoil"
import { UserChoice } from "../../interfaces/interfaces";
import SummaryReactionButtons from "./SummaryReactionButtons";
import { isLoadingSummaryPlainTextState } from "../../atoms/loadings";
import { summaryTextState } from "../../atoms/summary";


const SummaryPlainTextTab: React.FC = (): JSX.Element =>
{  
    const summary = useRecoilValue(summaryTextState)
    const isLoading = useRecoilValue(isLoadingSummaryPlainTextState)

    const isShowReactionButtons = summary !== "" && !isLoading


    return (
        <>
            <Typography>
                { summary }
                { isLoading && <CircularProgress /> }
            </Typography>

            {
                isShowReactionButtons &&
                <SummaryReactionButtons userChoice={UserChoice.SUMMARY_PLAIN_TEXT} summary={summary} />
            }
        </>
    )
}

export default SummaryPlainTextTab