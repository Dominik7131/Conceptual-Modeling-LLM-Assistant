import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useRecoilState, useRecoilValue } from "recoil";
import { createNameFromIRI } from "../../utils/conceptualModel";
import ControlButtons from "./ControlButtons";
import { isShowCreateEdgeDialogState } from "../../atoms/dialogs";
import { selectedSuggestedItemState } from "../../atoms/suggestions";
import { Association } from "../../definitions/conceptualModel";
import { Field } from "../../definitions/utility";


const DialogCreateEdge: React.FC = (): JSX.Element =>
{
  const [isOpened, setIsOpened] = useRecoilState(isShowCreateEdgeDialogState)
  const association = useRecoilValue(selectedSuggestedItemState) as Association

  if (!association[Field.SOURCE_CLASS] || !association[Field.TARGET_CLASS])
  {
    return <></>
  }

  const sourceClassName = createNameFromIRI(association[Field.SOURCE_CLASS])
  const targetClassName = createNameFromIRI(association[Field.TARGET_CLASS])

  const titleText = `Select how to create association with source as "${sourceClassName}" and target as "${targetClassName}"`


  const handleClose = (): void =>
  {
    setIsOpened(false)
  }


  return (
    <Dialog
      open={isOpened}
      fullWidth={true}
      maxWidth={"md"}
      scroll={"paper"}
      onClose={handleClose}
    >
      <DialogTitle sx={{ textAlign: "center" }}>
        { titleText }
      </DialogTitle>

      <DialogContent dividers={true}>
        <ControlButtons association={association} sourceClassName={sourceClassName} targetClassName={targetClassName}/>
      </DialogContent>
    </Dialog>
  )
}

export default DialogCreateEdge