import useCalculations from '~/store/calculations'
import { useAimValue } from '~/composables/Calculations/useAimValue'
import { useAnalogValue } from '~/composables/Calculations/useAnalogValue'
import { useValueForFieldWithValuesAccordingGuide } from '~/composables/Calculations/useValueForFieldWithValuesAccordingGuide'
import { useFieldsWithValuesAccordingGuideChoices } from '~/composables/Calculations/useFieldsWithValuesAccordingGuideChoices'
import { ACCORDING_GUIDE } from '~/app_constants/calculationsConsts'

export const useInitIsFieldWithValuesAccordingGuideListOpen = () => {
  const isFieldWithValuesAccordingGuideListOpen: Record<string, Array<boolean>> = {}

  useCalculations().fieldsWithValuesAccordingGuideArray.forEach((field) => {
    isFieldWithValuesAccordingGuideListOpen[field] = []
    for (let i = 0; i < useCalculations().objects.length; i++) {
      const startValue: string =
        i === 0
          ? useAimValue(field.replace(ACCORDING_GUIDE, ''))
          : useAnalogValue(useCalculations().currentAnalogs[i - 1], field.replace(ACCORDING_GUIDE, ''))

      if (startValue) {
        useCalculations().updateFieldsWithValuesAccordingGuideValuesField(
          field,
          useValueForFieldWithValuesAccordingGuide(startValue, field, useFieldsWithValuesAccordingGuideChoices(field)),
          i,
        )
      }

      isFieldWithValuesAccordingGuideListOpen[field].push(false)
    }
  })

  return isFieldWithValuesAccordingGuideListOpen
}
