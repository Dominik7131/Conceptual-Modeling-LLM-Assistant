import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import { Attribute, Entity, Field, Item, ItemFieldUIName, ItemType, Relationship, UserChoice } from '../interfaces';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import HighlightIcon from '@mui/icons-material/Highlight';


interface Props
{
    isLoading : boolean
    items : Item[]
    onAddItem : (item : Item) => void
    onEditSuggestion : (itemID : number, itemType : ItemType) => void
    onHighlightSingleItem : (itemID : number) => void
    sidebarWidthPercentage : number
    isSidebarOpen : boolean
    onToggleSideBarCollapse : () => void
}

const Sidebar: React.FC<Props> = ({isLoading, items, onAddItem, onEditSuggestion, onHighlightSingleItem, sidebarWidthPercentage, isSidebarOpen, onToggleSideBarCollapse}) =>
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
                <Button startIcon={<AddIcon/>} onClick={() => onAddItem(item)}> Add </Button>
                <Button startIcon={<EditIcon/>} onClick={() => onEditSuggestion(item.ID, item.type)}> Edit </Button>
                <Button startIcon={<HighlightIcon/>} onClick={() => onHighlightSingleItem(item.ID)}> Highlight </Button>
            </ButtonGroup>
        )

    }

    const showItem = (item : Item) : JSX.Element =>
    {
        const attribute : Attribute = (item as Attribute)
        const relationship : Relationship = (item as Relationship)

        const isAttribute = item.type === ItemType.ATTRIBUTE
        const isRelationship = item.type === ItemType.RELATIONSHIP

        return (
            <ListItemText>
                <Typography> <strong>{ ItemFieldUIName.NAME }:</strong> { item[Field.NAME] } </Typography>
                <Typography> <strong>{ ItemFieldUIName.ORIGINAL_TEXT }:</strong> { item[Field.ORIGINAL_TEXT] } </Typography>

                {
                    isAttribute &&
                    <>
                        <Typography> <strong>{ ItemFieldUIName.DATA_TYPE }:</strong> { attribute[Field.DATA_TYPE] } </Typography>
                        <Typography> <strong>{ ItemFieldUIName.CARDINALITY }:</strong> { attribute[Field.CARDINALITY] } </Typography>
                    </>
                }

                {
                    isRelationship &&
                    <>
                        <Typography> <strong> { ItemFieldUIName.SOURCE_ENTITY }:</strong> { relationship[Field.SOURCE_ENTITY] } </Typography>
                        <Typography> <strong> { ItemFieldUIName.TARGET_ENTITY }:</strong> { relationship[Field.TARGET_ENTITY] } </Typography>
                        <Typography> <strong> { ItemFieldUIName.CARDINALITY }:</strong> { relationship[Field.CARDINALITY] } </Typography>
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