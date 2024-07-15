import { Checkbox, Divider, FormControlLabel, FormLabel, Radio, RadioGroup, Stack } from "@mui/material"
import { useRecoilState } from "recoil"
import { isIgnoreDomainDescriptionState } from "../../atoms/domainDescription"
import { textFilteringVariationState } from "../../atoms/textFiltering"
import { TextFilteringVariation } from "../../definitions/textFilteringVariation"
import { SummaryStyle } from "../../definitions/summary"
import { summaryPlainTextStyleState } from "../../atoms/summary"


const SettingsTab: React.FC = (): JSX.Element =>
{
    const [isIgnoreDomainDescription, setIsIgnoreDomainDescription] = useRecoilState(isIgnoreDomainDescriptionState)
    const [textFilteringVariation, setTextFilteringVariation] = useRecoilState(textFilteringVariationState)
    const [summaryStyle, setSummaryStyle] = useRecoilState(summaryPlainTextStyleState)


    const handleTextFilteringChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        const newTextFilteringVariation = event.target.value as TextFilteringVariation
        setTextFilteringVariation(newTextFilteringVariation)
    }

    const handleSummaryStyleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        const newSummaryStyle = event.target.value as SummaryStyle
        setSummaryStyle(newSummaryStyle)
    }


    return (
        <Stack sx={{ width: "100%", height: "100%" }}>

            <FormControlLabel label="Ignore domain description"
                control={
                    <Checkbox
                        checked={ isIgnoreDomainDescription }
                        onChange={ () => setIsIgnoreDomainDescription(previousValue => !previousValue) }/>
                }/>

            <Divider sx={{ marginY: "30px" }}></Divider>

            <FormLabel> Summary plain text style </FormLabel>
            <RadioGroup row onChange={ handleSummaryStyleChange } value={ summaryStyle }>
                <FormControlLabel value={SummaryStyle.NOT_SPECIFIED} control={<Radio />} label={"not specified"} />
                <FormControlLabel value={SummaryStyle.ANALYTICAL} control={<Radio />} label={SummaryStyle.ANALYTICAL} />
                <FormControlLabel value={SummaryStyle.EDUCATIONAL} control={<Radio />} label={SummaryStyle.EDUCATIONAL} />
                <FormControlLabel value={SummaryStyle.FUNNY_STORY} control={<Radio />} label={SummaryStyle.FUNNY_STORY} />
            </RadioGroup>

            <Divider sx={{ marginY: "30px" }}></Divider>

            <FormLabel> Domain description filtering </FormLabel>
            <RadioGroup row onChange={ handleTextFilteringChange } value={ textFilteringVariation }>
                <FormControlLabel value={TextFilteringVariation.NONE} control={<Radio />} label={TextFilteringVariation.NONE} />
                <FormControlLabel value={TextFilteringVariation.SEMANTIC} control={<Radio />} label={TextFilteringVariation.SEMANTIC} />
                <FormControlLabel value={TextFilteringVariation.SYNTACTIC} control={<Radio />} label={TextFilteringVariation.SYNTACTIC} />
            </RadioGroup>

        </Stack>
    )
}

export default SettingsTab