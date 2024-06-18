import { Checkbox, Divider, FormControlLabel, FormLabel, Radio, RadioGroup, Stack } from "@mui/material"
import { useRecoilState } from "recoil"
import { isIgnoreDomainDescriptionState } from "../../atoms/domainDescription"
import { textFilteringVariationState } from "../../atoms/textFiltering"
import { TextFilteringVariation } from "../../definitions/textFilteringVariation"
import { SummaryPlainTextStyle } from "../../definitions/summary"
import { summaryTextStyleState } from "../../atoms/summary"


const SettingsTab: React.FC = (): JSX.Element =>
{
    const [isIgnoreDomainDescription, setIsIgnoreDomainDescription] = useRecoilState(isIgnoreDomainDescriptionState)
    const [textFilteringVariation, setTextFilteringVariation] = useRecoilState(textFilteringVariationState)
    const [summaryStyle, setSummaryStyle] = useRecoilState(summaryTextStyleState)


    const handleTextFilteringChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        const newTextFilteringVariation = event.target.value as TextFilteringVariation
        setTextFilteringVariation(newTextFilteringVariation)
    }

    const handleSummaryStyleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        const newSummaryStyle = event.target.value as SummaryPlainTextStyle
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
                <FormControlLabel value={SummaryPlainTextStyle.DEFAULT} control={<Radio />} label={SummaryPlainTextStyle.DEFAULT} />
                <FormControlLabel value={SummaryPlainTextStyle.EDUCATIONAL} control={<Radio />} label={SummaryPlainTextStyle.EDUCATIONAL} />
                <FormControlLabel value={SummaryPlainTextStyle.FUNNY_STORY} control={<Radio />} label={SummaryPlainTextStyle.FUNNY_STORY} />
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