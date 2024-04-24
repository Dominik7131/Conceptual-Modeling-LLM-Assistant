import { Button } from "@mui/material"
import DownloadIcon from '@mui/icons-material/Download';
import { Attribute, AttributeJson, ConceptualModelJson, EdgeData, Entity, EntityJson, Field, GeneralizationJson, ItemType, NodeData, Relationship, RelationshipJson } from "../../interfaces";
import { Node, Edge } from "reactflow";
import { edgesState, importedFileNameState, nodesState } from "../../atoms";
import { useRecoilValue } from "recoil";


const ExportJSONButton: React.FC = (): JSX.Element =>
{
    return (
        <Button
            variant="contained"
            color="secondary"
            disableElevation
            sx={{textTransform: "none"}}
            startIcon={ <DownloadIcon/> }
            onClick={ () => alert("Not implemented") }>
        Export into Dataspecer
    </Button>
    )
}

export default ExportJSONButton