import { ChangeEvent } from "react";
import Button from "@mui/material/Button";
import UploadIcon from "@mui/icons-material/Upload";
import { useSetRecoilState } from "recoil";
import { importConceptualModelFromJSON } from "../../utils/import";
import { nodesState, edgesState, importedFileNameState } from "../../atoms/conceptualModel";


const ImportJSONButton: React.FC = () =>
{
    const setNodes = useSetRecoilState(nodesState)
    const setEdges = useSetRecoilState(edgesState)
    
    const setImportedFileName = useSetRecoilState(importedFileNameState)

    const buttonText = "Import from JSON"


    const handleFileUpload = (changeEvent: ChangeEvent<HTMLInputElement>) =>
    {
        if (!changeEvent.target.files)
        {
            return
        }
        const file = changeEvent.target.files[0]


        if (file.name.length < 5 || file.name.slice(-5) !== ".json")
        {
            const alertMessage = "Invalid file extension"
            alert(alertMessage)
            return   
        }


        const reader = new FileReader()
        reader.onload = (event) =>
        {
            if (!event?.target?.result)
            {
                return
            }

            const { result } = event.target
            let jsonObject = JSON.parse(result as string)
            importConceptualModelFromJSON(jsonObject, setNodes, setEdges)
        }
        reader.readAsText(file)

        setImportedFileName(file.name.slice(0, -5))

        // Clear the file name so the "onChange" handler fires again even when the same file is uploaded more than once
        changeEvent.target.value = ""
    }

    return (
        <Button
            variant="contained"
            color="primary"
            disableElevation
            sx={{ textTransform: "none" }}
            startIcon={ <UploadIcon/> }
            component="label"
        >
            { buttonText }

            <input
                type="file"
                accept=".json"
                hidden
                onChange={ handleFileUpload }
            />
        </Button>
    )
}

export default ImportJSONButton