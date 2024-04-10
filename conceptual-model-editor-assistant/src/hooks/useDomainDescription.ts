import { useEffect, useState } from "react"
import { useRecoilState } from "recoil";
import { domainDescriptionState, isIgnoreDomainDescriptionState } from "../atoms";


const useDomainDescription = () =>
{
  const [domainDescription, setDomainDescription] = useRecoilState(domainDescriptionState);
  const [isIgnoreDomainDescription, setIsIgnoreDomainDescription] = useRecoilState(isIgnoreDomainDescriptionState);
  

  const onDomainDescriptionChange = (newText : string) =>
  {
    setDomainDescription(_ => newText)
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