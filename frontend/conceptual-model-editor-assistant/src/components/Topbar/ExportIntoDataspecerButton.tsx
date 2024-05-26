import { Button } from "@mui/material"
import DownloadIcon from "@mui/icons-material/Download";
import { isDialogEnterIRIOpenedState, isDialogImportState } from "../../atoms";
import { useSetRecoilState } from "recoil";


const ExportJSONButton: React.FC = (): JSX.Element =>
{
    const setIsDialogEditModelIDOpened = useSetRecoilState(isDialogEnterIRIOpenedState)
    const setIsDialogImport = useSetRecoilState(isDialogImportState)

    const buttonText = "Export into Dataspecer"


    const handleClick = () =>
    {
        setIsDialogEditModelIDOpened(true)
        setIsDialogImport(false)
    }

    
    return (
        <Button
            variant="contained"
            color="secondary"
            disableElevation
            sx={{textTransform: "none"}}
            startIcon={ <DownloadIcon/> }
            onClick={ handleClick }>
                { buttonText }
        </Button>
    )
}

export default ExportJSONButton