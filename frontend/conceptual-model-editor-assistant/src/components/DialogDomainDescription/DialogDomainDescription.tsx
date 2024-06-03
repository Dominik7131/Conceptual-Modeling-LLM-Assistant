import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import { useEffect } from "react"
import { useRecoilState, useRecoilValue } from "recoil"
import Title from "./Title"
import HighlightedOriginalText from "./HighlightedOriginalText"
import { isLoadingHighlightOriginalTextState } from "../../atoms/loadings"
import { isShowHighlightDialogState } from "../../atoms/dialogs"
import { ORIGINAL_TEXT_ID } from "../../definitions/utility"


const HighlightDialog: React.FC = () =>
{
  const isLoading = useRecoilValue(isLoadingHighlightOriginalTextState)
  const [isOpened, setIsOpened] = useRecoilState(isShowHighlightDialogState)


  const onClose = () =>
  {
    setIsOpened(false)
  }


  useEffect(() =>
  {
    if (!isOpened)
    {
      return
    }

    // Scroll down to the first highlighted original text in the dialog
    const delay = async () =>
    {
      await new Promise(resolve => setTimeout(resolve, 200))

      let highlightedText = document.getElementById(`${ORIGINAL_TEXT_ID}-1`)

      if (highlightedText)
      {
        highlightedText.scrollIntoView({ behavior: "smooth", block: "center"})
      }
    }

    delay()
  }, [isOpened, isLoading])


  return (
      <Dialog
        open={ isOpened }
        fullWidth={ true }
        maxWidth={ "xl" }
        scroll={ "paper" }
        onClose={ onClose }
      >

        <Title/>

        {
          !isLoading &&

          <DialogContent dividers={true}>
            <DialogContentText>
              <HighlightedOriginalText/>
            </DialogContentText>
          </DialogContent>
        }

        <DialogActions>
          <Button variant="contained" sx={{textTransform: "none"}} onClick={ onClose }>
            Close
          </Button>
        </DialogActions>
      </Dialog>
  )
}

export default HighlightDialog