
interface props {
    domainDescription : string
    isShowOverlay : boolean
    setIsShowOverlay : React.Dispatch<React.SetStateAction<boolean>>
    isShowEdit : boolean
    setIsShowEdit : React.Dispatch<React.SetStateAction<boolean>>
    suggestedItem : Entity|Attribute|Relationship
    inferenceIndexes : number[]
}

const Overlay: React.FC<props> = ({domainDescription, isShowOverlay, setIsShowOverlay, isShowEdit, setIsShowEdit, suggestedItem, inferenceIndexes}) =>
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
            <span>
                { texts.map((text, index) =>
                (
                    index % 2 === 0 ? <span key={index}>{text}</span> :
                    <span id={`highlightedInference-${index}`} className="highlight" key={index}>{text}</span>
                ))}
            </span>
        )
    }

    const showEditSuggestion = () =>
    {
        {/* TODO: Add element for editing the current suggestion */}
        return (
            <div>
                <p>Edit: </p>
                <p>Name:</p>
                <p>Inference:</p>
            </div>
        )
    }

    const showOverlay = () =>
    {
        if (isShowEdit)
        {
            // const dictionary : Entity|Attribute|Relationship = { "name": "n", "description": "", "inference": "i", "inference_indexes": [], "data_type": ""}

            // TODO: Probably get as argument `userChoice` to know which object we are editing
            const attribute = (suggestedItem as Attribute)

            return (
                <div className="overlay">
                    <div>
                        <p><button className="close" onClick={ () => setIsShowEdit(_ => false)}>close</button></p>
                        <p>Name: {suggestedItem['name']} </p>
                        <p>Inference: {suggestedItem['inference']}</p>
                        { attribute && <p>Data type: {attribute['data_type']}</p>}
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
                            <button className="save" onClick={ () => setIsShowEdit(_ => false)}>Save</button>
                            <button className="cancel" onClick={ () => setIsShowEdit(_ => false)}>Cancel</button>
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
                        <p><button className="close" onClick={ () => { setIsShowOverlay(_ => false) }}>close</button></p>
                        {inferenceIndexes.length === 0 && <p><b>Warning: Inference not found</b></p> }
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