import {
  FUNC_PURPOSE,
  PRICE_SALE_PER_M,
  PRICE_SALE,
  OBJECT_AREA,
  ADS_UPDATED,
} from '~/app_constants/calculationsConsts'
import { numberWithSpaces, getNewDisplayName, getField } from '~/utils/calculationsUtils'
import { useAimValue } from '~/composables/Calculations/useAimValue'
import type { aimType } from '~/types/calculationsTypes'
import useCalculations from '~/store/calculations'
import useConstants from '~/store/constants'

export const useAnalogValue = (analog: aimType, field: string) => {
  const obj = useCalculations().fieldsForStageTwo.filter((item: Record<string, any>) => item.field === field)[0]
  if (field === ADS_UPDATED) {
    return analog[field]
  }

  if (field === 'id' && useCalculations().isExpress) return analog.id
  if (!obj) {
    return ''
  }
  let result: any

  if (field === FUNC_PURPOSE) {
    if (!useCalculations().isExpress) {
      if (!useCalculations().funcPurposeNamesArray.includes(obj.name.split(':')[0])) {
        useCalculations().funcPurposeNamesArray.push(obj.name.split(':')[0])
      }
      if (!useCalculations().funcPurposeNamesArray.includes(analog[field].name.split(':')[0])) {
        useCalculations().funcPurposeNamesArray.push(analog[field].name.split(':')[0])
      }
    } else {
      const fpName = useConstants().funcPurposes.find((fp: any) => fp.id === analog[field])?.name || ''
      if (!useCalculations().funcPurposeNamesArray.includes(fpName.split(':')[0])) {
        useCalculations().funcPurposeNamesArray.push(fpName.split(':')[0])
      }
    }
  }

  if (field === PRICE_SALE_PER_M) {
    result =
      Number(getField(analog, field)) === 0
        ? numberWithSpaces((Number(getField(analog, PRICE_SALE)) / Number(getField(analog, OBJECT_AREA))).toFixed(0))
        : numberWithSpaces(Number(getField(analog, field)).toFixed(0))
    if (!result && useCalculations().isMarketAnalysis) {
      result = useAimValue(field)
    }
    return result
  }

  if (obj.type !== 'choice') {
    result = Number(analog[field]) ? numberWithSpaces(Number(analog[field]).toFixed(2)) : analog[field]
    if (!result && useCalculations().isMarketAnalysis) {
      result = useAimValue(field)
    }
    return result
  }

  if (
    obj.choices.filter((item: Record<string, any>) => item.value === analog[field]).length === 0 &&
    useCalculations().isMarketAnalysis
  ) {
    return useAimValue(field)
  }

  return getNewDisplayName(
    obj.choices.filter((item: Record<string, any>) => item.value === analog[field])[0]?.display_name,
  )
}
