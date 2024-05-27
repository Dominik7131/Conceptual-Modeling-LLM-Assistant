import { Stack, Typography } from "@mui/material"
import { createNameFromIRI } from "../../utils/conceptualModel"
import { Item, Attribute, Association } from "../../definitions/conceptualModel"
import { ItemType, Field, ItemFieldUIName, BLACK_COLOR } from "../../definitions/utility"


interface Props
{
    item: Item
}

const ItemDisplay: React.FC<Props> = ({ item }): JSX.Element =>
{
    const attribute : Attribute = (item as Attribute)
    const association : Association = (item as Association)

    const isAttribute = item.type === ItemType.ATTRIBUTE
    const isAssociation = item.type === ItemType.ASSOCIATION

    const customLightGray = "#b5b5b5"
    let originalTextColor = customLightGray

    // Display original text in gray color if it was not found in domain description
    if (item[Field.ORIGINAL_TEXT_INDEXES])
    {
        const isFoundInDomainDescription = item[Field.ORIGINAL_TEXT_INDEXES].length === 0
        originalTextColor = isFoundInDomainDescription ? customLightGray : BLACK_COLOR
    }


    return (
        <Stack marginTop={"15px"}>

            <Typography> <strong>{ ItemFieldUIName.NAME }:</strong> { item[Field.NAME] } </Typography>

            {
                item[Field.ORIGINAL_TEXT] &&
                    <Typography color={originalTextColor}> <strong>{ ItemFieldUIName.ORIGINAL_TEXT }:</strong> { item[Field.ORIGINAL_TEXT] } </Typography>
            }

            {
                item[Field.DESCRIPTION] &&
                    <Typography> <strong>{ ItemFieldUIName.DESCRIPTION }:</strong> { item[Field.DESCRIPTION] } </Typography>
            }

            {
                isAttribute && attribute[Field.DATA_TYPE] &&
                    <Typography> <strong>{ ItemFieldUIName.DATA_TYPE }:</strong> { attribute[Field.DATA_TYPE] } </Typography>
            }

            {
                isAttribute && attribute[Field.SOURCE_CARDINALITY] &&
                    <Typography> <strong>{ ItemFieldUIName.CARDINALITY }:</strong> { attribute[Field.SOURCE_CARDINALITY] } </Typography>
            }

            {
                isAssociation && association[Field.SOURCE_CLASS] &&
                    <Typography> <strong> { ItemFieldUIName.SOURCE_CLASS }:</strong> { createNameFromIRI(association[Field.SOURCE_CLASS]) } </Typography>
            }

            {
                isAssociation && association[Field.TARGET_CLASS] &&
                    <Typography> <strong> { ItemFieldUIName.TARGET_CLASS }:</strong> { createNameFromIRI(association[Field.TARGET_CLASS]) } </Typography>
            }

            {
                isAssociation && association[Field.SOURCE_CARDINALITY] &&
                    <Typography> <strong> { ItemFieldUIName.SOURCE_CARDINALITY }:</strong> { association[Field.SOURCE_CARDINALITY] } </Typography>
            }

            { 
                isAssociation && association[Field.TARGET_CARDINALITY] &&
                    <Typography> <strong> { ItemFieldUIName.TARGET_CARDINALITY }:</strong> { association[Field.TARGET_CARDINALITY] } </Typography>
            }

        </Stack>
    )
}

export default ItemDisplay