import useCalculations from '~/store/calculations'

export const useBookBySource = (fieldName: string) => {
  const filteredBySourceBooks = []
  const books =
    useCalculations().referenceBooks[fieldName][useCalculations().referenceBooksSelected[fieldName].group ?? 0].books
  for (const groupEntry of books.entries()) {
    filteredBySourceBooks.push(groupEntry)
  }
  return filteredBySourceBooks
}
