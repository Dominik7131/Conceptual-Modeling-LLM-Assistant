

export default function SideBar({
    handleIgnoreDomainDescriptionChange,
    onPlusButtonClick
})
{
    return (
        <div className="topBar">
            <label className="domainDescriptionLabel" htmlFor="story">Domain description: </label>
            <input type="checkbox" id="isIgnoreDomainDescription" defaultChecked onClick={() => handleIgnoreDomainDescriptionChange()}></input>
            <br />
            <br />
            <textarea id="domainDescriptionText" name="story" rows="8" cols="70" defaultValue={"We know that courses have a name and a specific number of credits. Each course can have one or more professors, who have a name. Professors could participate in any number of courses. For a course to exist, it must aggregate, at least, five students, where each student has a name. Students can be enrolled in any number of courses. Finally, students can be accommodated in dormitories, where each dormitory can have from one to four students. Besides, each dormitory has a price."}></textarea>
            <br />
            <br />
            <button className="plusButton" onClick={(event) => onPlusButtonClick(event)}>+Attributes</button>
            <button className="plusButton" onClick={(event) => onPlusButtonClick(event)}>+Relationships</button>
        </div>
    )
}