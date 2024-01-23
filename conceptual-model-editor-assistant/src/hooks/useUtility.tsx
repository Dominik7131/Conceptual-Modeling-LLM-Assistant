const useUtility = () =>
{
    const capitalizeString = (string : string) =>
    {
      return string.charAt(0).toUpperCase() + string.slice(1)
    }

    return { capitalizeString }
}

export default useUtility