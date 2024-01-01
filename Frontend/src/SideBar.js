import { useState } from 'react';

export default function SideBar({
    attributes,
    addAttributesToNode,
    isMultiSelection,
    selectedNodes
})
{

    const [isSummaryCreated, setIsSummaryCreated] = useState(false);
    const [summary, setSummary] = useState("")

    const showTextOnSidebar = () =>
    {
        return (
            <div>
                {isMultiSelection && <p><button onClick={() => createSummary()}>Get summary</button></p>}

                {isSummaryCreated && <p>{summary}</p>}

                {attributes.map((a, index) => 
                    <span key={a.name}>
                    {showAttribute(a, index)}
                    </span>
                )}
            </div>
        )
    }

    const showAttribute = (attribute, index) =>
    {
        return (
            <p>Name: {attribute.name} <br /> Inference: {attribute.inference} <br /> Data type: {attribute.data_type} <br />
                <button className="btn" id={`button${index}`} onClick={(event) => addAttributesToNode(event)}>Add</button>
            </p>
        )
    }

    const createSummary = () =>
    {
        console.log(selectedNodes)
        console.log(selectedNodes.length)
        setIsSummaryCreated(true)
        let names = "Summary of: "

        for (let i = 0; i < selectedNodes.length; i++)
        {
            names += selectedNodes[i].data.title + ", "
        }

        names = names.slice(0, -2)
        setSummary(names)
    }

    return (
        <div className="sidebar">{showTextOnSidebar()}</div>
    )
}