import { Box, CircularProgress, Divider, Drawer, ListItem, Stack, Typography } from "@mui/material"
import List from '@mui/material/List';
import { Item } from "../../interfaces"
import ItemDisplay from "./ItemDisplay"

interface Props
{
    items: Item[]
    isLoading: boolean
    title: string
}


const Suggestions: React.FC<Props> = ({ items, isLoading, title }): JSX.Element =>
{
    return (

        <Stack marginX="-20px">
            { title &&
                <Stack>
                    <Typography
                        sx={{ display: 'flex', justifyContent:"center"}}
                        variant="body1"
                        gutterBottom>
                            <strong> Source entity: { title } </strong>
                    </Typography>

                    <Divider></Divider>
                </Stack>

            }

            {
                items.map(item =>
                    <ListItem key={item.ID}>
                        <ItemDisplay item={item}/>
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

export default Suggestions