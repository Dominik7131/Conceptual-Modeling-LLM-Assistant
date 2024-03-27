import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import { Attribute, Entity, Item, ItemType, Relationship, UserChoice } from '../App';
import Box from '@mui/material/Box';


interface Props
{
    isLoading : boolean
    items : Item[]
    onAddItem : (item : Item, addAsDifferent : boolean) => void
    onEditSuggestion : (itemID : number, itemType : ItemType) => void
    onShowInference : (itemID : number) => void
    sidebarWidthPercentage : number
    isSidebarOpen : boolean
    onToggleSideBarCollapse : () => void
}

const Sidebar: React.FC<Props> = ({isLoading, items, onAddItem, onEditSuggestion, onShowInference, sidebarWidthPercentage, isSidebarOpen, onToggleSideBarCollapse}) =>
{
    const showTextOnSidebar = () =>
    {        
        return (
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {items.map((item, index) =>
                        <ListItem key={item.ID}>
                            {showItem(item)}
                        </ListItem>
                )}

                {isLoading &&
                    <Box sx={{ display: 'flex', justifyContent:"center", marginY: 2}}>
                        <CircularProgress />
                    </Box>}
            </List>
        )
    }

    const showItem = (item : Item) =>
    {
        const attribute : Attribute = (item as Attribute)
        const relationship : Relationship = (item as Relationship)
        const entity : Entity = (item as Entity)

        // TODO: Why the sidebar is being rerendered every time user moves a node?
        // console.log("node moved")

        return (
            <ListItemText>
                <Typography>
                    <strong>Name:</strong> {item.name}
                </Typography>

                <Typography>
                    <strong>Original text:</strong> {item.inference}
                </Typography>

                {
                    item.type === ItemType.ATTRIBUTE &&
                    <Typography>
                        <strong>Data type:</strong> {attribute.dataType}
                    </Typography>
                }

                {
                    item.type === ItemType.ATTRIBUTE &&
                    <Typography>
                        <strong>Cardinality:</strong> {attribute.cardinality}
                    </Typography>
                }


                {
                    item.type === ItemType.RELATIONSHIP &&
                    <Typography>
                        <strong>Source entity:</strong> {relationship.source}
                    </Typography>
                }

                {
                    item.type === ItemType.RELATIONSHIP &&
                    <Typography>
                        <strong>Target entity:</strong> {relationship.target}
                    </Typography>
                }

                {
                    item.type === ItemType.RELATIONSHIP &&
                    <Typography>
                        <strong>Cardinality:</strong> {relationship.cardinality}
                    </Typography>
                }

                <Stack marginTop={1} marginBottom={1}> 
                    <ButtonGroup size="small">
                        <Button onClick={() => onAddItem(item, false)}> Add </Button>
                        {/* {
                            item.type === ItemType.ATTRIBUTE ?
                            <Button
                                onClick={ () => onAddItem(item, true)}>
                                Change to relationship
                            </Button>
                            : item.type === ItemType.RELATIONSHIP ?
                            <Button
                                onClick={ () => onAddItem(item, true)}>
                                Change to attribute
                            </Button>
                            : null
                        } */}
                        <Button onClick={() => onEditSuggestion(item.ID, item.type)}>Edit</Button>
                        <Button onClick={() => onShowInference(item.ID)}>Highlight</Button>
                    </ButtonGroup>
                </Stack>

                {/* <Divider /> */}

            </ListItemText>
        )
    }

    return (
        <Drawer
            sx={{
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: `${sidebarWidthPercentage}%`,
                    boxSizing: 'border-box',
                },
            }}
            variant="persistent"
            anchor="right"
            open={isSidebarOpen}
            >

            {showTextOnSidebar()}     

            {/* <Button onClick={ () => onToggleSideBarCollapse() }>
                Close
            </Button> */}
        </Drawer>
    )
}

export default Sidebar