import { Alert, Box, CircularProgress, Divider, ListItem, Stack, Typography } from "@mui/material"
import { Item } from "../../interfaces"
import ItemDisplay from "./ItemDisplay"
import ControlButtons from "./ControlButtons"
import { useRecoilValue } from "recoil"
import { sidebarErrorMsgState } from "../../atoms"

interface Props
{
    items: Item[]
    isLoading: boolean
    title: string
}


const Suggestion: React.FC<Props> = ({ items, isLoading, title }): JSX.Element =>
{
    const errorMessage = useRecoilValue(sidebarErrorMsgState)

    return (

        <Stack style={{ whiteSpace: 'pre-line' }}>
            { title &&
                <Stack>
                    <Typography
                        sx={{ display: 'flex', justifyContent:"center"}}
                        variant="body1"
                        gutterBottom>
                            <strong> { title } </strong>
                    </Typography>

                    <Divider></Divider>
                </Stack>

            }

            {
                errorMessage &&
                <Typography>
                    <Alert severity="error">
                        { errorMessage }
                    </Alert>
                </Typography>
            }

            {
                items.map(item =>
                    <ListItem key={item.ID}>
                        <Stack>
                            <ItemDisplay item={item}/>
                            <ControlButtons item={item}/>
                        </Stack>
                    </ListItem>
                )
            }

            { isLoading &&
                <Box
                    sx={{ display: 'flex', justifyContent:"center", marginTop: "10px"}}>
                    <CircularProgress />
                </Box>
            }
        </Stack>
    )
}

export default Suggestion