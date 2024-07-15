from enum import Enum
from definitions.utility import UserChoice


class PromptTechniques(Enum):
    BASELINE = "baseline"
    COT = "cot"
    N_SHOT = "n-shot"
    N_SHOT_COT = "n-shot-cot"


# The undefined cases use the baseline variation by default
SELECTED_PROMPT_TECHNIQUES = {
    UserChoice.CLASSES.value: PromptTechniques.N_SHOT.value,
    UserChoice.ATTRIBUTES.value: PromptTechniques.N_SHOT_COT.value,
    UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value: PromptTechniques.N_SHOT_COT.value,
    UserChoice.ASSOCIATIONS_TWO_KNOWN_CLASSES.value: PromptTechniques.N_SHOT_COT.value,
}
