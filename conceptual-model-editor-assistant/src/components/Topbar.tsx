import { useState } from "react"
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { UserChoice } from "../App";


interface Props
{
    onIgnoreDomainDescriptionChange : () => void
    onImportButtonClick : () => void
    onPlusButtonClick : (event : React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
    onSummaryButtonClick : () => void
    OnClickAddNode : (nodeName : string) => void
    domainDescription : string
    onDomainDescriptionChange : (newDomainDescriptionText : string) => void
}

const Topbar: React.FC<Props> = ({onIgnoreDomainDescriptionChange, onImportButtonClick, onPlusButtonClick, onSummaryButtonClick, domainDescription, OnClickAddNode, onDomainDescriptionChange}) =>
{
    const [insertedNodeNameText, setInsertedNodeNameText] = useState<string>("")

    return (
        <div className="topBar">
            <div className="container">
                <FormGroup>
                    <FormControlLabel
                        control={
                            <Checkbox
                                defaultChecked
                                onClick={() => onIgnoreDomainDescriptionChange()}/>}
                                label="Use domain description"/>
                </FormGroup>

                <Stack
                    spacing={1}
                    className=""
                    direction="row"
                    paddingX={1}
                    >
                    <Button
                        variant="contained"
                        disableElevation
                        onClick={() => onImportButtonClick()}
                        size="small"
                        >
                        Import
                    </Button>

                    <Button
                        variant="contained"
                        size="small"
                        disableElevation
                        >
                        Export
                    </Button>
                </Stack>
            </div>
            <Box
                className="domainTextContainers"
                component="form"
                sx={{
                  '& .MuiTextField-root': { m: 1, width: '98.9%' },
                }}
                noValidate
                autoComplete="off"
            >
                <TextField
                    // https://react.dev/reference/react-dom/components/textarea
                    // Auto re-size is disabled in index.css: textarea { resize: none;}
                    name="story"
                    label="Domain description"
                    variant="outlined"
                    multiline
                    maxRows={7}
                    onChange={event => onDomainDescriptionChange(event.target.value)}
                    value={domainDescription}
                    spellCheck="false">
                </TextField>
            </Box >
            
            <div className="container">
                <Stack
                    direction="row"
                    paddingX={1}
                    spacing={2}
                >
                    <Button variant="contained" disableElevation onClick={(event) => onPlusButtonClick(event)}>{UserChoice.ENTITIES}</Button>
                    <Button variant="contained" disableElevation onClick={(event) => onPlusButtonClick(event)}>{UserChoice.ATTRIBUTES}</Button>
                    <Button variant="contained" disableElevation onClick={(event) => onPlusButtonClick(event)}>{UserChoice.RELATIONSHIPS}</Button>
                    <Button variant="contained" disableElevation onClick={onSummaryButtonClick}>Summary</Button>
                </Stack>

                <Stack
                    direction="row"
                    paddingX={1}
                    spacing={2}
                >
                    <Button
                        variant="contained"
                        size="small"
                        disableElevation
                        onClick={() => OnClickAddNode(insertedNodeNameText)}>Add node</Button>
                    <TextField variant="standard"
                        placeholder="Insert node name to add"
                        value={insertedNodeNameText}
                        rows={1}
                        onChange={(event) => setInsertedNodeNameText(event.target.value)}>
                    </TextField>
                </Stack>
            </div>
        </div>
    )
}

export default Topbar;