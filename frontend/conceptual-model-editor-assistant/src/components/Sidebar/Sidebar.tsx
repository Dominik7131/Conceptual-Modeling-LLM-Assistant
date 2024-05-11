import Drawer from '@mui/material/Drawer';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { isLoadingSuggestedItemsState, isSidebarCollapsedState, isSidebarOpenState, sidebarTabValueState, sidebarTitlesState, sidebarWidthPercentageState, suggestedAttributesState, suggestedClassesState, suggestedAssociationsState } from '../../atoms';
import ItemDisplay from './ItemDisplay';
import { Button, Divider, Stack, Tab, Typography } from '@mui/material';
import { Attribute, Field, Item, ItemType } from '../../interfaces';
import { TabContext, TabList, TabPanel } from "@mui/lab"
import Tabs from "./Tabs";
import Suggestions from './Suggestions';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useState } from 'react';


const Sidebar: React.FC = () =>
{
    const isCollapsed = useRecoilValue(isSidebarCollapsedState)

    const entities = useRecoilValue(suggestedClassesState)
    const attributes = useRecoilValue(suggestedAttributesState)
    const relationships = useRecoilValue(suggestedAssociationsState)

    const isSidebarOpen = useRecoilValue(isSidebarOpenState)
    const [sidebarWidthPercentage, setSidebarWidthPercentage] = useRecoilState(sidebarWidthPercentageState)

    const tabValue = useRecoilValue(sidebarTabValueState)

    const sidebarTitles = useRecoilValue(sidebarTitlesState)


    return (
        <Drawer
            sx={{ '& .MuiDrawer-paper': { width: `${sidebarWidthPercentage}%`}, '& .MuiTabPanel-root': { paddingX: "0px", marginX: "3px" } }}
            variant="persistent"
            anchor="right"
            open={isSidebarOpen}
            >
            
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
        </Drawer>
    )
}

export default Sidebar