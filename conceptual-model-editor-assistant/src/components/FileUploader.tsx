import { ChangeEvent } from "react";
import Button from "@mui/material/Button";
import UploadIcon from '@mui/icons-material/Upload';
import { ConceptualModelJson, Entity, Field, ItemType } from "../interfaces";
import { useSetRecoilState } from "recoil";
import { edgesState, nodesState } from "../atoms";
import { Node, Edge } from 'reactflow';
import useConceptualModel from "../hooks/useConceptualModel";


const FileUploader: React.FC = () =>
{
    const { onImport } = useConceptualModel()
    

    const handleFileUpload = (changeEvent: ChangeEvent<HTMLInputElement>) =>
    {
        if (!changeEvent.target.files)
        {
            return
        }
        const file = changeEvent.target.files[0]

        const reader = new FileReader()
        reader.onload = (event) =>
        {
            if (!event?.target?.result)
            {
                return
            }

            const { result } = event.target
            let jsonObject = JSON.parse(result as string)
            onImport(jsonObject)
        }
        reader.readAsText(file)
    }

    return (
        <Button
            variant="contained"
            disableElevation
            sx={{ textTransform: "capitalize" }}
            startIcon={ <UploadIcon/> }
            component="label"
        >
            Import
            <input
                type="file"
                accept=".json"
                hidden
                onChange={ handleFileUpload }
            />
        </Button>
    )
}

export default FileUploader