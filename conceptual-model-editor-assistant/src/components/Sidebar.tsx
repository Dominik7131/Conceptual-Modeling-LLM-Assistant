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
import { UserChoice } from '../App';
import Box from '@mui/material/Box';


interface Props
{
    isLoading : boolean,
    items : Item[],
    userChoice : string,
    onAddEntity : (entity : Entity) => void,
    onAddAttributesToNode : (attribute : Attribute) => void,
    onAddRelationshipsToNodes : (relationship : Relationship) => void,
    onAddAsRelationship : (attribute : Attribute) => void,
    onAddAsAttribute : (relationship : Relationship) => void,
    onEditSuggestion : (itemID : number, userChoice : string) => void,
    onShowInference : (itemID : number) => void,
    sidebarWidthPercentage : number,
    isSidebarOpen : boolean,
    onToggleSideBarCollapse : () => void
}

const Sidebar: React.FC<Props> = ({isLoading, items, userChoice, onAddEntity, onAddAttributesToNode, onAddRelationshipsToNodes, onAddAsRelationship, onAddAsAttribute, onEditSuggestion, onShowInference, sidebarWidthPercentage, isSidebarOpen, onToggleSideBarCollapse}) =>
{
    // TODO: Instead of different functions for adding pass probably only one Add function and implement the logic in useConceptualModel hook

    // TODO: Decompose the sidebar into more sub-components
    // E.g.:
    //  - one component for text such as name: ..., inference: ..., ...
    //  - one component for buttons such as "Add", "Edit", "Show inference"

    const showTextOnSidebar = () =>
    {        
        return (
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {items.map((item, index) =>
                        <ListItem key={item.ID}>
                            {showItem(item, userChoice, index)}
                        </ListItem>
                )}

                {isLoading &&
                    <Box sx={{ display: 'flex', justifyContent:"center", marginY: 2}}>
                        <CircularProgress />
                    </Box>}
            </List>
        )
    }

    const showItem = (item : Item, userChoice : string, index : number) =>
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
                    userChoice === UserChoice.ATTRIBUTES &&
                    <Typography>
                        <strong>Data type:</strong> {attribute.dataType}
                    </Typography>
                }

                {
                    (userChoice === UserChoice.ATTRIBUTES || userChoice === UserChoice.RELATIONSHIPS) &&
                    <Typography>
                        <strong>Cardinality:</strong> {attribute.cardinality}
                    </Typography>
                }


                {
                    userChoice === UserChoice.RELATIONSHIPS &&
                    <Typography>
                        <strong>Source entity:</strong> {relationship.source}
                    </Typography>
                }

                {
                    userChoice === UserChoice.RELATIONSHIPS &&
                    <Typography>
                        <strong>Target entity:</strong> {relationship.target}
                    </Typography>
                }

                <Stack marginTop={1} marginBottom={1}> 
                    <ButtonGroup size="small">
                        <Button
                            onClick={() => 
                            {
                                if (userChoice === UserChoice.ATTRIBUTES)
                                {
                                    onAddAttributesToNode(attribute)
                                }
                                else if (userChoice === UserChoice.RELATIONSHIPS)
                                {
                                    onAddRelationshipsToNodes(relationship)
                                }
                                else if (userChoice === "entities")
                                {
                                    onAddEntity(entity)
                                }
                            }}>
                                Add
                        </Button>
                        {
                            userChoice === UserChoice.ATTRIBUTES ?
                            <Button
                                onClick={ () => onAddAsRelationship(attribute) }>
                                Add as relationship
                            </Button>
                            : userChoice === UserChoice.RELATIONSHIPS ?
                            <Button
                                onClick={ () => onAddAsAttribute(relationship) }>
                                Add as attribute
                            </Button>
                            : null
                        }
                        <Button onClick={() => onEditSuggestion(item.ID, userChoice)}>Edit</Button>
                        <Button onClick={() => onShowInference(item.ID)}>Show</Button>
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