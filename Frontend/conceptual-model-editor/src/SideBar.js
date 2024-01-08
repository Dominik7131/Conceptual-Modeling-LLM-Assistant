

export default function SideBar({
    attributes,
    relationships,
    addAttributesToNode,
    addRelationshipsToNodes,
})
{

    const showTextOnSidebar = () =>
    {
        return (
            <span>
                {attributes.map((a, index) => 
                    <span key={a.name}>
                        {showAttribute(a, index)}
                    </span>
                )}

                {relationships.map((r, index) => 
                    <span key={index}>
                        {showRelationship(r, index)}
                    </span>
                )}
            </span>
        )
    }

    const showAttribute = (attribute, index) =>
    {
        return (
            <p><strong>Name:</strong> {attribute.name} <br />
               <strong>Inference:</strong> {attribute.inference} <br />
               <strong>Data type:</strong> {attribute.data_type} <br />
               <button className="btn" id={`button${index}`} onClick={(event) => addAttributesToNode(event)}>Add</button>
               <button className="btn" id={`button${index}`} onClick={(event) => editSuggestion(event, true)}>Edit</button>
            </p>
        )
    }

    const showRelationship = (relationship, index) =>
    {
        return (
            <p><strong>Name:</strong> {relationship.name} <br />
               <strong>Inference:</strong> {relationship.inference} <br />
               <strong>Source:</strong> {relationship.source} <br />
               <strong>Target:</strong> {relationship.target} <br />
               <button className="btn" id={`button${index}`} onClick={(event) => addRelationshipsToNodes(event, relationship)}>Add</button>
               <button className="btn" id={`button${index}`} onClick={(event) => editSuggestion(event, false)}>Edit</button>
            </p>
        )
    }

    const editSuggestion = (event, isAttributes) =>
    {
        // In a new window show form in which user can change the corresponding fields
    }

    return (
        <div className="sideBar">{showTextOnSidebar()}</div>
    )
}