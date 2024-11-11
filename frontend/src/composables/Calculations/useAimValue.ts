import { numberWithSpaces, getNewDisplayName } from '~/utils/calculationsUtils'
import useCalculations from '~/store/calculations'

export const useAimValue = (field: string) => {
  const obj = useCalculations().fieldsForStageTwo.filter((item) => item.field === field)[0]
  if (field === 'id' && useCalculations().isExpress) return useCalculations().aim.id
  if (!obj) {
    return ''
  }

  if (obj.type !== 'choice') {
    return Number(useCalculations().aim[field])
      ? numberWithSpaces(Number(useCalculations().aim[field]).toFixed(2))
      : useCalculations().aim[field]
  }

  return getNewDisplayName(
    obj.choices.filter((item: Record<string, any>) => item.value === useCalculations().aim[field])[0]?.display_name,
  )
}
