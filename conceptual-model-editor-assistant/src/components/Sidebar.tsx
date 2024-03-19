import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';


interface Props
{
    isLoading : boolean,
    entities : Entity[],
    attributes : Attribute[],
    relationships : Relationship[],
    onAddEntity : (event : React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
    onAddAttributesToNode : (attribute : Attribute) => void,
    onAddRelationshipsToNodes : (relationship : Relationship) => void,
    onAddAsRelationship : (attribute : Attribute) => void,
    onAddAsAttribute : (relationship : Relationship) => void,
    onEditSuggestion : (event : React.MouseEvent<HTMLButtonElement, MouseEvent>, userChoice : string) => void,
    onShowInference : (event : React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
}

const Sidebar: React.FC<Props> = ({isLoading, entities, attributes, relationships, onAddEntity, onAddAttributesToNode, onAddRelationshipsToNodes, onAddAsRelationship, onAddAsAttribute, onEditSuggestion, onShowInference}) =>
{
    // TODO: Decompose the sidebar into more sub-components
    // E.g.:
    //  - one component for text such as name: ..., inference: ..., ...
    //  - one component for buttons such as "Add", "Edit", "Show inference"

    const showTextOnSidebar = () =>
    {
        return (
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>

                {entities.map((entity, index) =>
                    <>
                        <ListItem key={entity.name}>
                            {showItem(entity, "entities", index)}
                        </ListItem>
                        <Divider/>
                    </>
                )}

                {attributes.map((attribute, index) => 
                    <>
                        <ListItem key={attribute.name}>
                            {showItem(attribute, "attributes", index)}
                        </ListItem>
                        <Divider/>
                    </>
                )}

                {relationships.map((relationship, index) =>
                    <>
                        <ListItem key={index}>
                            {showItem(relationship, "relationships", index)}
                        </ListItem>
                        <Divider/>
                    </>
                )}

                {isLoading && <p ><strong>Loading...</strong></p>}
            </List>
        )
    }

    const showItem = (item : Attribute | Relationship | Entity, userChoice : string, index : number) =>
    {
        const attribute : Attribute = (item as Attribute)
        const relationship : Relationship = (item as Relationship)

        return (
            <ListItemText>
                <Typography>
                    <strong>Name:</strong> {item.name}
                </Typography>

                <Typography>
                    <strong>Inference:</strong> {item.inference}
                </Typography>

                {
                    userChoice === "attributes" &&
                    <Typography>
                        <strong>Data type:</strong> {attribute.dataType}
                    </Typography>
                }

                {
                    (userChoice === "attributes" || userChoice === "relationships") &&
                    <Typography>
                        <strong>Cardinality:</strong> {attribute.cardinality}
                    </Typography>
                }


                {
                    userChoice === "relationships" &&
                    <Typography>
                        <strong>Source entity:</strong> {relationship.source}
                    </Typography>
                }

                {
                    userChoice === "relationships" &&
                    <Typography>
                        <strong>Target entity:</strong> {relationship.target}
                    </Typography>
                }

                <Stack marginTop={1}> 
                    <ButtonGroup size="small">
                        <Button
                            onClick={() => onAddAttributesToNode(attribute)}>
                                Add
                        </Button>
                        {
                            userChoice === "attributes" ?
                            <Button
                                onClick={ () => onAddAsRelationship(attribute) }>
                                Add as relationship
                            </Button>
                            :
                            <Button
                                onClick={ () => onAddAsAttribute(relationship) }>
                                Add as attribute
                            </Button>
                        }
                        <Button onClick={(event) => onEditSuggestion(event, userChoice)}>Edit</Button>
                        <Button onClick={(event) => onShowInference(event)}>Show</Button>
                    </ButtonGroup>
                </Stack>
            </ListItemText>
        )
    }

    return (
        <Drawer
            sx={{
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: '20%',
                    boxSizing: 'border-box',
                },
            }}
            variant="permanent"
            anchor="right"
            >

            {showTextOnSidebar()}
        </Drawer>
    )
}

export default Sidebar