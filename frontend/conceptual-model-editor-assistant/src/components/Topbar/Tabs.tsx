import { Box, Tab } from "@mui/material"
import { useSetRecoilState } from "recoil"
import { TabList } from "@mui/lab"
import { topbarTabValueState } from "../../atoms/topbar"
import { TopbarTab } from "../../definitions/tabs"
import { SUMMARY_PLAIN_TEXT_NAME, SUMMARY_DESCRIPTIONS_NAME } from "../../utils/summary"


const Tabs: React.FC = (): JSX.Element =>
{
    const setTabValue = useSetRecoilState(topbarTabValueState)

    const tabSX = { textTransform: "none" }


    const handleChange = (_: React.SyntheticEvent, newValue: TopbarTab) =>
    {
        setTabValue(newValue)
    }


    return (
        <Box sx={{ borderBottom: 1, borderColor: "divider", display: "flex", justifyContent:"center" }}>
            <TabList onChange={ handleChange }>
                <Tab sx={tabSX} label="Main" value={TopbarTab.MAIN} />
                <Tab sx={tabSX} label={SUMMARY_PLAIN_TEXT_NAME} value={TopbarTab.SUMMARY_PLAIN_TEXT} />
                <Tab sx={tabSX} label={SUMMARY_DESCRIPTIONS_NAME} value={TopbarTab.SUMMARY_DESCRIPTION} />
                <Tab sx={tabSX} label="Import & Export" value={TopbarTab.IMPORT_EXPORT} />
                <Tab sx={tabSX} label="Settings" value={TopbarTab.SETTINGS} />
                <Tab sx={tabSX} label="Report issue" value={TopbarTab.INFO} />
            </TabList>
        </Box>
    )
}

export default Tabs