import { Box, Button, Tab } from "@mui/material"
import { useSetRecoilState } from "recoil"
import { TabList } from "@mui/lab"
import { SUMMARY_DESCRIPTIONS_NAME, SUMMARY_PLAIN_TEXT_NAME } from "../../utils/utility"
import { TopbarTab } from "../../interfaces/interfaces"
import { topbarTabValueState } from "../../atoms/topbar"


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