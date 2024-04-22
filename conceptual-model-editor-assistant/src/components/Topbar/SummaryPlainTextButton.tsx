import { Button } from "@mui/material"
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { SUMMARY_PLAIN_TEXT_NAME, convertConceptualModelToJSON } from "../../hooks/useUtility";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { domainDescriptionState, isIgnoreDomainDescriptionState, selectedEdgesState, selectedNodesState, topbarTabValueState } from "../../atoms";
import { TopbarTabs } from "../../interfaces";
import useFetchData from "../../hooks/useFetchData";


const SummaryPlainTextButton: React.FC= (): JSX.Element =>
{
    const selectedNodes = useRecoilValue(selectedNodesState)
    const selectedEdges = useRecoilValue(selectedEdgesState)

    const setTopbarTab = useSetRecoilState(topbarTabValueState)

    const domainDescription = useRecoilValue(domainDescriptionState)
    const isIgnoreDomainDescription = useRecoilValue(isIgnoreDomainDescriptionState)

    const { fetchSummaryPlainText } = useFetchData()

    
    const handleSummaryPlainTextClick = (): void =>
    {
        if (selectedNodes.length === 0 && selectedEdges.length === 0)
        {
            alert("Nothing was selected")
            return
        }

        const currentDomainDescription = isIgnoreDomainDescription ? "" : domainDescription

        setTopbarTab(TopbarTabs.SUMMARY_PLAIN_TEXT)

        const conceptualModel = convertConceptualModelToJSON(selectedNodes, selectedEdges, false)
        const bodyData = JSON.stringify({"conceptualModel": conceptualModel, "domainDescription": currentDomainDescription})

        fetchSummaryPlainText(bodyData)
    }


    return (
        <Button
            variant="contained"
            sx={{textTransform: "none"}}
            disableElevation
            startIcon={<AutoFixHighIcon/>}
            onClick={ handleSummaryPlainTextClick }>
                { SUMMARY_PLAIN_TEXT_NAME }
        </Button>
    )
}

export default SummaryPlainTextButton