import { useEffect, useState } from "react"
import { useRecoilState, useSetRecoilState } from "recoil";
import { domainDescriptionState, isIgnoreDomainDescriptionState } from "../atoms";


const useDomainDescription = () =>
{
  const setDomainDescription = useSetRecoilState(domainDescriptionState);
  const setIsIgnoreDomainDescription = useSetRecoilState(isIgnoreDomainDescriptionState);
  

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

  return { onDomainDescriptionChange, onIgnoreDomainDescriptionChange }
}

export default useDomainDescription