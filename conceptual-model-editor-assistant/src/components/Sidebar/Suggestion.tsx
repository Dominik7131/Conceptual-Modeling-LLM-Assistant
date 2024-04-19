import { Box, CircularProgress, Divider, ListItem, Stack, Typography } from "@mui/material"
import { Item } from "../../interfaces"
import ItemDisplay from "./ItemDisplay"

interface Props
{
    items: Item[]
    isLoading: boolean
    title: string
}


const Suggestion: React.FC<Props> = ({ items, isLoading, title }): JSX.Element =>
{
    return (

        <Stack marginY="-15px" marginX="-20px" style={{ whiteSpace: 'pre-line' }}>
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

export default Suggestion