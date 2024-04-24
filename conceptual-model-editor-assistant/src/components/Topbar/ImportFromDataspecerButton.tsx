import Button from "@mui/material/Button";
import UploadIcon from '@mui/icons-material/Upload';
import { ConceptualModelJson } from "../../interfaces";
import DialogEnterIRI from "./DialogEnterModelID";
import { importedFileNameState, isDialogEnterIRIOpenedState } from "../../atoms";
import { useSetRecoilState } from "recoil";


interface Props
{
    onImport: (conceptualModelJson: ConceptualModelJson) => void
}

const ImportFromDataspecerButton: React.FC<Props> = ({ onImport }): JSX.Element =>
{
    const setIsOpened = useSetRecoilState(isDialogEnterIRIOpenedState)
    const setImportedFileName = useSetRecoilState(importedFileNameState)

    const handleClick = () =>
    {
        setIsOpened(true)
        setImportedFileName("")
    }


    return (
        <>
            <Button
                variant="contained"
                color="primary"
                disableElevation
                sx={{ textTransform: "none" }}
                startIcon={ <UploadIcon/> }
                onClick={ handleClick }
            >
                Import from Dataspecer
            </Button>

            <DialogEnterIRI
                onImport={ onImport }
            />
        </>
    )
}

export default ImportFromDataspecerButton