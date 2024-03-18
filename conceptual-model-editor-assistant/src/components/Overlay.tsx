import { useState } from "react"

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

    const [description, setDescription] = useState<string>("")

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
            <span>
                { texts.map((text, index) =>
                (
                    index % 2 === 0 ? <span key={index}>{text}</span> :
                    <span id={`highlightedInference-${index}`} className="highlight" key={index}>{text}</span>
                ))}
            </span>
        )
    }

    const onClickEditPlusButton = () =>
    {
        console.log("x")
    }

    const showOverlay = () =>
    {
        if (isShowEdit)
        {
            // const dictionary : Entity|Attribute|Relationship = { "name": "n", "description": "", "inference": "i", "inference_indexes": [], "data_type": ""}

            // TODO: Probably get as argument `userChoice` to know which object we are editing
            // const attribute = (suggestedItem as Attribute)
            const something : Entity|Attribute|Relationship = suggestedItem

            const attribute = (suggestedItem as Attribute)
            const relationship = (suggestedItem as Relationship)
            const entity = (suggestedItem as Entity)

            const isDataType = attribute.dataType != null
            const isSourceEntity = relationship.source != null
            const isTargetEntity = relationship.target != null

            return (
                <div className="overlay">
                    <div className="editContainer">
                        <p><button className="close" onClick={onEditClose}>close</button></p>

                        <p>
                            Name:
                            <textarea
                                id="textAreaEdit1"
                                name="nameEdit"
                                value={suggestedItem["name"]}
                                spellCheck="false">
                            </textarea>
                        </p>
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

                        <p>
                            <button className="save" onClick={onEditClose}>Save</button>
                            <button className="cancel" onClick={onEditClose}>Cancel</button>
                        </p>
                    </div>
                </div>
            )
        }
        else if (isShowOverlay)
        {
            return (
                <div className="overlay">
                    <div>
                        <p><button className="close" onClick={ () => { onOverlayClose(_ => false) }}>close</button></p>
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