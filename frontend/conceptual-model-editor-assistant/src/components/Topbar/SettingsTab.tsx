import { Checkbox, Divider, FormControlLabel, FormLabel, Radio, RadioGroup, Stack } from "@mui/material"
import { useRecoilState } from "recoil"
import { TextFilteringVariation } from "../../interfaces/interfaces"
import { isIgnoreDomainDescriptionState } from "../../atoms/domainDescription"
import { textFilteringVariationState } from "../../atoms/textFiltering"


const SettingsTab: React.FC = (): JSX.Element =>
{
    const [isIgnoreDomainDescription, setIsIgnoreDomainDescription] = useRecoilState(isIgnoreDomainDescriptionState)
    const [textFilteringVariation, setTextFilteringVariation] = useRecoilState(textFilteringVariationState)


    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        const newTextFilteringVariation = event.target.value as TextFilteringVariation
        setTextFilteringVariation(newTextFilteringVariation)
    }


    return (
        <Stack sx={{ width: "100%", height: "100%" }}>

            <FormControlLabel label="Ignore domain description"
                control={
                    <Checkbox
                        checked={ isIgnoreDomainDescription }
                        onChange={ () => setIsIgnoreDomainDescription(previousValue => !previousValue) }/>
                }/>

            <Divider sx={{ marginY: "50px" }}></Divider>

            <FormLabel> Domain description filtering </FormLabel>
            <RadioGroup row onChange={ handleChange } value={textFilteringVariation}>
                <FormControlLabel value={TextFilteringVariation.NONE} control={<Radio />} label={TextFilteringVariation.NONE} />
                <FormControlLabel value={TextFilteringVariation.SEMANTIC} control={<Radio />} label={TextFilteringVariation.SEMANTIC} />
                <FormControlLabel value={TextFilteringVariation.SYNTACTIC} control={<Radio />} label={TextFilteringVariation.SYNTACTIC} />
            </RadioGroup>

        </Stack>
    )
}

export default SettingsTab