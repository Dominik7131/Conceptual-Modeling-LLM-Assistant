import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import { useEffect, useRef, useState } from 'react';
import Tooltip, { TooltipProps, tooltipClasses  } from '@mui/material/Tooltip';
import { Field, Item, ItemType, Association, UserChoice } from '../interfaces';
import { styled } from '@mui/system';
import AddIcon from '@mui/icons-material/Add';
import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal';
import { editedSuggestedItemState, isShowCreateEdgeDialogState, isShowEditDialogState, isSuggestedItemState, selectedSuggestedItemState } from '../atoms';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import useConceptualModel from '../hooks/useConceptualModel';


const DialogCreateEdge: React.FC = () =>
{
  const [isOpened, setIsOpened] = useRecoilState(isShowCreateEdgeDialogState)
  const association = useRecoilValue(selectedSuggestedItemState) as Association

  const setIsShowEditDialog = useSetRecoilState(isShowEditDialogState)

  const setSelectedSuggestedItem = useSetRecoilState(selectedSuggestedItemState)
  const setEditedSuggestedItem = useSetRecoilState(editedSuggestedItemState)
  
  const { onSuggestItems } = useConceptualModel()


  const handleClose = (): void =>
  {
    setIsOpened(false)
  }


  const handleManuallyAddNewRelationship = (isGeneralization: boolean): void =>
  {
    const itemType: ItemType = isGeneralization ? ItemType.GENERALIZATION : ItemType.ASSOCIATION
    const newObject = { ...association, [Field.TYPE]: itemType}
    setSelectedSuggestedItem(newObject)
    setEditedSuggestedItem(newObject)

    setIsShowEditDialog(true)
    handleClose()
  }


  return (
    <>
      <Dialog
        open={isOpened}
        fullWidth={true}
        maxWidth={'md'}
        scroll={'paper'}
        onClose={handleClose}
      >
        <DialogTitle sx={{ textAlign: 'center' }}>
          <Stack>
            Select how to create association with source as "{ association.source }" and target as "{ association.target }"
          </Stack>
        </DialogTitle>

        <DialogContent dividers={true}>

            <Stack direction="row" sx={{justifyContent:'space-around'}}>
                <Button
                  startIcon={ <AddIcon/> }
                  variant="outlined"
                  sx={{textTransform: "none"}}
                  onClick={() => { handleManuallyAddNewRelationship(false) } }
                  >
                    Create association manually
                </Button>

                <Button
                  startIcon={ <AddIcon/> }
                  variant="outlined"
                  sx={{textTransform: "none"}}
                  onClick={() => { handleManuallyAddNewRelationship(true) } }
                  >
                    Create is-a association manually
                </Button>

                <Button
                  startIcon={ <AutoFixNormalIcon/> }
                  variant="outlined"
                  sx={{textTransform: "none"}}
                  onClick={() => { onSuggestItems(UserChoice.ASSOCIATIONS2, association.source, association.target); handleClose() } }
                  >
                    Suggest associations
                </Button>
            </Stack>

        </DialogContent>
      </Dialog>
    </> )
}

export default DialogCreateEdge