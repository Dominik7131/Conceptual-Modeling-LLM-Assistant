import { Box, Button, Tab } from "@mui/material"
import { topbarTabValueState } from "../../atoms"
import { useSetRecoilState } from "recoil"
import { TabList } from "@mui/lab"
import { SUMMARY_DESCRIPTIONS_NAME, SUMMARY_PLAIN_TEXT_NAME } from "../../hooks/useUtility"


const Tabs: React.FC = (): JSX.Element =>
{
    const setTabValue = useSetRecoilState(topbarTabValueState)


    const handleChange = (event: React.SyntheticEvent, newValue: string) =>
    {
        setTabValue(newValue)
    }


    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent:"center" }}>
            <TabList onChange={ handleChange }>
                <Tab sx={{textTransform: "none"}} label="Main" value="0" />
                <Tab sx={{textTransform: "none"}} label={SUMMARY_PLAIN_TEXT_NAME} value="1" />
                <Tab sx={{textTransform: "none"}} label={SUMMARY_DESCRIPTIONS_NAME} value="2" />
                <Tab sx={{textTransform: "none"}} label="Import & Export" value="3" />
                <Tab sx={{textTransform: "none"}} label="Settings" value="4" />
            </TabList>
        </Box>
    )
}

export default Tabs