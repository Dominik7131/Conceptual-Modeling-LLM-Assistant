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
import { UserChoice } from '../App';
import useUtility from '../hooks/useUtility';
import { styled } from '@mui/system';


interface Props
{
  domainDescription : string
  isOpened : boolean
  inferenceIndexes : number[]
  onClose : () => void
  itemName : string
  selectedEntityName : string
  userChoiceSuggestion : string
  tooltips : string[]
}

const DialogDomainDescription: React.FC<Props> = ({ domainDescription, isOpened, inferenceIndexes, onClose, itemName, selectedEntityName, userChoiceSuggestion, tooltips } : Props) =>
{
  const { capitalizeString, getUserChoiceSingular } = useUtility()

  const showSelectedSuggestion = () =>
  {
    const itemString = `${getUserChoiceSingular(userChoiceSuggestion)}: ${itemName}`
    if (userChoiceSuggestion === UserChoice.ENTITIES)
    {
      return (
        <>
          <Typography>{itemString}</Typography>
        </>
      )
    }

    return (
      <>
        <Typography variant="h5"> Entity: {selectedEntityName}</Typography>
        <Typography variant="h5"> {getUserChoiceSingular(userChoiceSuggestion)}: {itemName}</Typography>
      </>)
  }
  
  const getTooltip = (index : number) =>
  {
    const number = (index - 1) / 2
    return tooltips[number]
  }

  // Define a styled span component
  const HoverSpan = styled('span')(({ theme }) => ({
    transition: 'background 0.3s ease',
    '&:hover': {
      background: "#77dae6"
    },
  }));

  const highlightInference = () =>
  {
      let start = 0
      let texts = []

      for (let i = 0; i < inferenceIndexes.length; i += 2)
      {
          texts.push(domainDescription.slice(start, inferenceIndexes[i]))
          texts.push(domainDescription.slice(inferenceIndexes[i], inferenceIndexes[i + 1]))
          start = inferenceIndexes[i + 1]
      }

      texts.push(domainDescription.slice(start, -1))

      return (
          <Typography component='span' whiteSpace="pre-wrap">
              { texts.map((text, index) =>
              (
                  index % 2 === 0 ? <span key={index}>{text}</span> :
                  <HtmlTooltip title={<Typography color="inherit">{getTooltip(index)}</Typography>} arrow key={index}>
                    <HoverSpan
                      id={`highlightedInference-${index}`}
                      className="highlight"
                      key={index}
                      // sx={{transition: 'color 0.3s ease', '&:hover': { color: "#ffffff", background: "blue" }}}
                    >
                      {text}
                    </HoverSpan>
                  </HtmlTooltip>
              ))}
          </Typography>
      )
  }

  // Tooltip from https://mui.com/material-ui/react-tooltip/#customization
  const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
      <Tooltip {...props} classes={{ popper: className }} />
    ))(({ theme }) => ({
      [`& .${tooltipClasses.tooltip}`]: {
        // backgroundColor: '#f5f5f9',
        backgroundColor: '#6d6d6d',
        // color: 'rgba(0, 0, 0, 0.87)',
        color: '#ffffff',
        maxWidth: "100%",
        // border: '1px solid #dadde9',
      },
    }));


  return (
    <>
      <Dialog
        open={isOpened}
        fullWidth={true}
        maxWidth={'xl'}
        scroll={'paper'}
        onClose={onClose}
      >
        <DialogTitle>
          <Stack spacing={2}>
            { inferenceIndexes.length === 0 &&
              <Alert variant="outlined" severity="warning">
                Unable to find original text in domain description
              </Alert>}
            <Typography variant="h5">Domain description</Typography>
            {/* <Typography variant="body1">{showSelectedSuggestion()}</Typography> */}
          </Stack>
        </DialogTitle>

        <DialogContent dividers={true}>
          <DialogContentText>
            { highlightInference() }
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          {/* <Button onClick={() => {

            let highlightedText = document.getElementById("highlightedInference-1")
            if (highlightedText)
            {
              highlightedText.scrollIntoView( { behavior: 'smooth', block: 'center'})
            }
            }}>
            Scroll</Button> */}
        </DialogActions>
      </Dialog>
    </> )
}

export default DialogDomainDescription