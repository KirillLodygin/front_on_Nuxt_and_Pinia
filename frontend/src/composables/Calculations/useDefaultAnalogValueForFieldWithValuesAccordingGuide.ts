import { isEmpty } from 'lodash'
import useCalculations from '~/store/calculations'
import { ACCORDING_GUIDE } from '~/app_constants/calculationsConsts'
import type { optionsForAdditionalDropdownType } from '~/types/calculationsTypes'
import { useOptionsForAdditionalDropdown } from '~/composables/Calculations/useOptionsForAdditionalDropdown'
import { useValueForFieldWithValuesAccordingGuide } from '~/composables/Calculations/useValueForFieldWithValuesAccordingGuide'
import { useFieldsWithValuesAccordingGuideChoices } from '~/composables/Calculations/useFieldsWithValuesAccordingGuideChoices'

export const useDefaultAnalogValueForFieldWithValuesAccordingGuide = (analog: Record<string, any>, field: string) => {
  if (!field) return ''
  if (
    useCalculations().referenceBooksSelected[field].source === 'Ручное' ||
    !useCalculations().adjustableFields.includes(field)
  )
    return ''

  if (useCalculations().referenceBooksSelected[field].source !== 'Лейфер') {
    const values = useOptionsForAdditionalDropdown(field).map((item: optionsForAdditionalDropdownType) => item.value)
    return analog[field] && values.includes(analog[field]) ? analog[field] : ''
  }

  if (analog[field]) return analog[field]

  let value = analog[field.replace(ACCORDING_GUIDE, '')]
  if (value) {
    const fieldObject = useCalculations().aimModalFields.filter(
      (obj: Record<string, any>) => obj.field === field.replace(ACCORDING_GUIDE, ''),
    )[0]
    value = fieldObject.choices.filter((choice: { value: string; display_name: string }) => choice.value === value)[0]
      .display_name
  }
  if (!isEmpty(useCalculations().order)) {
    const idsArr = useCalculations().selectedAnalogs.map((analog: Record<string, any>) => analog.id)
    const index = idsArr.indexOf(analog.id)
    return useCalculations().fieldsWithValuesAccordingGuideValues[field][index + 1]
  }

  return useValueForFieldWithValuesAccordingGuide(value, field, useFieldsWithValuesAccordingGuideChoices(field))
}
