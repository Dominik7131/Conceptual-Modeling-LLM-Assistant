import { useRecoilValue } from "recoil";
import { Box, Divider } from "@mui/material";
import { ItemType } from "../../definitions/utility";
import { TabContext, TabPanel } from "@mui/lab"
import Tabs from "./Tabs";
import Suggestions from "./Suggestions";
import { isSidebarCollapsedState, sidebarTabValueState, sidebarTitlesState } from "../../atoms/sidebar";
import { suggestedClassesState, suggestedAttributesState, suggestedAssociationsState } from "../../atoms/suggestions";


const Sidebar: React.FC = () =>
{
    const isCollapsed = useRecoilValue(isSidebarCollapsedState)

    const entities = useRecoilValue(suggestedClassesState)
    const attributes = useRecoilValue(suggestedAttributesState)
    const relationships = useRecoilValue(suggestedAssociationsState)

    const tabValue = useRecoilValue(sidebarTabValueState)

    const sidebarTitles = useRecoilValue(sidebarTitlesState)


    if (isCollapsed)
    {
        return <></>
    }


    return (
        <Box sx={{ flex: 1, display: "flex", overflowY: "auto", flexDirection: "row", "& .MuiTabPanel-root": { paddingX: "0px", marginX: "2px" } }}>

            <Divider orientation="vertical" />
            
            <Box sx={{ flex: 1, width: "50%" }}>
                <TabContext value={tabValue}>
                    <Tabs/>

                    <TabPanel value="0">
                        <Suggestions items={entities} title={sidebarTitles.classes} itemType={ItemType.CLASS}/>
                    </TabPanel>

                    <TabPanel value="1">
                        <Suggestions items={attributes} title={sidebarTitles.attributes} itemType={ItemType.ATTRIBUTE}/>
                    </TabPanel>

                    <TabPanel value="2">
                        <Suggestions items={relationships} title={sidebarTitles.associations} itemType={ItemType.ASSOCIATION}/>
                    </TabPanel>
                </TabContext>
            </Box>
        </Box>
    )
}

export default Sidebar