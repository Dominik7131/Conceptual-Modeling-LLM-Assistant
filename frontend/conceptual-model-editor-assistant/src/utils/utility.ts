import { ItemType, UserChoiceItem } from "../definitions/utility"


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


export const userChoiceToItemType = (userChoice: UserChoiceItem): ItemType =>
{
  if (userChoice === UserChoiceItem.CLASSES)
  {
    return ItemType.CLASS 
  }

  if (userChoice === UserChoiceItem.ATTRIBUTES)
  {
    return ItemType.ATTRIBUTE
  }

  if (userChoice === UserChoiceItem.ASSOCIATIONS_ONE_KNOWN_CLASS || userChoice === UserChoiceItem.ASSOCIATIONS_TWO_KNOWN_CLASSES)
  {
    return ItemType.ASSOCIATION
  }

  throw Error(`Unexpected user choice: ${userChoice}`)
}


export const itemTypeToUserChoice = (itemType: ItemType): UserChoiceItem =>
{
  if (itemType === ItemType.CLASS)
  {
    return UserChoiceItem.CLASSES
  }
  else if (itemType === ItemType.ATTRIBUTE)
  {
    return UserChoiceItem.ATTRIBUTES
  }
  else if (itemType === ItemType.ASSOCIATION || itemType === ItemType.GENERALIZATION)
  {
    return UserChoiceItem.ASSOCIATIONS_ONE_KNOWN_CLASS
  }

  throw Error(`Received unknown item type: ${itemType}`)
}