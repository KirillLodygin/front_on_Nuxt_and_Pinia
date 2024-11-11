import type { referenceBookType } from '~/types/calculationsTypes'
import useCalculations from '~/store/calculations'

export const useGroupsBySource = (fieldName: string) => {
  const filteredBySourceGroups: Array<[number, referenceBookType]> = []

  if (
    useCalculations().referenceBooksSelected[fieldName].source === 'Ручное' ||
    !useCalculations().referenceBooks[fieldName]
  ) {
    useCalculations().referenceBooksSelected[fieldName].group = null
    return filteredBySourceGroups
  }

  for (const groupEntry of useCalculations().referenceBooks[fieldName].entries()) {
    const group = groupEntry[1]

    if (group.source === useCalculations().referenceBooksSelected[fieldName].source) {
      filteredBySourceGroups.push(groupEntry)
    }
  }

  filteredBySourceGroups.sort((a, b) => {
    const aDate = new Date(a[1].date_book)
    const bDate = new Date(b[1].date_book)
    if (aDate > bDate) return -1
    if (aDate < bDate) return 1
    return 0
  })

  return filteredBySourceGroups
}
