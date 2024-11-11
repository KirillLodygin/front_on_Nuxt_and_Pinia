import useCalculations from '~/store/calculations'

export const useSourceOptions = (field: string) => {
  if (!useCalculations().referenceBooksSelected[field]) {
    return []
  }

  if (!useCalculations().referenceBooks[field] || !useCalculations().referenceBooks[field].length) {
    useCalculations().referenceBooksSelected[field].source = 'Ручное'
    return [
      {
        value: 'Ручное',
        display_name: 'Ручное',
      },
    ]
  }

  if (
    useCalculations().engineeringCommunicationArray.indexOf(field) === 0 &&
    useCalculations().engineeringCommunicationCorrectionsSource
  ) {
    return [
      {
        value: useCalculations().engineeringCommunicationCorrectionsSource,
        display_name: useCalculations().engineeringCommunicationCorrectionsSource,
      },
      {
        value: 'Ручное',
        display_name: 'Ручное',
      },
    ]
  }

  return [...useCalculations().referenceBookSourceLists[field]].map((reference) => {
    return {
      value: reference,
      display_name: reference,
    }
  })
}
