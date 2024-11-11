import { TERMS_OF_SALE } from '~/app_constants/calculationsConsts'
import useCalculations from '~/store/calculations'
import { useOptionsForAdditionalDropdown } from '~/composables/Calculations/useOptionsForAdditionalDropdown'
import { useIsShowMarketTypeSelect } from '~/composables/Calculations/useIsShowMarketTypeSelect'

export const useMarketTypeOptions = (fieldName: string) => {
  if (fieldName !== TERMS_OF_SALE || !useIsShowMarketTypeSelect()) {
    return []
  }

  if (
    !useCalculations().referenceBooks[fieldName].length ||
    useCalculations().referenceBooksSelected[fieldName].source !== 'Лейфер'
  ) {
    return []
  }

  return useOptionsForAdditionalDropdown(fieldName)
}
