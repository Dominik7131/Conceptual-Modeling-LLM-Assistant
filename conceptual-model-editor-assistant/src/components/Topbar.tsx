import { useState } from "react"

interface Props
{
    onIgnoreDomainDescriptionChange : () => void
    onImportButtonClick : () => void
    onPlusButtonClick : (event : React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
    onSummaryButtonClick : () => void
    OnClickAddNode : (nodeName : string) => void
    domainDescription : string
    onDomainDescriptionChange : (newDomainDescriptionText : string) => void
}

const Topbar: React.FC<Props> = ({onIgnoreDomainDescriptionChange, onImportButtonClick, onPlusButtonClick, onSummaryButtonClick, domainDescription, OnClickAddNode, onDomainDescriptionChange}) =>
{
    const [insertedNodeNameText, setInsertedNodeNameText] = useState<string>("")

    return (
        <div className="topBar">

            <div className="container">
                <div className="domainContainer">
                    <label className="domainDescriptionLabel" htmlFor="story">Domain description: </label>
                    <input type="checkbox" id="isIgnoreDomainDescription" defaultChecked onClick={() => onIgnoreDomainDescriptionChange()}></input>
                </div>

                <div className="buttonsContainer">
                    <button className="importButton" onClick={() => onImportButtonClick()}>Import</button>
                    <button>Export</button>
                </div>
            </div>
            <div className="domainTextContainer">
                <textarea
                    // https://react.dev/reference/react-dom/components/textarea
                    // Auto re-size is disabled in index.css: textarea { resize: none;}
                    id="domainDescriptionText"
                    name="story"
                    onChange={event => onDomainDescriptionChange(event.target.value)}
                    value={domainDescription}
                    spellCheck="false">
                </textarea>
            </div >
            
            <div className="container">
                <div className="plusButtonsContainer">
                    <button className="plusButton" onClick={(event) => onPlusButtonClick(event)}>+Entities</button>
                    <button className="plusButton" onClick={(event) => onPlusButtonClick(event)}>+Attributes</button>
                    <button className="plusButton" onClick={(event) => onPlusButtonClick(event)}>+Relationships</button>
                    <button className="plusButton" onClick={onSummaryButtonClick}>+Summary</button>
                </div>

                <div className="buttonsContainer">
                    <button className="addNodeButton" onClick={() => OnClickAddNode(insertedNodeNameText)}>Add node </button>
                    <input
                        name="nodeName"
                        placeholder="Insert node name to add"
                        value={insertedNodeNameText}
                        onChange={(event) => setInsertedNodeNameText(event.target.value)}>
                    </input>
                </div>
            </div>
        </div>
    )
}

export default Topbar;