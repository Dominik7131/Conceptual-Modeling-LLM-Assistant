import Button from "@mui/material/Button";
import UploadIcon from '@mui/icons-material/Upload';
import { useState } from "react";
import { ConceptualModelJson } from "../../interfaces";
import DialogEnterIRI from "./DialogEnterIRI";
import { isDialogEnterIRIOpenedState } from "../../atoms";
import { useSetRecoilState } from "recoil";


interface Props
{
    onImport: (conceptualModelJson: ConceptualModelJson) => void
}

const ImportIRIButton: React.FC<Props> = ({ onImport }): JSX.Element =>
{
    const setIsOpened = useSetRecoilState(isDialogEnterIRIOpenedState)


    const handleClick = () =>
    {
        setIsOpened(true)        
    }


    return (
        <>
            <Button
                variant="contained"
                disableElevation
                sx={{ textTransform: "none" }}
                startIcon={ <UploadIcon/> }
                onClick={ handleClick }
            >
                Import from IRI
            </Button>

            <DialogEnterIRI
                onImport={ onImport }
            />
        </>
    )
}

export default ImportIRIButton