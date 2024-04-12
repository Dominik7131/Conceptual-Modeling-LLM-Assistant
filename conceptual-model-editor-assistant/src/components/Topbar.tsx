import { useEffect, useState } from "react"
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { Attribute, Item, UserChoice, SummaryObject } from "../interfaces";
import Tooltip from '@mui/material/Tooltip';
import { CircularProgress, Divider, FormControl, FormLabel, List, ListItem, ListItemText, Radio, RadioGroup, Slider, Tab, Tabs, Typography } from "@mui/material";
import { Node } from 'reactflow';
import useUtility, { capitalizeString } from "../hooks/useUtility";
import TabPanel from '@mui/lab/TabPanel';
import TabList from "@mui/lab/TabList";
import TabContext from '@mui/lab/TabContext';
import AddIcon from '@mui/icons-material/Add';
import HighlightIcon from '@mui/icons-material/Highlight';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import { useRecoilValue } from "recoil";
import { domainDescriptionState, isIgnoreDomainDescriptionState, isLoadingSummary1State, isLoadingSummaryDescriptionsState, sidebarWidthPercentageState, summaryDescriptionsState, summaryTextState } from "../atoms";
import useConceptualModel from "../hooks/useConceptualModel";
import useDomainDescription from "../hooks/useDomainDescription";


