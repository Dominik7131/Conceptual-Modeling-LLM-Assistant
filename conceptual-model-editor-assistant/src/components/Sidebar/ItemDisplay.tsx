import { ListItemText, Typography } from "@mui/material"
import { Attribute, Field, Item, ItemFieldUIName, ItemType, Relationship } from "../../interfaces"
import ControlButtons from "./ControlButtons"

interface Props
{
    item: Item
}


const ItemDisplay: React.FC<Props> = ({ item }): JSX.Element =>
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

            <ControlButtons item={item}/>

        </ListItemText>
    )
}

export default ItemDisplay