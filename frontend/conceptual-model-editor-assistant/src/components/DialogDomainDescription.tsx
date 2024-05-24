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
import { styled } from '@mui/system';
import { domainDescriptionState, isLoadingHighlightOriginalTextState, isShowHighlightDialogState, isShowTitleDialogDomainDescriptionState, originalTextIndexesListState, selectedSuggestedItemState, tooltipsState } from '../atoms';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Box, CircularProgress } from '@mui/material';



const HighlightDialog: React.FC = () =>
{
  const [isOpened, setIsOpened] = useRecoilState(isShowHighlightDialogState)
  const domainDescription = useRecoilValue(domainDescriptionState)

  const isLoading = useRecoilValue(isLoadingHighlightOriginalTextState)

  const inferenceIndexes = useRecoilValue(originalTextIndexesListState)
  const tooltips = useRecoilValue(tooltipsState)
  const isShowHighlightDialog = useRecoilValue(isShowHighlightDialogState)

  const selectedItem = useRecoilValue(selectedSuggestedItemState)

  const isShowTitleDialogDomainDescription = useRecoilValue(isShowTitleDialogDomainDescriptionState)


  // TODO: Do not use `useEffect`, this should be solved with Ref to the highlighted text
  useEffect(() =>
  {
    if (!isShowHighlightDialog)
    {
      return
    }

    // Scroll down to the first highlighted original text in the dialog
    // We need to wait for few miliseconds to let the dialog render
    const delay = async () =>
    {
      await new Promise(resolve => setTimeout(resolve, 200));

      let highlightedText = document.getElementById("highlightedOriginalText-1")
      // console.log("Trying to scroll", highlightedText)

      if (highlightedText)
      {
        highlightedText.scrollIntoView( { behavior: 'smooth', block: 'center'})
      }
    }

    delay()
  }, [isShowHighlightDialog])


  const onClose = () =>
  {
    setIsOpened(_ => false)
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
  }))


  const highlightOriginalText = () =>
  {
      let start = 0
      let texts = []

      for (let i = 0; i < inferenceIndexes.length; i += 2)
      {
          texts.push(domainDescription.slice(start, inferenceIndexes[i]))
          texts.push(domainDescription.slice(inferenceIndexes[i], inferenceIndexes[i + 1]))
          start = inferenceIndexes[i + 1]
      }

      texts.push(domainDescription.slice(start)) // Append last part of the text

      return (
          <Typography component='span' whiteSpace="pre-wrap">
              { texts.map((text, index) =>
              (
                  index % 2 === 0 ? <span key={index}>{text}</span> :
                  <HtmlTooltip title={<Typography color="inherit">{ getTooltip(index) }</Typography>} arrow key={index}>
                    <HoverSpan
                      id={`highlightedOriginalText-${index}`}
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
      ))(() => ({
      [`& .${tooltipClasses.tooltip}`]:
      {
        backgroundColor: '#6d6d6d',
        color: '#ffffff',
        maxWidth: "100%",
      },
    }))


  return (
    <>
      <Dialog
        open={ isOpened }
        fullWidth={ true }
        maxWidth={ "xl" }
        scroll={ "paper" }
        onClose={ onClose }
      >
        <DialogTitle>
          <Stack spacing={2}>

            {
              isLoading &&
              <Alert variant="outlined" severity="info">

                <Box display="flex" alignItems="center" overflow="hidden">
                  <Box mr={1} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis"> Updating </Box>
                  <CircularProgress size={20} />
                </Box>

              </Alert>
            }

            { inferenceIndexes.length === 0 &&
              <Alert variant="outlined" severity="warning">
                Unable to find original text in domain description
              </Alert>
            }

            {  isShowTitleDialogDomainDescription ?
                <Typography variant="h5"> Selected {selectedItem.type}: <strong>{selectedItem.name}</strong> </Typography>
              : <Typography variant="h5"> Highlighting selected items in domain description </Typography> }

          </Stack>
        </DialogTitle>

        <DialogContent dividers={true}>
          <DialogContentText>
            { highlightOriginalText() }
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button variant="contained" sx={{textTransform: "none"}} onClick={ onClose }>Close</Button>

          {/* <Button onClick={() => {

            let highlightedText = document.getElementById("highlightedInference-1")
            console.log(highlightedText)
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

export default HighlightDialog