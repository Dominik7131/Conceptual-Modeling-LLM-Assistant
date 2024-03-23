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
import { styled } from '@mui/material/styles';


interface Props
{
  domainDescription : string
  isOpened : boolean
  inferenceIndexes : number[]
  onClose : () => void
  itemName : string
  selectedEntityName : string
  userChoiceSuggestion : string
}

const OverlayShow: React.FC<Props> = ({ domainDescription, isOpened, inferenceIndexes, onClose, itemName, selectedEntityName, userChoiceSuggestion } : Props) =>
{
  const { capitalizeString, getUserChoiceSingular } = useUtility()

  inferenceIndexes = [2960, 2980, 2982, 3114, 3122, 3143, 3171, 3184, 3185, 3201, 3206, 3315, 3322, 3368, 3536, 3582]
  const tooltips = [ "Natural person: name", "Natural person - Address: has", "Natural person: birth number", "Natural person: date of birth",
    "Natural person: name, birth number, date of birth", "Business natural person: name", "Business natural person: distinguishing name supplement",
    "Business natural person: personal identification number"]

  // Event listener to handle click outside the dialog
  const handleClickOutside = (event: MouseEvent) =>
  {
    const target = event.target as HTMLElement;
    if (target.className.includes('MuiDialog-container')) { onClose(); }
  }

  useEffect(() =>
  {
    if (isOpened) { document.addEventListener('click', handleClickOutside) }
    else { document.removeEventListener('click', handleClickOutside) }

    return () => { document.removeEventListener('click', handleClickOutside) }
  }, [isOpened])


  const createTooltip = () =>
  {
    const userChoice : string = getUserChoiceSingular(userChoiceSuggestion)
    return `${userChoice}: ${itemName}`
  }

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

    // return `Entity: ${selectedEntityName}: ${itemString}`
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
                    <span
                      id={`highlightedInference-${index}`}
                      className="highlight"
                      key={index}
                      ref={highlightedInferenceRef}
                    >
                      {text}
                    </span>
                  </HtmlTooltip>
              ))}
          </Typography>
      )
  }


  // TODO: Fix scrolling into the first highlighted inference
  const highlightedInferenceRef = useRef<HTMLDivElement>(null);
  // useEffect(() =>
  // {
  //   console.log("Use effect")
  //   if (highlightedInferenceRef.current)
  //   {
  //     highlightedInferenceRef.current.scrollIntoView({
  //       behavior: 'smooth',
  //       block: 'center',
  //     });
  //   }
  //   else
  //   {
  //     console.log("Is null")
  //   }
  // }, [highlightedInferenceRef]);


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
      >
        <DialogTitle>
          <Stack spacing={2}>
            { inferenceIndexes.length === 0 &&
              <Alert variant="outlined" severity="warning">
                Unable to find original text in domain description.
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

export default OverlayShow