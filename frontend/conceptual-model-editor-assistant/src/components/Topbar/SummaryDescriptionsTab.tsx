import { Button, Typography, CircularProgress, Stack, Tooltip } from "@mui/material"
import { useRecoilState, useRecoilValue } from "recoil"
import { conceptualModelSnapshotState, domainDescriptionSnapshotsState, isLoadingSummaryDescriptionsState, isSummaryDescriptionReactButtonClickedState, nodesState, summaryDescriptionsState } from "../../atoms"
import { capitalizeString, handleSaveSuggestionSummary } from "../../utils/utility"
import { Attribute, UserChoice } from "../../interfaces/interfaces"
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import { HEADER, SAVE_SUGESTED_SUMMARY_URL } from "../../utils/urls"
import { getSnapshotConceptualModel, getSnapshotDomainDescription } from "../../utils/snapshot"
import { SummaryUserEvaluationBody } from "../../interfaces/bodies"



const SummaryDescriptionsTab: React.FC = (): JSX.Element =>
{
    const summaryDescriptions = useRecoilValue(summaryDescriptionsState)
    const isLoadingSummaryDescriptions = useRecoilValue(isLoadingSummaryDescriptionsState)

    const [isClicked, setIsClicked] = useRecoilState(isSummaryDescriptionReactButtonClickedState)
    const domainDescriptionSnapshot = useRecoilValue(domainDescriptionSnapshotsState)
    const conceptualModelSnapshot = useRecoilValue(conceptualModelSnapshotState)

    const showReactButtons = (summaryDescriptions.classes.length !== 0 || summaryDescriptions.associations.length !== 0) && !isLoadingSummaryDescriptions

    
    const handleSaveSuggestion = (isPositiveReaction: boolean) =>
    {
        const userChoice = UserChoice.SUMMARY_DESCRIPTIONS
        handleSaveSuggestionSummary(userChoice, isPositiveReaction, domainDescriptionSnapshot, conceptualModelSnapshot, summaryDescriptions)

        setIsClicked(true)
    }


    return (
        <>
            {
                summaryDescriptions.classes.length > 0 && <Typography>Classes and attributes:</Typography>
            }
            
            <ul>
            {
                summaryDescriptions.classes.map((object) =>
                    <Typography component="span">
                        <li>
                            <strong>{ capitalizeString(object.class)}</strong>: {object.description}
                        </li>
                        { object.attributes.length > 0 &&
                            <ul>
                                <p></p>
                                <li><strong>Attributes</strong></li>
                                <ul>
                                    { object.attributes.map((attribute : Attribute) =>
                                        <li>
                                            <strong>{attribute.name}</strong>: {attribute.description}
                                        </li>
                                    )}
                                </ul>
                            </ul>
                        }
                        <p></p>
                    </Typography>
                )
            }

            </ul>

            {
                summaryDescriptions.associations.length > 0 && <Typography>Associations:</Typography>
            }

            <ul>
            {
                summaryDescriptions.associations.map((association) =>
                    <Typography component="span">
                        <li>
                            <strong> { capitalizeString(association.sourceClass) }</strong> {association.association} <strong>{capitalizeString(association.targetClass)}</strong>: {association.description}
                            {/* <IconButton>
                                <CheckIcon color="success"/>
                            </IconButton> */}
                        </li>
                    </Typography>
                )
            }
            </ul>

            { isLoadingSummaryDescriptions && <CircularProgress /> }

            {
                showReactButtons &&
                <Stack direction="row" spacing={"8px"}>
                    <Tooltip
                        title="Like"
                        enterDelay={500}
                        leaveDelay={200}>

                        <Button
                            size={ "small" }
                            color="inherit"
                            sx={{ textTransform: "none", maxWidth: "30px", maxHeight: "30px", minWidth: "30px", minHeight: "30px" }}
                            disabled={isClicked}
                            onClick={ () => { handleSaveSuggestion(true) } }
                            >
                                <ThumbUpIcon sx={{ width: "20px", height: "20px" }}/>
                        </Button>
                    </Tooltip>

                    <Tooltip
                        title="Dislike"
                        enterDelay={500}
                        leaveDelay={200}>

                        <Button
                            color="inherit"
                            size={ "small" }
                            sx={{ textTransform: "none", maxWidth: "50px", maxHeight: "30px", minWidth: "30px", minHeight: "30px", paddingRight: "10px" }}
                            disabled={isClicked}
                            onClick={ () => { handleSaveSuggestion(false) } }
                            >
                                <ThumbDownIcon sx={{ width: "20px", height: "20px" }}/>
                        </Button>
                    </Tooltip>
                </Stack>
            }
        </>
    )
}


export default SummaryDescriptionsTab