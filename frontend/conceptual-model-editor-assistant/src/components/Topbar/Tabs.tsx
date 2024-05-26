import { Box, Button, Tab } from "@mui/material"
import { topbarTabValueState } from "../../atoms"
import { useSetRecoilState } from "recoil"
import { TabList } from "@mui/lab"
import { SUMMARY_DESCRIPTIONS_NAME, SUMMARY_PLAIN_TEXT_NAME } from "../../utils/utility"
import { TopbarTab } from "../../interfaces/interfaces"


const Tabs: React.FC = (): JSX.Element =>
{
    const setTabValue = useSetRecoilState(topbarTabValueState)


    const handleChange = (event: React.SyntheticEvent, newValue: TopbarTab) =>
    {
        setTabValue(newValue)
    }


    return (
        <Box sx={{ borderBottom: 1, borderColor: "divider", display: "flex", justifyContent:"center" }}>
            <TabList onChange={ handleChange }>
                <Tab sx={{textTransform: "none"}} label="Main" value={TopbarTab.MAIN} />
                <Tab sx={{textTransform: "none"}} label={SUMMARY_PLAIN_TEXT_NAME} value={TopbarTab.SUMMARY_PLAIN_TEXT} />
                <Tab sx={{textTransform: "none"}} label={SUMMARY_DESCRIPTIONS_NAME} value={TopbarTab.SUMMARY_DESCRIPTION} />
                <Tab sx={{textTransform: "none"}} label="Import & Export" value={TopbarTab.IMPORT_EXPORT} />
                <Tab sx={{textTransform: "none"}} label="Settings" value={TopbarTab.SETTINGS} />
                <Tab sx={{textTransform: "none"}} label="Report issue" value={TopbarTab.INFO} />
            </TabList>
        </Box>
    )
}

export default Tabs