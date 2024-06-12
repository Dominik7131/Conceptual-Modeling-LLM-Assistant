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


    const createUniqueKey = (name: string, sourceClass: string, targetClass: string): string =>
    {
        if (!sourceClass)
        { 
            sourceClass = ""
        }

        if (!targetClass)
        {
            targetClass = ""
        }

        const uniqueKey = `${name}-${sourceClass}-${targetClass}`
        return uniqueKey
    }


    return (

        <Stack style={{ whiteSpace: "pre-line", marginLeft: "-20px", marginRight: "-20px" }}>
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
                items.map((item, index) =>
                    <ListItem key={ createUniqueKey(item[Field.NAME], (item as Association)[Field.SOURCE_CLASS], (item as Association)[Field.TARGET_CLASS]) }>
                        <Stack width="100%" height="100%">
                            <ItemDisplay item={item}/>
                            <ControlButtons item={item} isDisabled={false}/>
                        </Stack>
                    </ListItem>
                )
            }

            { itemTypesToLoad.includes(itemType) &&
                <Box
                    sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                    <CircularProgress />
                </Box>
            }
        </Stack>
    )
}

export default Suggestions