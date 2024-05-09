import Box from '@mui/material/Box';
import { Button, Divider } from "@mui/material";
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { isSidebarCollapsedState, sidebarWidthPercentageState, topbarHeightPxState, topbarTabValueState } from "../../atoms";
import SummaryDescriptionsTab from "./SummaryDescriptionsTab";
import SummaryPlainTextTab from "./SummaryPlainTextTab";
import TopbarButtons from "./ControlButtons";
import SettingsTab from "./SettingsTab";
import Tabs from "./Tabs";
import ImportTab from './ImportExportTab';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useState } from 'react';



const Topbar: React.FC = () =>
{
    const [isCollapsed, setIsCollapsed] = useState(false)
    const tabValue = useRecoilValue(topbarTabValueState)
    const [topbarHeightPx, setTopbarHeight] = useRecoilState(topbarHeightPxState)

    const [sidebarWidthPercentage, setSidebarWidthPercentage] = useRecoilState(sidebarWidthPercentageState)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(isSidebarCollapsedState)
    const [sidebarPreviousWidthPercentage, setSidebarPreviousWidthPercentage] = useState(0)

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

    const handleSidebarSize = () =>
    {
        if (isSidebarCollapsed)
        {
            setSidebarWidthPercentage(sidebarPreviousWidthPercentage)
        }
        else
        {
            setSidebarPreviousWidthPercentage(sidebarWidthPercentage)
            setSidebarWidthPercentage(0)
        }
        setIsSidebarCollapsed(previousValue => !previousValue)
    }


    return (
        <>
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
            </Box>

            <Button
                variant="contained"
                color="inherit"
                size="small"
                sx={{ position: "absolute", left:"40px", top: "10px", zIndex: 1}}
                onClick={ handleChangeSize }>
                    { isCollapsed ? <KeyboardArrowDownIcon/> : <KeyboardArrowUpIcon/> }
            </Button>

            <Button
                variant="contained"
                color="inherit"
                size="small"
                sx={{ position: "absolute", left:`120px`, top: "10px", zIndex: 1}}
                onClick={ handleSidebarSize }>
                    { isSidebarCollapsed ? <KeyboardArrowLeftIcon/> : <KeyboardArrowRightIcon/> }
            </Button>
        </>
    )
}

export default Topbar