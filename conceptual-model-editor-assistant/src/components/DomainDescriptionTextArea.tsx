import { Box, Button, TextField } from "@mui/material"
import { useRecoilState, useRecoilValue } from "recoil"
import { domainDescriptionState, isIgnoreDomainDescriptionState } from "../atoms"
import useDomainDescription from "../hooks/useDomainDescription"
import { useEffect } from "react"


const DomainDescriptionTextArea: React.FC = ():JSX.Element =>
{
    const [domainDescription, setDomainDescription] = useRecoilState(domainDescriptionState)
    const isIgnoreDomainDescription = useRecoilValue(isIgnoreDomainDescriptionState)

    const { onDomainDescriptionChange } = useDomainDescription()


    const loadDomainDescriptionFromFile = () =>
    {
        console.log("Loading domain description from file")
        const domainDescriptionFileName = "input.txt"
        fetch(domainDescriptionFileName)
        .then((result) => result.text())
        .then((text) =>
        {
            setDomainDescription(_ => text)
        })
        .catch((e) => console.error(e));
    }

    useEffect(() =>
    {
        loadDomainDescriptionFromFile()
    }, [])


    return (
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
    </Box>
    )
}

export default DomainDescriptionTextArea