import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useRecoilValue } from 'recoil';
import { isLoadingSuggestedItemsState, isSidebarOpenState, sidebarTabValueState, sidebarTitlesState, sidebarWidthPercentageState, suggestedAttributesState, suggestedEntitiesState, suggestedRelationshipsState } from '../../atoms';
import ItemDisplay from './ItemDisplay';
import { Divider, Stack, Tab, Typography } from '@mui/material';
import { Attribute, Field, Item, ItemType } from '../../interfaces';
import { TabContext, TabList, TabPanel } from "@mui/lab"
import Tabs from "./Tabs";
import Suggestions from './Suggestions';


const Sidebar: React.FC = () =>
{
    const entities = useRecoilValue(suggestedEntitiesState)
    const attributes = useRecoilValue(suggestedAttributesState)
    const relationships = useRecoilValue(suggestedRelationshipsState)

    const isSidebarOpen = useRecoilValue(isSidebarOpenState)
    const sidebarWidthPercentage = useRecoilValue(sidebarWidthPercentageState)

    const tabValue = useRecoilValue(sidebarTabValueState)

    // const attributeSourceEntity = attributes[0] && attributes[0][Field.SOURCE_ENTITY]
    // const relationshipsSourceEntity = relationships[0] && relationships[0][Field.SOURCE_ENTITY]

    const sidebarTitles = useRecoilValue(sidebarTitlesState)


    return (
        <Drawer
            sx={{ '& .MuiDrawer-paper': { width: `${sidebarWidthPercentage}%`}, '& .MuiTabPanel-root': { paddingX: "0px", marginX: "3px" } }}
            variant="persistent"
            anchor="right"
            open={isSidebarOpen}
            >
            
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
            

            {/* <Button onClick={ () => onToggleSideBarCollapse() }> Close </Button> */}
        </Drawer>
    )
}

export default Sidebar