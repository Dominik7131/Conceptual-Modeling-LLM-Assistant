import Box from '@mui/material/Box';
import { Divider } from "@mui/material";
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';
import { useRecoilValue } from "recoil";
import { sidebarWidthPercentageState, topbarTabValueState } from "../../atoms";
import SummaryDescriptions from "./SummaryDescriptions";
import SummaryPlainText from "./SummaryPlainText";
import TopbarButtons from "./ControlButtons";
import SettingsTab from "./SettingsTab";
import Tabs from "./Tabs";


const Topbar: React.FC = () =>
{
    const tabValue = useRecoilValue(topbarTabValueState)

    const sidebarWidthPercentage = useRecoilValue(sidebarWidthPercentageState)
    const topBarWidth = 100 - sidebarWidthPercentage
    const heightPx = 360


    return (
        <Box sx={{ width: `${topBarWidth}%`, height: `${heightPx}px`, overflow: 'auto', typography: 'body1' }}>

            <TabContext value={tabValue}>
                <Tabs/>

                <TabPanel value="0">
                    <TopbarButtons/>
                </TabPanel>

                <TabPanel value="1">
                    <SummaryPlainText/>
                </TabPanel>

                <TabPanel value="2">
                    <SummaryDescriptions/>                    
                </TabPanel>

                <TabPanel value="3">
                    <SettingsTab/>
                </TabPanel>
            </TabContext>

            <Divider
                sx={{bottom: "600px"}}
                absolute={true}>
            </Divider>

        </Box>
    )
}

export default Topbar