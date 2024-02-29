
interface props {
    isLoading : boolean,
    entities : Entity[],
    attributes : Attribute[],
    relationships : Relationship[],
    addEntity : (event : React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
    addAttributesToNode : (event : React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
    addRelationshipsToNodes : (event : React.MouseEvent<HTMLButtonElement, MouseEvent>, relationship : Relationship) => void,
    showInference : (event : React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
}

const Sidebar: React.FC<props> = ({isLoading, entities, attributes, relationships, addEntity, addAttributesToNode, addRelationshipsToNodes, showInference}) =>
{
    const showTextOnSidebar = () =>
    {
        return (
            <span>
                {entities.map((entity, index) => 
                    <span key={entity.name}>
                        {showEntity(entity, index)}
                    </span>
                )}

                {attributes.map((attribute, index) => 
                    <span key={attribute.name}>
                        {showAttribute(attribute, index)}
                    </span>
                )}

                {relationships.map((relationship, index) => 
                    <span key={index}>
                        {showRelationship(relationship, index)}
                    </span>
                )}

                {isLoading && <p>Loading...</p>}
            </span>
        )
    }

    const showEntity = (entity : Entity, index : number) =>
    {
        return (
            <p><strong>Name:</strong> {entity.name} <br />
               <strong>Inference:</strong> {entity.inference} <br />
               <button className="btn" id={`button${index}`} onClick={(event) => addEntity(event)}>Add</button>
               <button className="btn" id={`button${index}`} onClick={(event) => editSuggestion(event, true)}>Edit</button>
               <button className="btn" id={`button${index}`} onClick={(event) => showInference(event)}>Show</button>
            </p>
        )
    }

    const showAttribute = (attribute : Attribute, index : number) =>
    {
        return (
            <p><strong>Name:</strong> {attribute.name} <br />
               <strong>Inference:</strong> {attribute.inference} <br />
               <strong>Data type:</strong> {attribute.data_type} <br />
               <button className="btn" id={`button${index}`} onClick={(event) => addAttributesToNode(event)}>Add</button>
               <button className="btn" id={`button${index}`} onClick={(event) => editSuggestion(event, true)}>Edit</button>
               <button className="btn" id={`button${index}`} onClick={(event) => showInference(event)}>Show</button>
            </p>
        )
    }

    const showRelationship = (relationship : Relationship, index : number) =>
    {
        return (
            <p><strong>Name:</strong> {relationship.name} <br />
               <strong>Inference:</strong> {relationship.inference} <br />
               <strong>Source:</strong> {relationship.source_entity} <br />
               <strong>Target:</strong> {relationship.target_entity} <br />
               <button className="btn" id={`button${index}`} onClick={(event) => addRelationshipsToNodes(event, relationship)}>Add</button>
               <button className="btn" id={`button${index}`} onClick={(event) => editSuggestion(event, false)}>Edit</button>
               <button className="btn" id={`button${index}`} onClick={(event) => showInference(event)}>Show</button>
            </p>
        )
    }

    const editSuggestion = (event : React.MouseEvent<HTMLButtonElement, MouseEvent>, isAttributes : boolean) =>
    {
        // In a new window show form in which user can change the corresponding fields
    }

    return (
        <div className="sideBar">{showTextOnSidebar()}</div>
    )
}

export default Sidebar