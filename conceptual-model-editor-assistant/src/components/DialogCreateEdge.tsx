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
import { Field, Item, ItemType, Relationship, UserChoice } from '../interfaces';
import useUtility from '../hooks/useUtility';
import { styled } from '@mui/system';
import AddIcon from '@mui/icons-material/Add';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { editedSuggestedItemState, isShowCreateEdgeDialogState, isShowEditDialogState, isSuggestedItemState, selectedSuggestedItemState } from '../atoms';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import useConceptualModel from '../hooks/useConceptualModel';


const DialogCreateEdge: React.FC = () =>
{
  const [isOpened, setIsOpened] = useRecoilState(isShowCreateEdgeDialogState)
  const relationship = useRecoilValue(selectedSuggestedItemState) as Relationship

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
    const newRelationship = { ...relationship, [Field.IS_GENERALIZATION]: isGeneralization}
    setSelectedSuggestedItem(newRelationship)
    setEditedSuggestedItem(newRelationship)

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
            Select how to create relationship with source as "{ relationship.source }" and target as "{ relationship.target }"
          </Stack>
        </DialogTitle>

        <DialogContent dividers={true}>

            <Stack direction="row" sx={{justifyContent:'space-around'}}>
                <Button
                  startIcon={<AddIcon/>}
                  variant="outlined"
                  sx={{textTransform: "none"}}
                  onClick={() => { handleManuallyAddNewRelationship(false) } }
                  >
                    Create relationship manually
                </Button>

                <Button
                  startIcon={<AddIcon/>}
                  variant="outlined"
                  sx={{textTransform: "none"}}
                  onClick={() => { handleManuallyAddNewRelationship(true) } }
                  >
                    Create is-a relationship manually
                </Button>

                <Button
                  startIcon={<AutoFixHighIcon/>}
                  variant="outlined"
                  sx={{textTransform: "none"}}
                  onClick={() => { onSuggestItems(UserChoice.RELATIONSHIPS2, relationship.source, relationship.target); handleClose() } }
                  >
                    Suggest relationships
                </Button>
            </Stack>

        </DialogContent>
      </Dialog>
    </> )
}

export default DialogCreateEdge