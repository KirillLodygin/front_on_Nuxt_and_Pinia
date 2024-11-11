import useCalculations from '~/store/calculations'
import { THIRD_FLOOR_AND_ABOVE_LOCATION_COEFFICIENT } from '~/app_constants/calculationsConsts'

export const useRebuiltStageTwoTableAllFieldsArr = () => {
  const floorsForSecondGroup = []
  for (let i = 1; i < useCalculations().TRGroup.length + 1; i++) {
    floorsForSecondGroup.push(`${THIRD_FLOOR_AND_ABOVE_LOCATION_COEFFICIENT}${i}`)
  }
  return useCalculations().stageTwoTableAllFieldsArr.concat(floorsForSecondGroup)
}
