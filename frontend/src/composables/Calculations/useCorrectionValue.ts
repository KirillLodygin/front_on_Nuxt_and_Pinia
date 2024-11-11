import useCalculations from '~/store/calculations'

export const useCorrectionValue = (field: string, index: number) => {
  if (
    useCalculations().locationFloorArray.includes(field) &&
    useCalculations().referenceBooksSelected[useCalculations().locationFloorArray[0]].source === 'Ручное'
  ) {
    return '—'
  }

  if (
    useCalculations().engineeringCommunicationArray.includes(field) &&
    useCalculations().referenceBooksSelected[useCalculations().engineeringCommunicationArray[0]].source === 'Ручное'
  ) {
    return '—'
  }

  if (!useCalculations().adjustableFields.includes(field)) {
    return '—'
  }

  return useCalculations().corrections[field][index]
}
