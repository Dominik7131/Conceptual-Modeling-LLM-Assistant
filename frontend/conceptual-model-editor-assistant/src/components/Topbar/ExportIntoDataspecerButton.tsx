import { Button } from "@mui/material"
import DownloadIcon from '@mui/icons-material/Download';
import { Attribute, AttributeJson, ConceptualModelJson, EdgeData, Class, ClassJson, Field, GeneralizationJson, ItemType, NodeData, Association, RelationshipJson } from "../../interfaces";
import { Node, Edge } from "reactflow";
import { edgesState, importedFileNameState, isDialogEnterIRIOpenedState, isDialogImportState, nodesState } from "../../atoms";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { convertConceptualModelToJson } from "../../utils/export";
import { DATASPECER_MODEL_URL, HEADER } from "../../utils/urls";


const ExportJSONButton: React.FC = (): JSX.Element =>
{
    const setIsDialogEditModelIDOpened = useSetRecoilState(isDialogEnterIRIOpenedState)
    const setIsDialogImport = useSetRecoilState(isDialogImportState)

    // const importedFileName = useRecoilValue(importedFileNameState)
    // const export_name = `${useRecoilValue(modelIDState)}.json`
    // const export_file_name = importedFileName === "" ? export_name : `${importedFileName}-${export_name}`

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
        Export into Dataspecer
    </Button>
    )
}

export default ExportJSONButton