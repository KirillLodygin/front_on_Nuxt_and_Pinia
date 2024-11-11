import { TERMS_OF_SALE, AVAILABILITY_OF_ENGINEERING_SUPPORT } from '~/app_constants/calculationsConsts'
import { useIsObjectHasClass } from '~/composables/Calculations/useIsObjectHasClass'
import useCalculations from '~/store/calculations'

const getReferenceBookValueType = (fieldName: string) => {
  const { group, book } = useCalculations().referenceBooksSelected[fieldName]

  if (fieldName === TERMS_OF_SALE && useCalculations().referenceBooksSelected[fieldName].source === 'Лейфер') {
    if (useIsObjectHasClass(fieldName)) {
      return useCalculations().referenceBooks[fieldName][group ?? 0].books[book ?? 0].json_data[0].slice(4)
    }
    return useCalculations().referenceBooks[fieldName][group ?? 0].books[book ?? 0].json_data[0].slice(3)
  }

  if (fieldName === AVAILABILITY_OF_ENGINEERING_SUPPORT) {
    return useCalculations().referenceBooks[fieldName][group ?? 0].books[book ?? 0].json_data[0].slice(3)
  }

  return useCalculations().referenceBooks[fieldName][group ?? 0].books[book ?? 0].json_data[0].slice(2)
}

export const useValueOptions = (fieldName: string) => {
  const options: Array<string | number> = []
  if (
    !useCalculations().referenceBooksSelected[fieldName] ||
    !useCalculations().referenceBooks[fieldName] ||
    !useCalculations().referenceBooks[fieldName].length ||
    useCalculations().referenceBooksSelected[fieldName].source === 'Ручное'
  ) {
    return options
  }
  const { group } = useCalculations().referenceBooksSelected[fieldName]
  if (useCalculations().referenceBooks[fieldName][group ?? 0].type_data === 'M') return options

  getReferenceBookValueType(fieldName).forEach((item) => {
    if (!options.includes(item) && item.toString().length) {
      options.push(item)
    }
  })
  return options.map((reference, index) => {
    return {
      value: index,
      display_name: reference,
    }
  })
}
