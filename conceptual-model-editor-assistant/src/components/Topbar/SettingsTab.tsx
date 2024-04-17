import { Checkbox, Divider, FormControlLabel, FormLabel, Radio, RadioGroup, Slider, Stack, Typography } from "@mui/material"
import { useRecoilState } from "recoil"
import { isIgnoreDomainDescriptionState } from "../../atoms"


const SettingsTab: React.FC = (): JSX.Element =>
{
    const [isIgnoreDomainDescription, setIsIgnoreDomainDescription] = useRecoilState(isIgnoreDomainDescriptionState)


    return (
        <Stack>
            <FormLabel > Domain description filtering </FormLabel >
            <RadioGroup row defaultValue="Syntactit">
                <FormControlLabel value="None" control={<Radio />} label="None" />
                <FormControlLabel value="Semantic" control={<Radio />} label="Semantic" />
                <FormControlLabel value="Syntactit" control={<Radio />} label="Syntactic" />
            </RadioGroup>

            <p></p>
            <Divider></Divider>
            <p></p>

            

            <FormControlLabel label="Ignore domain description"
                control={
                    <Checkbox
                        checked={isIgnoreDomainDescription}
                        onChange={() => setIsIgnoreDomainDescription(previousValue => !previousValue)}/>
                    }/>
            
            <p></p>
            <Divider></Divider>
            <p></p>

            {/* {TODO: Make something more like this: https://mui.com/material-ui/react-slider/#slider-with-input-field} */}
            <Typography
                id="input-slider"
                gutterBottom>
                    Temperature
            </Typography>

            <Slider
                aria-label="Temperature"
                defaultValue={0}
                valueLabelDisplay="auto" 
                shiftStep={0.1}
                step={0.1}
                marks
                min={0}
                max={2}
                sx={{ width: "200px" }}>
            </Slider>
        </Stack>
    )
}

export default SettingsTab