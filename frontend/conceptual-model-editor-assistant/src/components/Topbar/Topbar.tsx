import Box from "@mui/material/Box";
import { Button } from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import { useRecoilState, useRecoilValue } from "recoil";
import SummaryDescriptionsTab from "./SummaryDescriptionsTab";
import SummaryPlainTextTab from "./SummaryPlainTextTab";
import TopbarButtons from "./ControlButtons";
import SettingsTab from "./SettingsTab";
import Tabs from "./Tabs";
import ImportTab from "./ImportExportTab";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useState } from "react";
import InfoTab from "./InfoTab";
import { topbarTabValueState } from "../../atoms/topbar";
import { isSidebarCollapsedState } from "../../atoms/sidebar";
import { CustomTabPanel } from "../CustomElements/CustomTabPanel";


const Topbar: React.FC = (): JSX.Element =>
{
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(isSidebarCollapsedState)
    const tabValue = useRecoilValue(topbarTabValueState)

    const flexValue = isCollapsed ? 0 : 1

    
    const handleChangeSize = () =>
    {
        setIsCollapsed(previousValue => !previousValue)
    }

    const handleSidebarSize = () =>
    {
        setIsSidebarCollapsed(previousValue => !previousValue)
    }


    return (
        <Box sx={{ flex: flexValue }}>

            { !isCollapsed &&
                <Box sx={{ overflow: "auto" }}>
                    <TabContext value={tabValue}>
                        
                        <Tabs/>

                        <CustomTabPanel value="0">
                            <TopbarButtons/>
                        </CustomTabPanel>

                        <CustomTabPanel value="1">
                            <SummaryPlainTextTab/>
                        </CustomTabPanel>

                        <CustomTabPanel value="2">
                            <SummaryDescriptionsTab/>                    
                        </CustomTabPanel>

                        <CustomTabPanel value="3">
                            <ImportTab/>
                        </CustomTabPanel>

                        <CustomTabPanel value="4">
                            <SettingsTab/>
                        </CustomTabPanel>

                        <CustomTabPanel value="5">
                            <InfoTab/>
                        </CustomTabPanel>
                    </TabContext>
                </Box>
            }

            <Button
                variant="contained"
                color="inherit"
                size="small"
                sx={{ position: "absolute", left:"40px", top: "10px", zIndex: 1 }}
                onClick={ handleChangeSize }>
                    { isCollapsed ? <KeyboardArrowDownIcon/> : <KeyboardArrowUpIcon/> }
            </Button>

            <Button
                variant="contained"
                color="inherit"
                size="small"
                sx={{ position: "absolute", left:"120px", top: "10px", zIndex: 1 }}
                onClick={ handleSidebarSize }>
                    { isSidebarCollapsed ? <KeyboardArrowLeftIcon/> : <KeyboardArrowRightIcon/> }
            </Button>
        </Box>
    )
}

export default Topbar