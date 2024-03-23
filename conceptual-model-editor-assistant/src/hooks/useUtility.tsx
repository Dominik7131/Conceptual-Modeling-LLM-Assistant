import { UserChoice } from "../App"

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

    const getUserChoiceSingular = (userChoice : string) =>
    {
      if (!userChoice)
      {
        return ""
      }

      let result : string = ""
      if (userChoice === UserChoice.ENTITIES) { result = "Entity" }
      else if (userChoice === UserChoice.ATTRIBUTES) { result = "Attribute" }
      else if (userChoice === UserChoice.RELATIONSHIPS) { result = "Relationship" }
      return result
    }

    return { capitalizeString, getUserChoiceSingular }
}

export default useUtility