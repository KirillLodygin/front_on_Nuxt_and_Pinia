import useCalculations from '~/store/calculations'
import {
  ANALOGS_CAROUSEL_FUNC,
  ACCORDING_GUIDE,
  ANALOGS_CAROUSEL_ATTENTION_FUNC,
} from '~/app_constants/calculationsConsts'

export const useCorrectionButtonStyle = (field: string, key: string) => {
  if (!useCalculations().adjustableFields.includes(field)) {
    useCalculations().tabNameAttentionObject[key] = false
    return ANALOGS_CAROUSEL_FUNC
  }

  if (
    (useCalculations().referenceBooksSelected[field]?.source === 'Ручное' ||
      useCalculations().referenceBooksSelected[`${field}${ACCORDING_GUIDE}`]?.source === 'Ручное') &&
    useCalculations().corrections[field].reduce((sum, current) => +sum + Number(current), 0) !== 0 &&
    !useCalculations().notesObject[field]
  ) {
    useCalculations().tabNameAttentionObject[key] = true
    return ANALOGS_CAROUSEL_ATTENTION_FUNC
  }

  useCalculations().tabNameAttentionObject[key] = false
  return ANALOGS_CAROUSEL_FUNC
}
