import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import { Attribute, Entity, Item, ItemFieldUIName, ItemType, Relationship, UserChoice } from '../interfaces';
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
            <List>
                {items.map(item =>
                    <ListItem key={item.ID}> { showItem(item) } </ListItem>
                )}

                {isLoading &&
                    <Box sx={{ display: 'flex', justifyContent:"center", marginY: 2}}>
                        <CircularProgress />
                    </Box>}
            </List>
        )
    }

    const showButtons = (item : Item) : JSX.Element =>
    {
        return (
            <ButtonGroup fullWidth sx={{ marginTop: 1 }} variant="outlined" size="small">
                <Button onClick={() => onAddItem(item, false)}> Add </Button>
                <Button onClick={() => onEditSuggestion(item.ID, item.type)}> Edit </Button>
                <Button onClick={() => onShowInference(item.ID)}> Highlight </Button>
            </ButtonGroup>
        )

    }

    const showItem = (item : Item) : JSX.Element =>
    {
        const attribute : Attribute = (item as Attribute)
        const relationship : Relationship = (item as Relationship)

        // TODO: Why is this logged every time when there are suggestions on sidebar and a node is moved?
        // Is the sidebar being rerendered every time user moves a node?
        // console.log("node moved")

        const isAttribute = item.type === ItemType.ATTRIBUTE
        const isRelationship = item.type === ItemType.RELATIONSHIP

        return (
            <ListItemText>
                <Typography> <strong>{ ItemFieldUIName.NAME }:</strong> { item.name } </Typography>
                <Typography> <strong>{ ItemFieldUIName.ORIGINAL_TEXT }:</strong> { item.inference } </Typography>

                {
                    isAttribute &&
                    <>
                        <Typography> <strong>{ ItemFieldUIName.DATA_TYPE }:</strong> { attribute.dataType } </Typography>
                        <Typography> <strong>{ ItemFieldUIName.CARDINALITY }:</strong> { attribute.cardinality } </Typography>
                    </>
                }

                {
                    isRelationship &&
                    <>
                        <Typography> <strong> { ItemFieldUIName.SOURCE_ENTITY }:</strong> { relationship.source } </Typography>
                        <Typography> <strong> { ItemFieldUIName.TARGET_ENTITY }:</strong> { relationship.target } </Typography>
                        <Typography> <strong> { ItemFieldUIName.CARDINALITY }:</strong> { relationship.cardinality } </Typography>
                    </>
                }

                {
                    showButtons(item)
                }

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

            {/* <Button onClick={ () => onToggleSideBarCollapse() }> Close </Button> */}
        </Drawer>
    )
}

export default Sidebar