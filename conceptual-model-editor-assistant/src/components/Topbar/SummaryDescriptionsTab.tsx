import { Button, Typography, CircularProgress, IconButton, Stack, Tooltip } from "@mui/material"
import { useRecoilState, useRecoilValue } from "recoil"
import { conceptualModelSnapshotState, domainDescriptionSnapshotsState, edgesState, isLoadingSummaryDescriptionsState, isSummaryDescriptionReactButtonClickedState, nodesState, summaryDescriptionsState } from "../../atoms"
import { HEADER, SAVE_SUGESTION_URL, capitalizeString, getSnapshotConceptualModel, getSnapshotDomainDescription } from "../../hooks/useUtility"
import { Attribute, UserChoice } from "../../interfaces"
import CheckIcon from '@mui/icons-material/Check';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';



const SummaryDescriptionsTab: React.FC = (): JSX.Element =>
{
    const summaryDescriptions = useRecoilValue(summaryDescriptionsState)
    const isLoadingSummaryDescriptions = useRecoilValue(isLoadingSummaryDescriptionsState)

    const [isClicked, setIsClicked] = useRecoilState(isSummaryDescriptionReactButtonClickedState)
    const domainDescriptionSnapshot = useRecoilValue(domainDescriptionSnapshotsState)
    const conceptualModelSnapshot = useRecoilValue(conceptualModelSnapshotState)

    const showReactButtons = (summaryDescriptions.entities.length !== 0 || summaryDescriptions.relationships.length !== 0) && !isLoadingSummaryDescriptions

    
    const handleSaveSuggestion = (isPositiveReaction: boolean) =>
    {
        const currentDomainDescription = getSnapshotDomainDescription(UserChoice.SUMMARY_DESCRIPTIONS, domainDescriptionSnapshot)        
        const currentConceptualModel = getSnapshotConceptualModel(UserChoice.SUMMARY_PLAIN_TEXT, conceptualModelSnapshot)

        const suggestionData = { domainDescription: currentDomainDescription, isPositive: isPositiveReaction, item: summaryDescriptions, conceptualModel: currentConceptualModel }

        fetch(SAVE_SUGESTION_URL, { method: 'POST', headers: HEADER, body: JSON.stringify(suggestionData)})

        setIsClicked(true)
    }
    
    // const nodes = useRecoilValue(nodesState)
    // const edges = useRecoilValue(edgesState)

    // TODO: make function that returns objects with descriptions
    // - if the description is already present in the entity/attribute/relationship then this
    //   otherwise the new suggested description


    // previous implementation: https://github.com/Dominik7131/Conceptual-Modeling-LLM-Assistant/blob/4b71b1e6f62792f586e35b3baac58a4d8d9c10c5/conceptual-model-editor-assistant/src/components/Topbar.tsx
        
    // arguments:
    //  - selected nodes
    //  - selected edges
    // issue: how to distinguish existing descriptions vs. new descriptions that user did not accepted yet?

    // control flow:
    // 1) user selects some part of his conceptual model and clicks on summary2 button
    // 2) from selectedNodes and selectedEdges we obtain list of all selected entities, attributes and relationships
    // 3) for each entity, attribute and relationship: if it does not contain description then save it some object that we will later pass to LLM to generate descriptions
    // 4) send this object to LLM
    // 5) show to the user list of all selected items with their descriptions
    //  - if the description is newly generated from LLM then distinguish it with gray text and add buttons for the user to accept/reject the description
    //      - we know which description is newly generated by checking the object passed to LLM
    //  - otherwise show the description as usual (black text, no buttons)

    // TODO: Add unique keys

    return (
        <>
            {
                summaryDescriptions.entities.length > 0 && <Typography>Entities and attributes:</Typography>
            }
            
            <ul>
            {
                summaryDescriptions.entities.map((entity) =>
                    <Typography component="span">
                        <li>
                            <strong>{capitalizeString(entity.entity)}</strong>: {entity.description}
                            {/* <IconButton>
                                <CheckIcon color="success"/>
                            </IconButton> */}
                        </li>
                        { entity.attributes.length > 0 &&
                            <ul>
                                <p></p>
                                <li><strong>Attributes</strong></li>
                                <ul>
                                    {entity.attributes.map((attribute : Attribute) =>
                                        <li>
                                            <strong>{attribute.name}</strong>: {attribute.description}
                                            {/* <IconButton>
                                                <CheckIcon color="success"/>
                                            </IconButton> */}
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
                summaryDescriptions.relationships.length > 0 && <Typography>Relationships:</Typography>
            }

            <ul>
            {
                summaryDescriptions.relationships.map((relationship) =>
                    <Typography component="span">
                        <li>
                            <strong> { capitalizeString(relationship.sourceEntity) }</strong> {relationship.relationship} <strong>{capitalizeString(relationship.targetEntity)}</strong>: {relationship.description}
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
                            sx={{ textTransform: "none", maxWidth: '30px', maxHeight: '30px', minWidth: '30px', minHeight: '30px' }}
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
                            sx={{ textTransform: "none", maxWidth: '50px', maxHeight: '30px', minWidth: '30px', minHeight: '30px', paddingRight: "10px" }}
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