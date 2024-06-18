import { useRecoilValue } from "recoil"
import { Box, Divider } from "@mui/material"
import { ItemType } from "../../definitions/utility"
import { TabContext } from "@mui/lab"
import Tabs from "./Tabs"
import Suggestions from "./Suggestions"
import { isSidebarCollapsedState, sidebarTabValueState, sidebarTitlesState } from "../../atoms/sidebar"
import { suggestedClassesState, suggestedAttributesState, suggestedAssociationsState } from "../../atoms/suggestions"
import { CustomTabPanel } from "../CustomElements/CustomTabPanel"


const Sidebar: React.FC = () =>
{
    const isCollapsed = useRecoilValue(isSidebarCollapsedState)

    const classes = useRecoilValue(suggestedClassesState)
    const attributes = useRecoilValue(suggestedAttributesState)
    const associations = useRecoilValue(suggestedAssociationsState)

    const tabValue = useRecoilValue(sidebarTabValueState)

    const sidebarTitles = useRecoilValue(sidebarTitlesState)

    if (isCollapsed)
    {
        return <></>
    }

    return (
        <Box sx={{ flex: 1, display: "flex", overflowY: "auto", flexDirection: "row", "& .MuiTabPanel-root": { paddingX: "0px", marginX: "2px" } }}>

            <Divider orientation="vertical" />
            
            <Box sx={{ flex: 1, width: "50%", overflowY: "auto" }}>
                <TabContext value={tabValue}>
                    <Tabs/>

                    <CustomTabPanel value="0">
                        <Suggestions items={classes} title={sidebarTitles.classes} itemType={ItemType.CLASS}/>
                    </CustomTabPanel>

                    <CustomTabPanel value="1">
                        <Suggestions items={attributes} title={sidebarTitles.attributes} itemType={ItemType.ATTRIBUTE}/>
                    </CustomTabPanel>

                    <CustomTabPanel value="2">
                        <Suggestions items={associations} title={sidebarTitles.associations} itemType={ItemType.ASSOCIATION}/>
                    </CustomTabPanel>
                </TabContext>
            </Box>
        </Box>
    )
}

export default Sidebar