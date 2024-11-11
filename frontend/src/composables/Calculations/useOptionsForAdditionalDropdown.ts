import { TERMS_OF_SALE } from '~/app_constants/calculationsConsts'
import type { optionsForAdditionalDropdownType, bookJsonStringType } from '~/types/calculationsTypes'
import useCalculations from '~/store/calculations'
import { useIsObjectHasClass } from '~/composables/Calculations/useIsObjectHasClass'

export const useOptionsForAdditionalDropdown = (fieldName: string) => {
  const options: Array<optionsForAdditionalDropdownType> = []
  let index = fieldName === TERMS_OF_SALE ? 2 : 1
  if (useIsObjectHasClass(fieldName)) {
    index += 1
  }

  const { group, book } = useCalculations().referenceBooksSelected[fieldName]
  const jsonData: Array<string | number> = useCalculations()
    .referenceBooks[fieldName][group ?? 0].books[book ?? 0].json_data.slice(
      useCalculations().referenceBooks[fieldName][group ?? 0].type_data === 'M' ? 2 : 1,
    )
    .map((item: bookJsonStringType) => item[index])

  Array.from(new Set(jsonData)).forEach((item: string | number) => {
    options.push({
      value: item,
      display_name: item,
      disabled: false,
    })
  })

  return options
}
