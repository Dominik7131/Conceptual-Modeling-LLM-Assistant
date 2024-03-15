import { useEffect, useState } from "react"

const useDomainDescription = () =>
{
    const [domainDescription, setDomainDescription] = useState<string>("")
    const [isIgnoreDomainDescription, setIsIgnoreDomainDescription] = useState<boolean>(false)

    const onDomainDescriptionChange = (newText : string) =>
    {
      setDomainDescription(newText)
    }

    const onIgnoreDomainDescriptionChange = () =>
    {
      setIsIgnoreDomainDescription(previousValue => !previousValue)
    }

    const loadDomainDescriptionFromFile = () =>
    {
        const domainDescriptionFileName = "input.txt"
        fetch(domainDescriptionFileName)
        .then((result) => result.text())
        .then((text) =>
        {
            setDomainDescription(_ => text)
        })
        .catch((e) => console.error(e));
    }

    useEffect(() =>
    {
        loadDomainDescriptionFromFile()
    }, []);

    return { domainDescription, isIgnoreDomainDescription, onDomainDescriptionChange, onIgnoreDomainDescriptionChange }
}

export default useDomainDescription