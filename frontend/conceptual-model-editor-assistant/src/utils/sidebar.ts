import { SetterOrUpdater } from "recoil"
import { ItemType } from "../definitions/utility"
import { SidebarTab } from "../definitions/tabs"


export const changeSidebarTab = (itemType: ItemType, setSidebarTab: SetterOrUpdater<SidebarTab>) =>
{
    if (itemType === ItemType.CLASS)
    {
        setSidebarTab(SidebarTab.CLASSES)
    }
    else if (itemType === ItemType.ATTRIBUTE)
    {
        setSidebarTab(SidebarTab.ATTRIBUTES)
    }
    else if (itemType === ItemType.ASSOCIATION || itemType === ItemType.GENERALIZATION)
    {
        setSidebarTab(SidebarTab.ASSOCIATIONS)
    }
    else
    {
        throw Error(`Received unknown item type: ${itemType}`)
    }
}