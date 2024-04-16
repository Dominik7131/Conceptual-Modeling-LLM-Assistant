import { useEffect, useState } from "react"
import { useRecoilState, useSetRecoilState } from "recoil";
import { domainDescriptionState, isIgnoreDomainDescriptionState } from "../atoms";


const useDomainDescription = () =>
{
  const setIsIgnoreDomainDescription = useSetRecoilState(isIgnoreDomainDescriptionState);

  const onIgnoreDomainDescriptionChange = () =>
  {
    setIsIgnoreDomainDescription(previousValue => !previousValue)
  }

  return { onIgnoreDomainDescriptionChange }
}

export default useDomainDescription