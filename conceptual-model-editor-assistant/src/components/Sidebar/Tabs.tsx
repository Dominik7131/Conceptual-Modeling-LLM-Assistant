import { Box, Tab } from "@mui/material"
import { sidebarErrorMsgState, sidebarTabValueState } from "../../atoms"
import { useSetRecoilState } from "recoil"
import { TabList } from "@mui/lab"
import { SidebarTabs } from "../../interfaces"


const Tabs: React.FC = (): JSX.Element =>
{
    const setTabValue = useSetRecoilState(sidebarTabValueState)
    const setErrorMessage = useSetRecoilState(sidebarErrorMsgState)

    const handleChange = (event: React.SyntheticEvent, newValue: string) =>
    {
        setErrorMessage("")
        setTabValue(newValue)
    }


    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent:"center" }}>
            <TabList onChange={ handleChange }
                indicatorColor="secondary"
                textColor="secondary">
                    <Tab sx={{textTransform: "capitalize"}} label="Entities" value={SidebarTabs.ENTITIES} />
                    <Tab sx={{textTransform: "none"}} label="Attributes" value={SidebarTabs.ATTRIBUTES} />
                    <Tab sx={{textTransform: "none"}} label="Relationships" value={SidebarTabs.RELATIONSHIPS}/>
            </TabList>
        </Box>
    )
}

export default Tabs