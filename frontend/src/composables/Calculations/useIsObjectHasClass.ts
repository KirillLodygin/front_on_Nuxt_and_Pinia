import { TERMS_OF_SALE } from '~/app_constants/calculationsConsts'
import useCalculations from '~/store/calculations'

export const useIsObjectHasClass = (fieldName: string) => {
  if (fieldName !== TERMS_OF_SALE) {
    return false
  }

  const { group: groupNum, book: bookNum, source } = useCalculations().referenceBooksSelected[fieldName]
  if (source !== 'Лейфер') {
    return false
  }

  const book = useCalculations().referenceBooks[fieldName][groupNum ?? 0].books[bookNum ?? 0].json_data

  return book[0][2] === 'Класс объекта'
}
