import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { isSidebarCollapsedState, sidebarTabValueState, sidebarTitlesState, suggestedAttributesState, suggestedClassesState, suggestedAssociationsState } from '../../atoms';
import { Box } from '@mui/material';
import { ItemType } from '../../interfaces';
import { TabContext, TabList, TabPanel } from "@mui/lab"
import Tabs from "./Tabs";
import Suggestions from './Suggestions';


const Sidebar: React.FC = () =>
{
    const isCollapsed = useRecoilValue(isSidebarCollapsedState)

    const entities = useRecoilValue(suggestedClassesState)
    const attributes = useRecoilValue(suggestedAttributesState)
    const relationships = useRecoilValue(suggestedAssociationsState)

    const tabValue = useRecoilValue(sidebarTabValueState)

    const sidebarTitles = useRecoilValue(sidebarTitlesState)

    const flexValue = isCollapsed ? 0 : 1


    return (
        <Box sx={{ flex: flexValue, '& .MuiTabPanel-root': { paddingX: "0px", marginX: "3px" } }}>
            {
                !isCollapsed &&
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
            }
        </Box>
    )
}

export default Sidebar