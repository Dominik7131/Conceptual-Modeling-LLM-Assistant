import { ChangeEvent } from "react"

interface props {
    handleIgnoreDomainDescriptionChange : () => void
    onImportButtonClick : () => void
    onPlusButtonClick : (event : React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
    onSummaryButtonClick : () => void
    summaryData : SummaryObject[]
    capitalizeString : (string : string) => string
    domainDescription : string
    nodeToAddName : string
    OnClickAddNode : any
    setNodeToAddName : React.Dispatch<React.SetStateAction<string>>
    setDomainDescription : React.Dispatch<React.SetStateAction<string>>
    inferenceIndexes : number[][]
}

const Topbar: React.FC<props> = ({handleIgnoreDomainDescriptionChange, onImportButtonClick, onPlusButtonClick, onSummaryButtonClick, summaryData, capitalizeString,
    domainDescription, nodeToAddName, setNodeToAddName, OnClickAddNode, setDomainDescription, inferenceIndexes}) =>
{

    const handleNodeNameChange = (event : ChangeEvent<HTMLInputElement>) =>
    {
        setNodeToAddName(_ => event.target.value)
    }

    return (
        <div className="topBar">

            <div className="container">
                <div className="domainContainer">
                    <label className="domainDescriptionLabel" htmlFor="story">Domain description: </label>
                    <input type="checkbox" id="isIgnoreDomainDescription" defaultChecked onClick={() => handleIgnoreDomainDescriptionChange()}></input>
                </div>

                <div className="buttonsContainer">
                    <button onClick={() => onImportButtonClick()}>Import</button>
                    <button>Export</button>
                </div>
            </div>
            <div className="domainTextContainer">
                <textarea
                    // https://react.dev/reference/react-dom/components/textarea
                    // Auto re-size is disabled in index.css: textarea { resize: none;}
                    id="domainDescriptionText"
                    name="story"
                    onChange={e => setDomainDescription(e.target.value)}
                    value={domainDescription}>
                </textarea>
            </div >
            
            <div className="container">
                <div className="plusButtonsContainer">
                    <button className="plusButton" onClick={(event) => onPlusButtonClick(event)}>+Entities</button>
                    <button className="plusButton" onClick={(event) => onPlusButtonClick(event)}>+Attributes</button>
                    <button className="plusButton" onClick={(event) => onPlusButtonClick(event)}>+Relationships</button>
                </div>

                <div className="buttonsContainer">
                    <button className="addNodeButton" onClick={(event) => OnClickAddNode()}>Add node </button>
                    <input
                        name="nodeName"
                        placeholder="Insert node name to add"
                        value={nodeToAddName}
                        onChange={(event) => handleNodeNameChange(event)}>
                    </input>
                </div>
            </div>
        </div>
    )
}

export default Topbar;