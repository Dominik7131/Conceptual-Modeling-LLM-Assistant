import { Alert, Box, CircularProgress, Divider, ListItem, Stack, Typography } from "@mui/material"
import { Field, ItemType } from "../../definitions/utility"
import ItemDisplay from "./ItemDisplay"
import ControlButtons from "./ControlButtons"
import { useRecoilValue } from "recoil"
import { itemTypesToLoadState } from "../../atoms/suggestions"
import { sidebarErrorMsgState } from "../../atoms/sidebar"
import { Item, Association } from "../../definitions/conceptualModel"


interface Props
{
    items: Item[]
    title: string
    itemType: ItemType
}


const Suggestions: React.FC<Props> = ({ items, title, itemType }): JSX.Element =>
{
    const errorMessage = useRecoilValue(sidebarErrorMsgState)
    const itemTypesToLoad = useRecoilValue(itemTypesToLoadState)


    const createUniqueKey = (name: string, sourceEntity: string, targetEntity: string): string =>
    {
        if (!sourceEntity)
        { 
            sourceEntity = ""
        }

        if (!targetEntity)
        {
            targetEntity = ""
        }

        const uniqueKey = `${name}-${sourceEntity}-${targetEntity}`
        return uniqueKey
    }


    return (

        <Stack style={{ whiteSpace: "pre-line" }}>
            { title &&
                <Stack>
                    <Typography
                        sx={{ display: "flex", justifyContent: "center" }}
                        variant="body1"
                        gutterBottom>
                            <strong> { title } </strong>
                    </Typography>

                    <Divider></Divider>
                </Stack>

            }

            {
                errorMessage &&
                <Typography component="span">
                    <Alert severity="error">
                        { errorMessage }
                    </Alert>
                </Typography>
            }

            {
                items.map(item =>
                    <ListItem key={ createUniqueKey(item[Field.NAME], (item as Association)[Field.SOURCE_CLASS], (item as Association)[Field.TARGET_CLASS]) }>
                        <Stack width="100%" height="100%">
                            <ItemDisplay item={item}/>
                            <ControlButtons item={item}/>
                        </Stack>
                    </ListItem>
                )
            }

            { itemTypesToLoad.includes(itemType) &&
                <Box
                    sx={{ display: "flex", justifyContent:"center", marginTop: "20px" }}>
                    <CircularProgress />
                </Box>
            }
        </Stack>
    )
}

export default Suggestions