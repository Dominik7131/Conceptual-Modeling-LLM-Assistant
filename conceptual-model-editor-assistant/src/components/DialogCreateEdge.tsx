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
import { Item, Relationship, UserChoice } from '../interfaces';
import useUtility from '../hooks/useUtility';
import { styled } from '@mui/system';
import AddIcon from '@mui/icons-material/Add';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { isShowCreateEdgeDialog, selectedSuggestedItemState } from '../atoms';
import { useRecoilValue } from 'recoil';
import useCreateEdgeDialog from '../hooks/useCreateEdgeDialog';
import useConceptualModel from '../hooks/useConceptualModel';


const DialogCreateEdge: React.FC = () =>
{
  const isOpened = useRecoilValue(isShowCreateEdgeDialog)
  const relationship = useRecoilValue(selectedSuggestedItemState) as Relationship

  const { onClose } = useCreateEdgeDialog()
  const { onAddNewRelationship, onSuggestItems } = useConceptualModel()


  return (
    <>
      <Dialog
        open={isOpened}
        fullWidth={true}
        maxWidth={'md'}
        scroll={'paper'}
        onClose={onClose}
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
                  sx={{textTransform: "capitalize"}}
                  onClick={() => { onAddNewRelationship() } }
                  >
                    Create relationship manually
                </Button>

                <Button
                  startIcon={<AutoFixHighIcon/>}
                  variant="outlined"
                  sx={{textTransform: "capitalize"}}
                  onClick={() => { onSuggestItems(UserChoice.RELATIONSHIPS2, relationship.source, relationship.target); onClose() } }
                  >
                    Suggest relationships
                </Button>
            </Stack>

        </DialogContent>
      </Dialog>
    </> )
}

export default DialogCreateEdge