

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
            <div>
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
            </div>
        )
    }

    const showAttribute = (attribute, index) =>
    {
        return (
            <p>Name: {attribute.name} <br />
               Inference: {attribute.inference} <br />
               Data type: {attribute.data_type} <br />
               <button className="btn" id={`button${index}`} onClick={(event) => addAttributesToNode(event)}>Add</button>
               <button className="btn" id={`button${index}`} onClick={(event) => editSuggestion(event, true)}>Edit</button>
            </p>
        )
    }

    const showRelationship = (relationship, index) =>
    {
        return (
            <p>Name: {relationship.name} <br />
               Inference: {relationship.inference} <br />
               Source: {relationship.source} <br />
               Target: {relationship.target} <br />
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
        <div className="sidebar">{showTextOnSidebar()}</div>
    )
}