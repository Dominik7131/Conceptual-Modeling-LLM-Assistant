import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';
import { isDialogEnterIRIOpenedState, modelIDState } from '../../atoms';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { ConceptualModelJson } from '../../interfaces';


interface Props
{
    onImport: (conceptualModelJson: ConceptualModelJson) => void
}

const DialogEnterModelID: React.FC<Props> = ({ onImport }): JSX.Element =>
{
    const [enteredURL, setEnteredURL] = useState("")
    const [isOpened, setIsOpened] = useRecoilState(isDialogEnterIRIOpenedState)
    const setModelD = useSetRecoilState(modelIDState)

    const IRI_IDENTIFICATOR = "iri="

    const getIDFromURL = (url: string): string =>
    {
        const startIndex = url.indexOf(IRI_IDENTIFICATOR)

        if (startIndex === -1)
        {
            return ""
        }

        // Extract the substring starting from "iri=" to the end of the URL
        const iriLength = IRI_IDENTIFICATOR.length
        const substring = url.substring(startIndex + iriLength)
        return substring
    }

    const onEnter = () =>
    {
        onClose()

        fetch(enteredURL)
            .then(response => response.json())
            .then(json => onImport(json))
        
        const modelID = getIDFromURL(enteredURL)
        setModelD(modelID)
    }

    const onClose = () =>
    {
        setIsOpened(_ => false)
    }

    return(
        <Dialog
            open={isOpened}
            fullWidth={true}
            maxWidth={'xl'}
            scroll={'paper'}
            onClose={onClose}
        >
            <DialogTitle>
                <Stack spacing={2}>
                    <Typography variant="h5"> Enter model URL </Typography>
                </Stack>
            </DialogTitle>

            <DialogContent dividers={true}>
                <TextField margin="dense" fullWidth variant="standard" spellCheck={false} label={"Model ID"} multiline
                        // sx={{'& textarea': {color: color} }}
                        onChange={ event => setEnteredURL(_ => event.target.value) }
                        value={ enteredURL }
                    />
            </DialogContent>

            <DialogActions>
                <Button
                    variant="contained"
                    color="success"
                    disableElevation
                    sx={{ textTransform: "none" }}
                    onClick={ onEnter }>
                        Enter
                </Button>

                <Button
                    variant="contained"
                    color="error"
                    disableElevation
                    sx={{ textTransform: "none" }}
                    onClick={ onClose }>
                        Close
                </Button>

            </DialogActions>
        </Dialog>
    )
}

export default DialogEnterModelID