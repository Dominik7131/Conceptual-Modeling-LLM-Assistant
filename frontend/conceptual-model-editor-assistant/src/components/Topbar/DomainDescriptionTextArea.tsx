import { Box, TextField } from "@mui/material"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { invalidateAllOriginalTextIndexes } from "../../utils/conceptualModel"
import { ChangeEvent } from "react"
import { domainDescriptionState, isIgnoreDomainDescriptionState } from "../../atoms/domainDescription"
import { nodesState, edgesState } from "../../atoms/conceptualModel"


const DomainDescriptionTextArea: React.FC = (): JSX.Element =>
{
    const [domainDescription, setDomainDescription] = useRecoilState(domainDescriptionState)
    const isIgnoreDomainDescription = useRecoilValue(isIgnoreDomainDescriptionState)

    const setNodes = useSetRecoilState(nodesState)
    const setEdges = useSetRecoilState(edgesState)

    const width = "100%"


    const handleChangeDomainDescription = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    {
        setDomainDescription(_ => event.target.value)
        invalidateAllOriginalTextIndexes(setNodes, setEdges)
    }


    return (
        <Box
            sx={{ "& .MuiTextField-root": { width: width, marginBottom: "20px"} }}
            component="form"
            noValidate
            autoComplete="off"
        >
            <TextField
                label="Domain description"
                variant="outlined"
                disabled={isIgnoreDomainDescription}
                multiline
                rows={7}
                onChange={event => { handleChangeDomainDescription(event) }}
                value={domainDescription}
                spellCheck="false">
            </TextField>
        </Box>
    )
}

export default DomainDescriptionTextArea