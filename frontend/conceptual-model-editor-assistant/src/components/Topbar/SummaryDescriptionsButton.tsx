import { Button } from "@mui/material"
import AutoFixNormalIcon from "@mui/icons-material/AutoFixNormal"
import { useSetRecoilState } from "recoil"
import { UserChoiceSummary } from "../../definitions/utility"
import useFetchSummaryDescriptions from "../../hooks/useFetchSummaryDescriptions"
import { summaryDescriptionsState } from "../../atoms/summary"
import { SUMMARY_DESCRIPTIONS_NAME } from "../../utils/summary"
import { EMPTY_SUMMARY_CONCEPTUAL_MODEL } from "../../definitions/summary"
import useSummaryButtonClick from "../../hooks/useSummaryButtonClick"


const SummaryDescriptionsButton: React.FC= (): JSX.Element =>
{
    const setSummaryDescriptions = useSetRecoilState(summaryDescriptionsState)

    const { onButtonClick } = useSummaryButtonClick()
    const { fetchSummaryDescriptions } = useFetchSummaryDescriptions()

    
    const handleClick = (): void =>
    {
        setSummaryDescriptions(EMPTY_SUMMARY_CONCEPTUAL_MODEL)

        const userChoice = UserChoiceSummary.SUMMARY_DESCRIPTIONS
        const bodyDataJSON = onButtonClick(userChoice)
    
        fetchSummaryDescriptions(bodyDataJSON)
    }


    return (
        <Button
            variant="contained"
            sx={{textTransform: "none"}}
            disableElevation
            startIcon={<AutoFixNormalIcon/>}
            onClick={ handleClick }>
                { SUMMARY_DESCRIPTIONS_NAME }
        </Button>
    )
}

export default SummaryDescriptionsButton