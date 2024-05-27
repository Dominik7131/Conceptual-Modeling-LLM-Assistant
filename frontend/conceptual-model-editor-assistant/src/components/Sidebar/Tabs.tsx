import { Box, Tab } from "@mui/material"
import { useSetRecoilState } from "recoil"
import { TabList } from "@mui/lab"
import { UserChoice } from "../../definitions/utility"
import { capitalizeString } from "../../utils/utility"
import { sidebarTabValueState, sidebarErrorMsgState } from "../../atoms/sidebar"
import { SidebarTab } from "../../definitions/tabs"


const Tabs: React.FC = (): JSX.Element =>
{
    const setTabValue = useSetRecoilState(sidebarTabValueState)
    const setErrorMessage = useSetRecoilState(sidebarErrorMsgState)

    const entitiesLabel = capitalizeString(UserChoice.CLASSES)
    const attributesLabel = capitalizeString(UserChoice.ATTRIBUTES)
    const associationsLabel = capitalizeString(UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS).slice(0, -1)

    const handleChange = (_: React.SyntheticEvent, newValue: SidebarTab) =>
    {
        setErrorMessage("")
        setTabValue(newValue)
    }


    return (
        <Box sx={{ borderBottom: 1, borderColor: "divider", display: "flex", justifyContent: "center" }}>
            <TabList onChange={ handleChange }
                indicatorColor="secondary"
                textColor="secondary">
                    <Tab sx={{textTransform: "capitalize"}} label={entitiesLabel} value={SidebarTab.CLASSES} />
                    <Tab sx={{textTransform: "none"}} label={attributesLabel} value={SidebarTab.ATTRIBUTES} />
                    <Tab sx={{textTransform: "none"}} label={associationsLabel} value={SidebarTab.ASSOCIATIONS}/>
            </TabList>
        </Box>
    )
}

export default Tabs