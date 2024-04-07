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


interface Props
{
  relationship: Relationship
  isOpened: boolean
  onClose: () => void
  onAddNewRelationship: () => void
  onSuggestItems: (userChoice: UserChoice, sourceItem: string | null, targetItem: string | null) => void
}

const DialogCreateEdge: React.FC<Props> = ({ relationship, isOpened, onClose, onAddNewRelationship, onSuggestItems } : Props) =>
{
  const { capitalizeString, getUserChoiceSingular } = useUtility()


  return (
    <>
      <Dialog
        open={isOpened}
        fullWidth={true}
        maxWidth={'sm'}
        scroll={'paper'}
        onClose={onClose}
      >
        <DialogTitle sx={{ textAlign: 'center' }}>
          <Stack>
            Select how to create relationship: { relationship.source }-{ relationship.target }
          </Stack>
        </DialogTitle>

        <DialogContent dividers={true}>

            <Stack direction="row" sx={{justifyContent:'space-around'}}>
                <Button
                  variant="outlined"
                  sx={{textTransform: "capitalize"}}
                  onClick={() => { onAddNewRelationship() } }
                  >
                    Create relationship manually
                </Button>

                <Button
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