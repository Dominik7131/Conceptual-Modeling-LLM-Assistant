import { useState } from "react"

const useInferenceIndexes = () =>
{
    const [inferenceIndexes, setInferenceIndexes] = useState<number[][]>([])


    const getDiscontinuousInferenceIndexes = (inference : string, domainDescription : string) =>
    {
        const sentenceEndMarkers = ['.', '!', '?']
        const wordsArray = inference.split(' ')
        let result = []
        let isContinuous = false
        let nextPositionToCheck = 0
        let currentWordIndex = 0
    
        for (let i = 0; i < domainDescription.length; i++)
        {
          if (domainDescription.slice(i, i + wordsArray[currentWordIndex].length) === wordsArray[currentWordIndex])
          {
            // console.log("Match: " + wordsArray[currentWordIndex])
            if (!isContinuous)
            {
              result.push(i)
            }
            isContinuous = true
    
            // Whole sequence found
            if (currentWordIndex === wordsArray.length - 1)
            {
              result.push(i + wordsArray[currentWordIndex].length)
              // console.log("Returning: ")
              // console.log(result)
              return result
            }
    
            i += wordsArray[currentWordIndex].length
            nextPositionToCheck = i
            currentWordIndex += 1
            continue
          }
    
          // Found hole
          if (currentWordIndex > 0 && isContinuous)
          {
            // console.log("Found hole: " + domainDescription[i - 1] + domainDescription[i] + domainDescription[i + 1])
            result.push(i + wordsArray[currentWordIndex - 1].length - 2)
            isContinuous = false
          }
    
          // End of sentence interrupts current sequence -> start again
          if (sentenceEndMarkers.includes(domainDescription[i]) && currentWordIndex > 0)
          {
            console.log("End of sentence")
            result = []
            i = nextPositionToCheck + 1
            currentWordIndex = 0
          }
        }
    
        return []
    }
    
    const getIndexesForOneInference = (inference : string, domainDescription : string) =>
    {
        if (!inference)
        {
            return []
        }

        for (let j = 0; j < domainDescription.length; j++)
        {
            if (inference.length + j > domainDescription.length)
            {
            const discontinuousInferenceIndex = getDiscontinuousInferenceIndexes(inference, domainDescription)
            return discontinuousInferenceIndex
            }

            const text = domainDescription.slice(j, inference.length + j)

            if (inference === text)
            {
            return [j, inference.length + j]
            }
        }
        return []
    }

    const removeOverlappingInferenceIndexes = (inferenceIndexes : number[][]) =>
    {
        let indexesToRemove : number[] = []

        for (let i = 0; i < inferenceIndexes.length; i++)
        {
            for (let j = 0; j < inferenceIndexes.length; j++)
            {
                if (i === j)
                {
                    continue
                }

                if (inferenceIndexes[i][0] <= inferenceIndexes[j][0] && inferenceIndexes[i][1] >= inferenceIndexes[j][1])
                {
                    indexesToRemove.push(j)
                }
            }
        }

        const result = inferenceIndexes.filter((_ : any, index : number) => !indexesToRemove.includes(index))
        return result
    }

    const simplifyInferenceIndexes = (inferenceIndexes : number[][]) =>
    {
        // For simplicity make every inference index of length 2
        let newInferenceIndexes = []
        for (let i = 0; i < inferenceIndexes.length; i++)
        {
            if (inferenceIndexes[i].length === 2)
            {
                newInferenceIndexes.push(inferenceIndexes[i])
            }
            else if (inferenceIndexes[i].length > 2)
            {
                for (let j = 0; j < inferenceIndexes[i].length; j += 2)
                {
                    const firstInferenceIndex = inferenceIndexes[i][j]
                    const secondInferenceIndex = inferenceIndexes[i][j + 1]
                    const newInferenceIndex = [firstInferenceIndex, secondInferenceIndex]
                    newInferenceIndexes.push(newInferenceIndex)
                }
            }
        }
        return newInferenceIndexes
    }

    return { inferenceIndexes, setInferenceIndexes, getIndexesForOneInference, removeOverlappingInferenceIndexes, simplifyInferenceIndexes }
}

export default useInferenceIndexes