import { Box, Tab } from "@mui/material"
import { sidebarTabValueState } from "../../atoms"
import { useSetRecoilState } from "recoil"
import { TabList } from "@mui/lab"


const Tabs: React.FC = (): JSX.Element =>
{
    const setTabValue = useSetRecoilState(sidebarTabValueState)


    const handleChange = (event: React.SyntheticEvent, newValue: string) =>
    {
        setTabValue(newValue)
    }


    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent:"center" }}>
            <TabList onChange={ handleChange }
                indicatorColor="secondary"
                textColor="secondary">
                    <Tab sx={{textTransform: "capitalize"}} label="Entities" value="0" />
                    <Tab sx={{textTransform: "none"}} label="Attributes" value="1" />
                    <Tab sx={{textTransform: "none"}} label="Relationships" value="2" />
            </TabList>
        </Box>
    )
}

export default Tabs