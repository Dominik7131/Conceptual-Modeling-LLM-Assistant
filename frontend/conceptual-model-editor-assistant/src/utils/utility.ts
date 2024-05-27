import { ItemType, UserChoice } from "../definitions/utility"


export const capitalizeString = (inputString : string) =>
{
  if (!inputString)
  {
    return ""
  }

  return inputString.charAt(0).toUpperCase() + inputString.slice(1)
}


export const clipString = (string: string, maxLength: number): string =>
{
  if (string.length > maxLength)
  {
    const newString = string.substring(0, maxLength) + "..."
    return newString
  }
  return string
}


export const userChoiceToItemType = (userChoice: UserChoice): ItemType =>
{
  if (userChoice === UserChoice.CLASSES)
  {
    return ItemType.CLASS 
  }

  if (userChoice === UserChoice.ATTRIBUTES)
  {
    return ItemType.ATTRIBUTE
  }

  if (userChoice === UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS || userChoice === UserChoice.ASSOCIATIONS_TWO_KNOWN_CLASSES)
  {
    return ItemType.ASSOCIATION
  }

  throw Error(`Unexpected user choice: ${userChoice}`)
}


export const itemTypeToUserChoice = (itemType: ItemType): UserChoice =>
{
  if (itemType === ItemType.CLASS)
  {
    return UserChoice.CLASSES
  }
  else if (itemType === ItemType.ATTRIBUTE)
  {
    return UserChoice.ATTRIBUTES
  }
  else if (itemType === ItemType.ASSOCIATION || itemType === ItemType.GENERALIZATION)
  {
    return UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS
  }

  throw Error(`Received unknown item type: ${itemType}`)
}