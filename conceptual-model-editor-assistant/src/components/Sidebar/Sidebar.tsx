import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useRecoilValue } from 'recoil';
import { isLoadingSuggestedItemsState, isSidebarOpenState, sidebarWidthPercentageState, suggestedItemsState } from '../../atoms';
import ItemDisplay from './ItemDisplay';


const Sidebar: React.FC = () =>
{
    const items = useRecoilValue(suggestedItemsState)
    const isLoading = useRecoilValue(isLoadingSuggestedItemsState)
    const isSidebarOpen = useRecoilValue(isSidebarOpenState)
    const sidebarWidthPercentage = useRecoilValue(sidebarWidthPercentageState)


    return (
        <Drawer
            sx={{ flexShrink: 0, '& .MuiDrawer-paper': { width: `${sidebarWidthPercentage}%`, boxSizing: 'border-box'}}}
            variant="persistent"
            anchor="right"
            open={isSidebarOpen}
            >

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
                        sx={{ display: 'flex', justifyContent:"center", marginY: 2}}>
                        <CircularProgress />
                    </Box>
                }
            </List> 

            {/* <Button onClick={ () => onToggleSideBarCollapse() }> Close </Button> */}
        </Drawer>
    )
}

export default Sidebar