
interface props {
    domainDescription : string
    isShowOverlay : boolean
    setIsShowOverlay : React.Dispatch<React.SetStateAction<boolean>>
    inferenceIndexes : number[]
}

const Overlay: React.FC<props> = ({domainDescription, isShowOverlay, setIsShowOverlay, inferenceIndexes}) =>
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

    const showOverlay = () =>
    {
        return (
            isShowOverlay &&
            <div className="overlay">
                <div>
                    <p><button className="close" onClick={ () => setIsShowOverlay(_ => false)}>close</button></p>

                    {/* TODO: Add element for editing the current suggestion */}
                    {/* <div>
                        <p>Edit: </p>
                        <p>Name:</p>
                        <p>Inference:</p>
                    </div> */}
                    
                    {inferenceIndexes.length === 0 && <p><b>Warning: Inference not found</b></p> }
                    { highlightInference(inferenceIndexes) }
                </div>
            </div>)
    }

    return (
        <div>{ showOverlay() }</div>
    )
}

export default Overlay