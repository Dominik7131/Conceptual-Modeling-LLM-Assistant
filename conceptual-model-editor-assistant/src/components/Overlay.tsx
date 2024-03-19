import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { relative } from 'path';


interface Props
{
    domainDescription : string
    isShowOverlay : boolean
    onOverlayClose : React.Dispatch<React.SetStateAction<boolean>>
    isShowEdit : boolean
    onEditClose : () => void
    // onEditSave : () => void // TODO: Implement
    onEditPlus : (attributeName: string, field: string) => void
    suggestedItem : Entity|Attribute|Relationship
    inferenceIndexes : number[]
}

const Overlay: React.FC<Props> = ({domainDescription, isShowOverlay, onOverlayClose, isShowEdit, onEditClose, onEditPlus, suggestedItem, inferenceIndexes}) =>
{
    // TODO: try to find easy way to make substring bold
    // const substring = "information system"
    // domainDescription.replace(substring, '<b>' + substring + '</b>')

    const highlightInference = (inferenceIndexes : number[]) =>
    {
        let start = 0
        let texts = []

        for (let i = 0; i < inferenceIndexes.length; i += 2)
        {
            texts.push(domainDescription.slice(start, inferenceIndexes[i]))
            texts.push(domainDescription.slice(inferenceIndexes[i], inferenceIndexes[i + 1]))
            start = inferenceIndexes[i + 1]
        }

        texts.push(domainDescription.slice(start, -1))

        return (
            <Typography display={'inline'} position={'relative'}>
                { texts.map((text, index) =>
                (
                    index % 2 === 0 ? <span key={index}>{text}</span> :
                    <Typography display={'inline'} position={'relative'} id={`highlightedInference-${index}`} className="highlight" key={index}>{text}</Typography>
                ))}
            </Typography>
        )
    }

    const showOverlay = () =>
    {
        if (isShowEdit)
        {
            // TODO: Probably get as argument `userChoice` to know which object we are editing
            // const attribute = (suggestedItem as Attribute)

            const attribute = (suggestedItem as Attribute)
            const relationship = (suggestedItem as Relationship)
            const entity = (suggestedItem as Entity)

            const isDataType = attribute.dataType != null
            const isSourceEntity = relationship.source != null
            const isTargetEntity = relationship.target != null

            return (
                <div className="overlay">
                    <div className="editContainer">

                        <span className="editContainerElement">
                            <span>Name:</span>
                            <textarea
                                id="textAreaEdit1"
                                name="editTextArea"
                                value={suggestedItem["name"]}
                                spellCheck="false"
                            >
                                
                            </textarea>
                            {
                                suggestedItem["name"] !== "" ? null :
                                    <Button variant="contained"
                                        className="plusEditButton"
                                        onClick={() => {onEditPlus(suggestedItem.name, "name")}}>
                                        +
                                    </Button>
                            }
                            
                        </span>

                        <p>
                            Inference:
                            <textarea
                                id="textAreaEdit2"
                                name="inferenceEdit"
                                value={suggestedItem["inference"]}
                                spellCheck="false">
                            </textarea>
                        </p>
                        <p className="editContainerElement">
                            Description:
                            <textarea
                                id="textAreaEdit3"
                                className= "textGray"
                                name="descriptionEdit"
                                value={suggestedItem["description"]}
                                spellCheck="false">
                            </textarea>
                            <button
                                className="plusEditButton"
                                onClick={() => {onEditPlus(suggestedItem.name, "description")}}>
                                +
                            </button>
                        </p>

                        {
                            isDataType &&
                            <p>
                                Data type:
                                <textarea
                                    id="textAreaEdit3"
                                    name="dataTypeEdit"
                                    value={attribute["dataType"]}
                                    spellCheck="false">
                                </textarea>
                            </p>
                        }

                        {
                            <p className="editContainerElement">
                                Cardinality:
                                <textarea
                                id="textAreaEdit3"
                                className= "textGray"
                                name="cardinalityEdit"
                                value={attribute["cardinality"]}
                                spellCheck="false">
                                </textarea>
                                <button
                                    className="plusEditButton"
                                    onClick={() => {onEditPlus(suggestedItem.name, "cardinality")}}>
                                    +
                                </button>
                            </p>
                        }

                        {
                            isSourceEntity &&
                            <p>
                                Source:
                                <textarea
                                id="textAreaEdit4"
                                name="sourceEntityEdit"
                                value={relationship["source"]}
                                spellCheck="false">
                                </textarea>
                            </p>
                        }

                        {
                            isTargetEntity &&
                            <p>
                                Target:
                                <textarea
                                id="textAreaEdit5"
                                name="targetEntityEdit"
                                value={relationship["target"]}
                                spellCheck="false">
                                </textarea>
                            </p>
                        }



                        {/* { attribute && <p>Data type: {attribute['data_type']}</p>} */}
                        {/* <p>Data type: {suggestedItem['data_type']}</p> */}
                        {/* <span>
                            <form>
                                <div>
                                <input
                                    name='name'
                                    placeholder='Name'
                                />
                                <input
                                    name='age'
                                    placeholder='Age'
                                />
                                </div>
                            </form>
                        </span> */}

                        <Button variant="contained" onClick={onEditClose}>Save</Button>
                        <Button variant="contained" onClick={onEditClose}>Cancel</Button>

                    </div>
                </div>
            )
        }
        else if (isShowOverlay)
        {
            return (
                <div className="overlay">
                    <Button 
                        sx={{
                            position: 'fixed',
                            top: '20px',
                            left: '1420px',
                        }}
                        variant="contained" onClick={ () => { onOverlayClose(_ => false) }}>close</Button>

                    <div>
                        {inferenceIndexes.length === 0 && <p id="highlightedInference-1"><b>Warning: Unable to highlight inference</b></p> }
                        { highlightInference(inferenceIndexes) }
                    </div>
                </div>
            )
        }
        else
        {
            return (
                <div></div>
            )
        }
    }

    return (
        <div>{ showOverlay() }</div>
    )
}

export default Overlay