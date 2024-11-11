import { FLOOR_NUMBER } from '~/app_constants/calculationsConsts'
import type { referenceBookType } from '~/types/calculationsTypes'
import { useGroupsBySource } from '~/composables/Calculations/useGroupsBySource'
import useCalculations from '~/store/calculations'

export const useDateOptions = (field: string) => {
  if (!useCalculations().referenceBooksSelected[field]) {
    return []
  }

  if (useCalculations().referenceBooksSelected[field].source === 'Ручное') {
    useCalculations().referenceBooksSelected[field].group = 0
    return []
  }

  if (!useCalculations().locationFloorArray.includes(field) || field === FLOOR_NUMBER) {
    return useGroupsBySource(field).map((reference: [number, referenceBookType]) => {
      return {
        value: reference[0],
        display_name: reference[1].date_book.slice(0, 10).split('-').reverse().join('.'),
      }
    })
  }

  return []
}
