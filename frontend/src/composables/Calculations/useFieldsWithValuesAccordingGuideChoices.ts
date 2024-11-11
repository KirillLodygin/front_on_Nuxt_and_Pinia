import useCalculations from '~/store/calculations'
import { useOptionsForAdditionalDropdown } from '~/composables/Calculations/useOptionsForAdditionalDropdown'

export const useFieldsWithValuesAccordingGuideChoices = (field: string) => {
  if (!useCalculations().adjustableFields.includes(field)) return []
  if (
    !useCalculations().referenceBooks[field]?.length ||
    useCalculations().referenceBooksSelected[field].source === 'Ручное'
  ) {
    return []
  }
  return useOptionsForAdditionalDropdown(field)
}
