

export default function TopBar({
    handleIgnoreDomainDescriptionChange,
    onPlusButtonClick,
    onSummaryButtonClick,
    summaryData,
    capitalizeString,
    onDomainDescriptionChange,
    domainDescription,
    nodes
})
{
    const FormateSummaryObject = (entityObject) =>
    {
        return (
            <li>
                <p><strong>{capitalizeString(entityObject.entity)}</strong></p>
                <ul>
                    <li>
                        <strong>Attributes</strong>
                        <ul>
                            {entityObject.attributes.map((attribute, index) =>
                                <li key={`${attribute.name}-${index}`}>
                                    <strong>{attribute.name}</strong>: {attribute.description}
                                </li>
                                )
                            }
                        </ul>
                    </li>

                    <li>
                        <strong>Relationships</strong>
                        <ul>
                            {entityObject.relationships.map((relationship, index) =>
                                <li key={`${relationship.name}-${index}`}>
                                    <strong>{relationship.name}</strong>: {relationship.description}
                                </li>
                                )
                            }
                        </ul>
                    </li>
                </ul>
            </li>
        )
    }


    const FormatSummary = () =>
    {
        return (
            <ol>
                    {summaryData.map((object, index) =>
                        (   <span key={`${object.name}-${index}`}>
                                {FormateSummaryObject(object)}
                            </span>
                        ))
                    }
            </ol>
        )
    }


    const FormatHighlights = () =>
    {
        let inferenceIndexes = []

        for (let i = 0; i < nodes.length; i++)
        {
            for (let j = 0; j < nodes[i].data.attributes.length; j++)
            {
                inferenceIndexes.push(nodes[i].data.attributes[j].inference_indexes)
            }
        }

        // console.log("Inference indexes: ")
        // console.log(inferenceIndexes)

        const sortedInferenceIndexes = inferenceIndexes.sort(([a, b], [c, d]) => a - c)
        // console.log("Sorted inference indexes: ")
        // console.log(sortedInferenceIndexes)

        let texts = []
        let lastIndex = 0

        for (let i = 0; i < sortedInferenceIndexes.length; i++)
        {
            const start = domainDescription.slice(lastIndex, sortedInferenceIndexes[i][0])
            // console.log("Start: from: " + lastIndex + " to: " + sortedInferenceIndexes[i][0])
            texts.push(start)
            const mid = domainDescription.slice(sortedInferenceIndexes[i][0], sortedInferenceIndexes[i][1])
            texts.push(mid)
            lastIndex = sortedInferenceIndexes[i][1]
        }

        const end = domainDescription.slice(lastIndex)
        if (end)
        {
            texts.push(end)
        }

        // console.log("Texts: ")
        // console.log(texts)

        return (
            <div>
                {
                    texts.map((text, index) =>
                    (
                        index % 2 === 0 ? <span key={index}>{text}</span> : <span className="green" key={index}>{text}</span>
                    ))
                }
            </div>
        )
    }

    return (
        <div className="topBar">
            <label className="domainDescriptionLabel" htmlFor="story">Domain description: </label>
            <input type="checkbox" id="isIgnoreDomainDescription" defaultChecked onClick={() => handleIgnoreDomainDescriptionChange()}></input>
            <br />
            <br />
            <textarea id="domainDescriptionText" name="story" rows="8" cols="70"
                onKeyUp={(event) => onDomainDescriptionChange(event)}
                defaultValue={"We know that courses have a name and a specific number of credits. Each course can have one or more professors, who have a name. Professors could participate in any number of courses. For a course to exist, it must aggregate, at least, five students, where each student has a name. Students can be enrolled in any number of courses. Finally, students can be accommodated in dormitories, where each dormitory can have from one to four students. Besides, each dormitory has a price."}></textarea>
            <br />
            <br />
            <button className="plusButton" onClick={(event) => onPlusButtonClick(event)}>+Attributes</button>
            <button className="plusButton" onClick={(event) => onPlusButtonClick(event)}>+Relationships</button>
            <button className="plusButton" onClick={() => onSummaryButtonClick()}>Summary</button>
            {/* <button className="plusButton" onClick={() => onHighlightButtonClick()}>Highlight</button> */}
            {FormatSummary()}
            {FormatHighlights()}
        </div>
    )
}