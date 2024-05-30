import { Box, Tab } from "@mui/material"
import { useSetRecoilState } from "recoil"
import { TabList } from "@mui/lab"
import { UserChoiceItem } from "../../definitions/utility"
import { capitalizeString } from "../../utils/utility"
import { sidebarTabValueState, sidebarErrorMsgState } from "../../atoms/sidebar"
import { SidebarTab } from "../../definitions/tabs"


const Tabs: React.FC = (): JSX.Element =>
{
    const setTabValue = useSetRecoilState(sidebarTabValueState)
    const setErrorMessage = useSetRecoilState(sidebarErrorMsgState)

    const classesLabel = capitalizeString(UserChoiceItem.CLASSES)
    const attributesLabel = capitalizeString(UserChoiceItem.ATTRIBUTES)
    const associationsLabel = capitalizeString(UserChoiceItem.ASSOCIATIONS_ONE_KNOWN_CLASS).slice(0, -1)

    const tabColor = "secondary"
    const tabSx = { textTransform: "capitalize" }

    const handleChange = (_: React.SyntheticEvent, newValue: SidebarTab) =>
    {
        setErrorMessage("")
        setTabValue(newValue)
    }


    return (
        <Box sx={{ borderBottom: 1, borderColor: "divider", display: "flex", justifyContent: "center" }}>

            <TabList onChange={ handleChange } indicatorColor={ tabColor } textColor={ tabColor }>
                <Tab sx={tabSx} label={classesLabel} value={SidebarTab.CLASSES} />
                <Tab sx={tabSx} label={attributesLabel} value={SidebarTab.ATTRIBUTES} />
                <Tab sx={tabSx} label={associationsLabel} value={SidebarTab.ASSOCIATIONS}/>
            </TabList>

        </Box>
    )
}

export default Tabs