import { useState } from "react"

const SIDEBAR_DEFAULT_WIDTH_PERCENTAGE = 20

const useLayoutSize = () =>
{
    const [sideBarWidthPercentage, setSideBarWidthPercentage] = useState<number>(SIDEBAR_DEFAULT_WIDTH_PERCENTAGE)
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true)
    
    const onToggleSideBarCollapse = () =>
    {
      if (isSidebarOpen)
      {
        setSideBarWidthPercentage(0)
      }
      else
      {
        setSideBarWidthPercentage(SIDEBAR_DEFAULT_WIDTH_PERCENTAGE)
      }
      setIsSidebarOpen(isOpen => !isOpen)
    }

    return { isSidebarOpen, sideBarWidthPercentage, onToggleSideBarCollapse }
}

export default useLayoutSize