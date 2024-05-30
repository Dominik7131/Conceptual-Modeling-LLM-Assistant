import React, {FunctionComponent, PropsWithChildren} from "react"
import {useTabContext} from "@mui/lab"
import { Box } from "@mui/material"


interface Props
{
  value: string
}

// In regular TabPanel tab switching resets all child states
// In this CustomTabPanel this does not happen
// The issue and trick is in more detail described here: https://stackoverflow.com/a/72800846
export const CustomTabPanel: FunctionComponent<PropsWithChildren<Props>> = ({ children, value }): JSX.Element =>
{
  const {value: contextValue} = useTabContext() || {}
  const tabMargin = "20px"

  return (
    <Box sx={{ display: value === contextValue ? "block" : "none", margin: tabMargin }} key={value}>
      { children }
    </Box>
  )
}
