import { Typography, CircularProgress } from "@mui/material"
import { useRecoilValue } from "recoil"
import { isLoadingSummaryPlainTextState, summaryTextState } from "../../atoms"


const SummaryPlainTextTab: React.FC = (): JSX.Element =>
{
    const summary = useRecoilValue(summaryTextState)
    const isLoadingSummaryPlainText = useRecoilValue(isLoadingSummaryPlainTextState)


    return (
        <Typography>
            { summary }
            { isLoadingSummaryPlainText && <CircularProgress /> }
        </Typography>
    )
}

export default SummaryPlainTextTab