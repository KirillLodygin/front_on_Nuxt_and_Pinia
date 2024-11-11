import { FLOOR_NUMBER, UTILITIES } from '~/app_constants/calculationsConsts'
import useCalculations from '~/store/calculations'
import { useDateOptions } from '~/composables/Calculations/useDateOptions'

export const useReferenceBookGroupListFormula = (source: string, group: number, field: string) => {
  if (
    source === 'Ручное' ||
    (useCalculations().locationFloorArray.includes(field) && field !== FLOOR_NUMBER) ||
    (useCalculations().utilitiesArray.includes(field) && field !== UTILITIES) ||
    useCalculations().operatingCostsArray.includes(field) ||
    !useDateOptions(field).filter((item) => item.value === group)[0]
  )
    return ''

  const dateBook = useDateOptions(field).filter((item) => item.value === group)[0].display_name

  const obj = useCalculations()
    .referenceBooks[field].filter((item) => item.source === source)
    .filter((item) => item.date_book.slice(0, 10).split('-').reverse().join('.') === dateBook)[0]

  return obj ? obj.formula : ''
}
