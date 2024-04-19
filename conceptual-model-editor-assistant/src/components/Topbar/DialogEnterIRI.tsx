import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';
import { isDialogEnterIRIOpenedState } from '../../atoms';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { ConceptualModelJson } from '../../interfaces';
import { JSON_MODEL_FROM_IRI_URL } from '../../hooks/useUtility';


interface Props
{
    onImport: (conceptualModelJson: ConceptualModelJson) => void
}

const DialogEnterIRI: React.FC<Props> = ({ onImport }): JSX.Element =>
{
    const [enteredIRI, setEnteredIRI] = useState("")
    const [isOpened, setIsOpened] = useRecoilState(isDialogEnterIRIOpenedState)


    const onEnter = () =>
    {
        onClose()

        fetch(`${JSON_MODEL_FROM_IRI_URL}${enteredIRI}`)
            .then(response => response.json())
            .then(json => onImport(json))   
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
                    <Typography variant="h5"> Enter IRI </Typography>
                </Stack>
            </DialogTitle>

            <DialogContent dividers={true}>
                <TextField margin="dense" fullWidth variant="standard" spellCheck={false} label={"IRI"} multiline
                        // sx={{'& textarea': {color: color} }}
                        onChange={ event => setEnteredIRI(_ => event.target.value) }
                        value={ enteredIRI }
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

export default DialogEnterIRI