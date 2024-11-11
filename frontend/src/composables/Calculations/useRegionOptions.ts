import type { regionOptionType, bookType } from '~/types/calculationsTypes'
import useCalculations from '~/store/calculations'

export const useRegionOptions = (fieldName: string) => {
  const regions: Array<regionOptionType> = []

  if (
    !useCalculations().referenceBooksSelected[fieldName] ||
    !useCalculations().referenceBooks[fieldName] ||
    !useCalculations().referenceBooks[fieldName].length
  ) {
    return regions
  }

  if (useCalculations().referenceBooksSelected[fieldName].source === 'Ручное') {
    useCalculations().referenceBooksSelected[fieldName].book = 0

    return regions
  }

  return useCalculations().referenceBooks[fieldName][
    useCalculations().referenceBooksSelected[fieldName].group ?? 0
  ].books.map((reference: bookType, index: number) => {
    return {
      value: index,
      display_name: reference.region,
    }
  })
}
