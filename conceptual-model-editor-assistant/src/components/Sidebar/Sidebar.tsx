import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useRecoilValue } from 'recoil';
import { isLoadingSuggestedItemsState, isSidebarOpenState, sidebarTabValueState, sidebarWidthPercentageState, suggestedItemsState } from '../../atoms';
import ItemDisplay from './ItemDisplay';
import { Divider, Stack, Tab, Typography } from '@mui/material';
import { Attribute, Field, Item, ItemType } from '../../interfaces';
import { TabContext, TabList, TabPanel } from "@mui/lab"
import Tabs from "./Tabs";


const Sidebar: React.FC = () =>
{
    const items = useRecoilValue(suggestedItemsState)
    const isLoading = useRecoilValue(isLoadingSuggestedItemsState)
    const isSidebarOpen = useRecoilValue(isSidebarOpenState)
    const sidebarWidthPercentage = useRecoilValue(sidebarWidthPercentageState)

    const tabValue = useRecoilValue(sidebarTabValueState)

    const sourceEntityName = items[0] && items[0].type !== ItemType.ENTITY && (items[0] as Attribute)?.[Field.SOURCE_ENTITY]


    return (
        <Drawer
            sx={{ flexShrink: 0, '& .MuiDrawer-paper': { width: `${sidebarWidthPercentage}%`, boxSizing: 'border-box'}}}
            variant="persistent"
            anchor="right"
            open={isSidebarOpen}
            >
            
            <TabContext value={tabValue}>
                <Tabs/>

                <TabPanel value="0">
                    {/* Component 0 */}
                </TabPanel>

                <TabPanel value="1">
                    {/* Component 1 */}
                </TabPanel>

                <TabPanel value="2">
                    {/* Component 2 */}
                </TabPanel>
            </TabContext>


            { sourceEntityName &&

                <Stack>
                <Typography
                    sx={{ display: 'flex', justifyContent:"center", marginTop: "10px"}}
                    variant="body1"
                    gutterBottom>
                        <strong> Source entity: { sourceEntityName } </strong>
                </Typography>

                <Divider></Divider>
                </Stack>

            }

            <List>
                { 
                    items.map(item =>
                        <ListItem key={item.ID}>
                            <ItemDisplay item={item}/>
                        </ListItem>
                    )
                }

                { isLoading &&
                    <Box
                        sx={{ display: 'flex', justifyContent:"center", marginTop: "10px"}}>
                        <CircularProgress />
                    </Box>
                }
            </List> 

            {/* <Button onClick={ () => onToggleSideBarCollapse() }> Close </Button> */}
        </Drawer>
    )
}

export default Sidebar