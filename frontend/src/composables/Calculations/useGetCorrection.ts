import { formatCorrectionFloat } from '~/utils/calculationsUtils'
import useCalculations from '~/store/calculations'

export const useGetCorrection = (field: string, index: number) => {
  if (
    useCalculations().locationFloorArray.includes(field) &&
    useCalculations().referenceBooksSelected[useCalculations().locationFloorArray[0]].source === 'Ручное'
  ) {
    return '—'
  }

  if (
    useCalculations().engineeringCommunicationArray.includes(field) &&
    useCalculations().referenceBooksSelected[useCalculations().engineeringCommunicationArray[0]].source === 'Ручное'
  )
    return '—'

  if (!useCalculations().adjustableFields.includes(field)) return '—'

  if (
    useCalculations().corrections[field][0] === useCalculations().corrections[field][index] &&
    useCalculations().corrections[field][0] === 0
  )
    return formatCorrectionFloat(0)

  if (useCalculations().corrections[field][index] === 0) return '—'

  if (!useCalculations().corrections[field][index]) return useCalculations().corrections[field][index]

  return useCalculations().corrections[field][index]
}
