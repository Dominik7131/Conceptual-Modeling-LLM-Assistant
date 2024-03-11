const useUtility = () =>
{
    const capitalizeString = (inputString : string) =>
    {
      if (!inputString)
      {
        return ""
      }

      return inputString.charAt(0).toUpperCase() + inputString.slice(1)
    }

    return { capitalizeString }
}

export default useUtility