const Topbar: React.FC = () =>
{
    const domainDescription = useRecoilValue(domainDescriptionState)
    const isIgnoreDomainDescription = useRecoilValue(isIgnoreDomainDescriptionState)
    const sidebarWidthPercentage = useRecoilValue(sidebarWidthPercentageState)

    const isLoadingSummary1 = useRecoilValue(isLoadingSummary1State)
    const isLoadingSummaryDescriptions = useRecoilValue(isLoadingSummaryDescriptionsState)
    const summary = useRecoilValue(summaryTextState)
    const summaryDescriptions = useRecoilValue(summaryDescriptionsState)

    const [isHovered, setIsHovered] = useState<boolean>(false)
    const [tabValue, setTabValue] = useState<string>('0');
    const [insertedNodeNameText, setInsertedNodeNameText] = useState<string>("")

    const { onAddNewEntity, onImportButtonClick, onSuggestItems, onSummaryButtonClick, onHighlightSelectedItems, onSummaryDescriptionsClick } = useConceptualModel()
    const { onIgnoreDomainDescriptionChange, onDomainDescriptionChange } = useDomainDescription()


    const showSummary1 = () =>
    {
        return (
            <Typography>
                {summary}
            </Typography>
        )
    }

    const showSummary2 = () =>
    {
        // previous implementation: https://github.com/Dominik7131/Conceptual-Modeling-LLM-Assistant/blob/4b71b1e6f62792f586e35b3baac58a4d8d9c10c5/conceptual-model-editor-assistant/src/components/Topbar.tsx
        
        // arguments:
        //  - selected nodes
        //  - selected edges
        // issue: how to distinguish existing descriptions vs. new descriptions that user did not accepted yet?

        // control flow:
        // 1) user selects some part of his conceptual model and clicks on summary2 button
        // 2) from selectedNodes and selectedEdges we obtain list of all selected entities, attributes and relationships
        // 3) for each entity, attribute and relationship: if it does not contain description then save it some object that we will later pass to LLM to generate descriptions
        // 4) send this object to LLM
        // 5) show to the user list of all selected items with their descriptions
        //  - if the description is newly generated from LLM then distinguish it with gray text and add buttons for the user to accept/reject the description
        //      - we know which description is newly generated by checking the object passed to LLM
        //  - otherwise show the description as usual (black text, no buttons)

        // TODO: Add unique keys

        return (
            <>
            {
                summaryDescriptions.entities.length > 0 && <p>Entities and attributes:</p>
            }
            
            <ul>
            {
                summaryDescriptions.entities.map((entity) =>
                    <Typography component="span">
                        <li><strong>{capitalizeString(entity.entity)}</strong>: {entity.description}</li>
                        { entity.attributes.length > 0 && 
                            <ul>
                                <p></p>
                                <li><strong>Attributes</strong></li>
                                <ul>
                                    {entity.attributes.map((attribute : Attribute) =>
                                        <li><strong>{attribute.name}</strong>: {attribute.description}</li>
                                    )}
                                </ul>
                            </ul>
                        }
                        <p></p>
                    </Typography>
                )
            }

            </ul>

            {
                summaryDescriptions.relationships.length > 0 && <p>Relationships:</p>
            }

            <ul>
            {
                summaryDescriptions.relationships.map((relationship) =>
                    <Typography component="span">
                        <li>
                            <strong>{capitalizeString(relationship.sourceEntity)}</strong> {relationship.relationship} <strong>{capitalizeString(relationship.targetEntity)}</strong>: {relationship.description}</li>
                    </Typography>
                )
            }
            </ul>
            </>
        )
        
    }

    const showMainLayout = () =>
    {
        return (
            <>
                <Box sx={{ '& .MuiTextField-root': { m: 1, width: '98.9%' } }}
                    component="form"
                    noValidate
                    autoComplete="off"
                >
                    <TextField
                        id="domain description"
                        name="domain description"
                        label="Domain description"
                        variant="outlined"
                        disabled={isIgnoreDomainDescription}
                        multiline
                        maxRows={7}
                        onChange={event => onDomainDescriptionChange(event.target.value)}
                        value={domainDescription}
                        spellCheck="false">
                    </TextField>
                </Box >
                
                <Stack direction="row" justifyContent="space-between" paddingX={1} paddingY={"8px"}>
                    <Stack direction="row" spacing={2}>
                        <Button variant="contained" sx={{textTransform: "none"}} disableElevation startIcon={<AutoFixHighIcon/>} onClick={() => onSuggestItems(UserChoice.ENTITIES, null, null)}>{ capitalizeString("Suggest entities") }</Button>
                        <Button variant="contained" sx={{textTransform: "none"}} disableElevation startIcon={<AddIcon/>} onClick={onAddNewEntity}>{ capitalizeString("Add new entity") }</Button>
                    </Stack>

                    <Stack direction="row" spacing={2}>
                        <Button variant="contained" sx={{textTransform: "capitalize"}} disableElevation startIcon={<AutoFixHighIcon/>} onClick={() => { setTabValue('1'); onSummaryButtonClick() }}>Summary 1</Button>
                        <Button variant="contained" sx={{textTransform: "capitalize"}} disableElevation startIcon={<AutoFixHighIcon/>} onClick={() => { setTabValue('2'); onSummaryDescriptionsClick() }}>Summary 2</Button>
                        <Button variant="contained" sx={{textTransform: "none"}} disableElevation startIcon={<HighlightIcon/>} onClick={onHighlightSelectedItems}>{capitalizeString("Highlight original text")}</Button>
                    </Stack>

                    <Stack direction="row" spacing={2}>
                        <Button variant="contained" disableElevation sx={{textTransform: "capitalize"}} startIcon={<UploadIcon/>} onClick={() => onImportButtonClick()}>
                            Import
                        </Button>

                        <Button variant="contained" disableElevation sx={{textTransform: "capitalize"}} startIcon={<DownloadIcon/>} onClick={() => console.log("Not implemented")}>
                            Export
                        </Button>
                    </Stack>
                </Stack>
            </>
        )
    }

    const handleChange = (event: React.SyntheticEvent, newValue: string) =>
    {
        setTabValue(newValue);
    };

    const topBarWidth = 100 - sidebarWidthPercentage
    const heightPx = 360

    return (
        <Box sx={{ width: `${topBarWidth}%`, height: `${heightPx}px`, overflow: 'auto', typography: 'body1' }}>
            <TabContext value={tabValue}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={handleChange}>
                        <Tab sx={{textTransform: "capitalize"}} label="Main" value="0" />
                        <Tab sx={{textTransform: "capitalize"}} label="Summary 1" value="1" />
                        <Tab sx={{textTransform: "capitalize"}} label="Summary 2" value="2" />
                        <Tab sx={{textTransform: "capitalize"}} label="Settings" value="3" />
                    </TabList>
                </Box>

                <TabPanel value="0">
                    { showMainLayout() }
                </TabPanel>

                <TabPanel value="1">
                    { isLoadingSummary1 ? <CircularProgress /> :
                        <Stack spacing={2}>
                            { showSummary1() }
                        </Stack>
                    }
                </TabPanel>

                <TabPanel value="2">
                    <Stack spacing={2}>
                        { showSummary2() }
                    </Stack>
                    { isLoadingSummaryDescriptions && <CircularProgress /> }
                    
                </TabPanel>

                <TabPanel value="3">
                    <Stack>
                        <FormLabel > Domain description filtering </FormLabel >
                        <RadioGroup row defaultValue="Syntactit">
                            <FormControlLabel value="None" control={<Radio />} label="None" />
                            <FormControlLabel value="Semantic" control={<Radio />} label="Semantic" />
                            <FormControlLabel value="Syntactit" control={<Radio />} label="Syntactic" />
                        </RadioGroup>

                        <p></p>
                        <Divider></Divider>
                        <p></p>

                        

                        <FormControlLabel label="Ignore domain description"
                            control={
                                <Checkbox checked={isIgnoreDomainDescription} onChange={onIgnoreDomainDescriptionChange}/>
                                }/>
                        
                        <p></p>
                        <Divider></Divider>
                        <p></p>

                        {/* {TODO: Make something more like this: https://mui.com/material-ui/react-slider/#slider-with-input-field} */}
                        <Typography id="input-slider" gutterBottom>
                            Temperature
                        </Typography>
                        <Slider aria-label="Temperature" defaultValue={0} valueLabelDisplay="auto" 
                                shiftStep={0.1} step={0.1} marks min={0} max={2}
                                sx={{ width: "200px" }}/>
                    </Stack>
                </TabPanel>
            </TabContext>

            <Divider sx={{bottom: "600px"}} absolute={true} ></Divider>
        </Box>
    )
}

export default Topbar;