import { Item } from "../../definitions/conceptualModel"
import { Field } from "../../definitions/utility"
import Typography from "@mui/material/Typography"


interface Props
{
    item: Item
}

const Title: React.FC<Props> = ({ item }) =>
{
    return (
        <Typography variant="h5" component="span">
            Editing { item[Field.TYPE] }: <strong>{ item[Field.NAME] }</strong>
        </Typography>
    )
}
    
export default Title