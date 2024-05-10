import Button from "@mui/material/Button";
import UploadIcon from '@mui/icons-material/Upload';
import { ConceptualModelJson } from "../../interfaces";
import DialogEnterIRI from "./DialogEnterModelID";
import { edgesState, importedFileNameState, isDialogEnterIRIOpenedState, nodesState } from "../../atoms";
import { useSetRecoilState } from "recoil";
import { importConceptualModelFromJson } from "../../utils/import";


const ImportFromDataspecerButton: React.FC = (): JSX.Element =>
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

            <DialogEnterIRI/>
        </>
    )
}

export default ImportFromDataspecerButton