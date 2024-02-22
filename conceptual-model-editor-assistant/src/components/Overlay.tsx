
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

    const showOverlay = () =>
    {
        let inferenceStart = 0
        let inferenceEnd = 0

        if (inferenceIndexes.length != 0)
        {         
            inferenceStart = inferenceIndexes[0]
            inferenceEnd = inferenceIndexes[1]
        }

        return (
            isShowOverlay &&
            <div className="overlay">
                <div>
                    <p><button className="close" onClick={ () => setIsShowOverlay(_ => false)}>Close</button></p>
                    {inferenceIndexes.length == 0 && <p><b>Warning: Inference not found</b></p> }
                    <span>{domainDescription.slice(0, inferenceStart)}</span>
                    <span id="highlightedInference" className="highlight">{domainDescription.slice(inferenceStart, inferenceEnd)}</span>
                    <span>{domainDescription.slice(inferenceEnd, -1)}</span>
                </div>
            </div>)
    }

    return (
        <div>{ showOverlay() }</div>
    )
}

export default Overlay