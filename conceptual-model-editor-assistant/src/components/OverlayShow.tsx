import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';


interface Props
{
  domainDescription : string
  isShow : boolean
  inferenceIndexes : number[]
  onClose : () => void
}

const OverlayShow: React.FC<Props> = ({ domainDescription, isShow, inferenceIndexes, onClose } : Props) =>
{

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
                  <span
                    id={`highlightedInference-${index}`}
                    className="highlight"
                    key={index}
                    ref={highlightedInferenceRef}
                  >
                    {text}
                  </span>
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


  return ( <>
      <Dialog
        open={isShow}
        fullWidth={true}
        maxWidth={'xl'}
        scroll={'paper'}
      >
        <DialogTitle>
          Domain description
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