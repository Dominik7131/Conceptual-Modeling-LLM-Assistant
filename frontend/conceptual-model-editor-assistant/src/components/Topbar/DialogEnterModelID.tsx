import { Button, Stack, TextField, Typography } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { importConceptualModelFromJSON } from "../../utils/import";
import { HEADER } from "../../definitions/urls";
import { convertConceptualModelToJSON } from "../../utils/serialization";
import { edgesState, modelIDState, nodesState } from "../../atoms/conceptualModel";
import { isDialogEnterIRIOpenedState, isDialogImportState } from "../../atoms/dialogs";


const DialogEnterModelID: React.FC = (): JSX.Element =>
{
    const nodes = useRecoilValue(nodesState)
    const edges = useRecoilValue(edgesState)
    const setNodes = useSetRecoilState(nodesState)
    const setEdges = useSetRecoilState(edgesState)
    
    const modelD = useRecoilValue(modelIDState)
    const setModelD = useSetRecoilState(modelIDState)

    const [enteredURL, setEnteredURL] = useState(modelD)
    const [isOpened, setIsOpened] = useRecoilState(isDialogEnterIRIOpenedState)
    const isDialogImport = useRecoilValue(isDialogImportState)

    const buttonVariation = "contained"
    const textTransform = "none"

    const iriIdentificator = "iri="


    const getIDFromURL = (url: string): string =>
    {
        const startIndex = url.indexOf(iriIdentificator)

        if (startIndex === -1)
        {
            return ""
        }

        // Extract the substring starting from "iri=" to the end of the URL
        const iriLength = iriIdentificator.length
        const substring = url.substring(startIndex + iriLength)
        return substring
    }


    const onImport = () =>
    {
        onClose()

        const fetchOptions = { method: "GET" }

        fetch(enteredURL, fetchOptions)
            .then(response => response.json())
            .then(json => importConceptualModelFromJSON(json, setNodes, setEdges))
        
        const modelID = getIDFromURL(enteredURL)
        setModelD(modelID)
    }


    const onExport = () =>
    {
        onClose()
        const conceptualModelJson = convertConceptualModelToJSON(nodes, edges)
        const content = JSON.stringify(conceptualModelJson)

        const fetchOptions = { method: "PUT", headers: HEADER, body: content }
        console.log(content)
        fetch(enteredURL, fetchOptions)
    }


    const onClose = () =>
    {
        setIsOpened(false)
    }


    return (
        <Dialog
            open={isOpened}
            fullWidth={true}
            maxWidth={"xl"}
            scroll={"paper"}
            onClose={onClose}
        >
            <DialogTitle>
                <Stack spacing={2}>
                    <Typography variant="h5"> Enter model URL </Typography>
                </Stack>
            </DialogTitle>

            <DialogContent dividers={true}>
                <TextField margin="dense" fullWidth variant="standard" spellCheck={false} label={"Model URL"} multiline
                        onChange={ event => setEnteredURL(event.target.value) }
                        value={ enteredURL }
                    />
            </DialogContent>

            <DialogActions>

                { isDialogImport ? 
                    <Button
                        variant={ buttonVariation }
                        color="success"
                        disableElevation
                        sx={{ textTransform: textTransform }}
                        onClick={ onImport }>
                            Import
                    </Button>
                    :
                    <Button
                        variant={ buttonVariation }
                        color="success"
                        disableElevation
                        sx={{ textTransform: textTransform }}
                        onClick={ onExport }>
                            Export
                    </Button>
                }

                <Button
                    variant={ buttonVariation }
                    color="error"
                    disableElevation
                    sx={{ textTransform: textTransform }}
                    onClick={ onClose }>
                        Close
                </Button>

            </DialogActions>
        </Dialog>
    )
}

export default DialogEnterModelID