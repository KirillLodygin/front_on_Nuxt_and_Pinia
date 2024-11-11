import type { optionsForAdditionalDropdownType } from '~/types/calculationsTypes'
import { WALLS_MATERIAL_ACCORDING_GUIDE, TECH_STATUS_ACCORDING_GUIDE } from '~/app_constants/calculationsConsts'
import {
  wallsMaterialAccordingGuide,
  techStatusAccordingGuide,
  conditionFinishAccordingGuide,
} from '~/app_constants/calculationsConsts'
import useCalculations from '~/store/calculations'

export const useValueForFieldWithValuesAccordingGuide = (
  value: string,
  field: string,
  options: optionsForAdditionalDropdownType[],
) => {
  let controlValue = value

  if (useCalculations().aim.func_purpose.name) {
    switch (field) {
      case WALLS_MATERIAL_ACCORDING_GUIDE:
        if (Object.keys(wallsMaterialAccordingGuide).includes(controlValue)) {
          controlValue = wallsMaterialAccordingGuide[controlValue]
        }
        break

      case TECH_STATUS_ACCORDING_GUIDE:
        if (Object.keys(techStatusAccordingGuide).includes(controlValue)) {
          controlValue = techStatusAccordingGuide[controlValue]
        }
        break

      default:
        if (
          Object.keys(conditionFinishAccordingGuide[useCalculations().aim.func_purpose.name]).includes(controlValue)
        ) {
          controlValue = conditionFinishAccordingGuide[useCalculations().aim.func_purpose.name][controlValue]
        }
    }
  }

  return options.filter((item) => item.value === controlValue)[0]
    ? options.filter((item) => item.value === controlValue)[0].value
    : ''
}
