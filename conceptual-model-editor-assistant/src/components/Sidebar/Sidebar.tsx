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
import Suggestions from './Suggestion';


const Sidebar: React.FC = () =>
{
    const entities = useRecoilValue(suggestedEntitiesState)
    const attributes = useRecoilValue(suggestedAttributesState)
    const relationships = useRecoilValue(suggestedRelationshipsState)

    const isLoading = useRecoilValue(isLoadingSuggestedItemsState)
    const isSidebarOpen = useRecoilValue(isSidebarOpenState)
    const sidebarWidthPercentage = useRecoilValue(sidebarWidthPercentageState)

    const tabValue = useRecoilValue(sidebarTabValueState)

    // const attributeSourceEntity = attributes[0] && attributes[0][Field.SOURCE_ENTITY]
    // const relationshipsSourceEntity = relationships[0] && relationships[0][Field.SOURCE_ENTITY]

    const sidebarTitles = useRecoilValue(sidebarTitlesState)


    return (
        <Drawer
            sx={{ flexShrink: 0, '& .MuiDrawer-paper': { width: `${sidebarWidthPercentage}%`}}}
            variant="persistent"
            anchor="right"
            open={isSidebarOpen}
            >
            
            <TabContext value={tabValue}>
                <Tabs/>

                <TabPanel value="0">
                    <Suggestions items={entities} isLoading={isLoading} title={sidebarTitles.entities}/>
                </TabPanel>

                <TabPanel value="1">
                    <Suggestions items={attributes} isLoading={isLoading} title={sidebarTitles.attributes}/>
                </TabPanel>

                <TabPanel value="2">
                    <Suggestions items={relationships} isLoading={isLoading} title={sidebarTitles.relationships}/>
                </TabPanel>
            </TabContext>
            

            {/* <Button onClick={ () => onToggleSideBarCollapse() }> Close </Button> */}
        </Drawer>
    )
}

export default Sidebar