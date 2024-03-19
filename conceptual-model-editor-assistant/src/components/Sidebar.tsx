
interface Props
{
    isLoading : boolean,
    entities : Entity[],
    attributes : Attribute[],
    relationships : Relationship[],
    onAddEntity : (event : React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
    onAddAttributesToNode : (attribute : Attribute) => void,
    onAddRelationshipsToNodes : (relationship : Relationship) => void,
    onAddAsRelationship : (attribute : Attribute) => void,
    onAddAsAttribute : (relationship : Relationship) => void,
    onEditSuggestion : (event : React.MouseEvent<HTMLButtonElement, MouseEvent>, userChoice : string) => void,
    onShowInference : (event : React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
}

const Sidebar: React.FC<Props> = ({isLoading, entities, attributes, relationships, onAddEntity, onAddAttributesToNode, onAddRelationshipsToNodes, onAddAsRelationship, onAddAsAttribute, onEditSuggestion, onShowInference}) =>
{
    // TODO: Decompose the sidebar into more sub-components
    // E.g.:
    //  - one component for text such as name: ..., inference: ..., ...
    //  - one component for buttons such as "Add", "Edit", "Show inference"

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

                {isLoading && <p ><strong>Loading...</strong></p>}
            </span>
        )
    }

    const showEntity = (entity : Entity, index : number) =>
    {
        return (
            <>
                <p><strong>Name:</strong> {entity.name} <br /> {entity.inference != null && <span><strong>Inference:</strong> {entity.inference} <br /> </span>}
                    <button className="btn" id={`button${index}`} onClick={(event) => onAddEntity(event)}>Add</button>
                    <button className="btn" id={`button${index}`} onClick={(event) => onEditSuggestion(event, "entities")}>Edit</button>
                    { entity.inference == null && <button className="btn" id={`button${index}`} onClick={(event) => onShowInference(event)}>Show</button> }
                </p>

            </>
        )
    }

    const showAttribute = (attribute : Attribute, index : number) =>
    {
        return (
            <p><strong>Name:</strong> {attribute.name} <br />
               <strong>Inference:</strong> {attribute.inference} <br />
               <strong>Data type:</strong> {attribute.dataType} <br />
               <strong>Cardinality:</strong> <br />
               <button
                    className="btn"
                    id={`button${index}`}
                    onClick={() => onAddAttributesToNode(attribute)}>
                        Add
                </button>
               <button
                    className="btn"
                    id={`button${index}`}
                    onClick={ () => onAddAsRelationship(attribute) }>
                        Add as relationship
                </button>
               <button className="btn" id={`button${index}`} onClick={(event) => onEditSuggestion(event, "attributes")}>Edit</button>
               <button className="btn" id={`button${index}`} onClick={(event) => onShowInference(event)}>Show</button>
            </p>
        )
    }

    const showRelationship = (relationship : Relationship, index : number) =>
    {
        return (
            <p><strong>Name:</strong> {relationship.name} <br />
               <strong>Inference:</strong> {relationship.inference} <br />
               <strong>Source:</strong> {relationship.source} <br />
               <strong>Target:</strong> {relationship.target} <br />
               <strong>Cardinality:</strong> <br />
               <button className="btn" id={`button${index}`} onClick={() => onAddRelationshipsToNodes(relationship)}>Add</button>
               <button className="btn" id={`button${index}`} onClick={() => onAddAsAttribute(relationship)}>Add as attribute</button>
               <button className="btn" id={`button${index}`} onClick={(event) => onEditSuggestion(event, "relationships")}>Edit</button>
               <button className="btn" id={`button${index}`} onClick={(event) => onShowInference(event)}>Show</button>
            </p>
        )
    }

    return (
        <div className="sideBar">
            {showTextOnSidebar()}
        </div>
    )
}

export default Sidebar