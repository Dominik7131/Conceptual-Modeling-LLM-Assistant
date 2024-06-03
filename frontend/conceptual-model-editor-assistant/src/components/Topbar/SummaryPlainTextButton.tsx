import { Button } from "@mui/material"
import AutoFixNormalIcon from "@mui/icons-material/AutoFixNormal"
import { useSetRecoilState } from "recoil"
import useFetchSummaryPlainText from "../../hooks/useFetchSummaryPlainText"
import { summaryTextState } from "../../atoms/summary"
import { UserChoiceSummary } from "../../definitions/utility"
import { SUMMARY_PLAIN_TEXT_NAME } from "../../utils/summary"
import useSummaryButtonClick from "../../hooks/useSummaryButtonClick"


const SummaryPlainTextButton: React.FC= (): JSX.Element =>
{
    const setSummaryText = useSetRecoilState(summaryTextState)

    const { onButtonClick } = useSummaryButtonClick()
    const { fetchSummaryPlainText } = useFetchSummaryPlainText()

    
    const handleClick = (): void =>
    {
        setSummaryText("")

        const userChoice = UserChoiceSummary.SUMMARY_PLAIN_TEXT
        const bodyDataJSON = onButtonClick(userChoice)
        fetchSummaryPlainText(bodyDataJSON)
    }


    return (
        <Button
            variant="contained"
            sx={{ textTransform: "none" }}
            disableElevation
            startIcon={ <AutoFixNormalIcon/> }
            onClick={ handleClick }>
                { SUMMARY_PLAIN_TEXT_NAME }
        </Button>
    )
}

export default SummaryPlainTextButton