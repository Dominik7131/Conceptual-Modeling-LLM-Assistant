import Button from "@mui/material/Button"
import UploadIcon from '@mui/icons-material/Upload'
import { useSetRecoilState } from "recoil"
import { importedFileNameState } from "../../atoms/conceptualModel"
import { isDialogEnterIRIOpenedState, isDialogImportState } from "../../atoms/dialogs"


const ImportFromDataspecerButton: React.FC = (): JSX.Element =>
{
    const setIsOpened = useSetRecoilState(isDialogEnterIRIOpenedState)
    const setIsDialogImport = useSetRecoilState(isDialogImportState)

    const setImportedFileName = useSetRecoilState(importedFileNameState)
    
    const buttonText = "Import from Dataspecer"


    const handleClick = () =>
    {
        setIsOpened(true)
        setIsDialogImport(true)
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
                { buttonText }
            </Button>
        </>
    )
}

export default ImportFromDataspecerButton