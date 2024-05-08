import Box from '@mui/material/Box';
import { Button, Divider } from "@mui/material";
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { sidebarWidthPercentageState, topbarHeightPxState, topbarTabValueState } from "../../atoms";
import SummaryDescriptionsTab from "./SummaryDescriptionsTab";
import SummaryPlainTextTab from "./SummaryPlainTextTab";
import TopbarButtons from "./ControlButtons";
import SettingsTab from "./SettingsTab";
import Tabs from "./Tabs";
import ImportTab from './ImportExportTab';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState } from 'react';



const Topbar: React.FC = () =>
{
    const [isCollapsed, setIsCollapsed] = useState(false)
    const tabValue = useRecoilValue(topbarTabValueState)
    const [topbarHeightPx, setTopbarHeight] = useRecoilState(topbarHeightPxState)

    const sidebarWidthPercentage = useRecoilValue(sidebarWidthPercentageState)
    const topBarWidth = 100 - sidebarWidthPercentage

    const [previousHeightPx, setPreviousHeightPx] = useState(0)


    const handleChangeSize = () =>
    {
        if (isCollapsed)
        {
            setTopbarHeight(previousHeightPx)
        }
        else
        {
            setPreviousHeightPx(topbarHeightPx)
            setTopbarHeight(0)
        }
        setIsCollapsed(previousValue => !previousValue)
    }


    return (
        <Box sx={{ width: `${topBarWidth}%`, height: `${topbarHeightPx}px`, overflow: 'auto' }}>

            <TabContext value={tabValue}>
                
                <Tabs/>

                <TabPanel value="0">
                    <TopbarButtons/>
                </TabPanel>

                <TabPanel value="1">
                    <SummaryPlainTextTab/>
                </TabPanel>

                <TabPanel value="2">
                    <SummaryDescriptionsTab/>                    
                </TabPanel>

                <TabPanel value="3">
                    <ImportTab/>
                </TabPanel>

                <TabPanel value="4">
                    <SettingsTab/>
                </TabPanel>
            </TabContext>

            <Button
                variant="contained"
                color="inherit"
                size="small"
                sx={{ position: "absolute", left:`${topBarWidth / 2}px`, top: "10px", zIndex: 1}}
                onClick={handleChangeSize}>
                    { isCollapsed ? <ExpandMoreIcon/> : <ExpandLessIcon/> }
            </Button>
        </Box>
    )
}

export default Topbar