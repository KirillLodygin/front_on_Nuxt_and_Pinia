import { THIRD_FLOOR_AND_ABOVE_LOCATION_COEFFICIENT } from '~/app_constants/calculationsConsts'
import useCalculations from '~/store/calculations'

export const useCorrection = () => {
  const corrections: Record<string, Array<number>> = {}

  for (const item of useCalculations().fieldsForStageTwo) {
    if (
      item.hasCorrection ||
      useCalculations().utilitiesArray.includes(item.field) ||
      useCalculations().operatingCostsArray.includes(item.field) ||
      useCalculations().locationFloorArray.includes(item.field) ||
      useCalculations().fieldsWithValuesAccordingGuideArray.includes(item.field) ||
      useCalculations().engineeringCommunicationArray.includes(item.field)
    ) {
      corrections[item.field] = []
      useCalculations().adjustableFields.push(item.field)
      for (let i = 0; i < useCalculations().objects.length; i++) {
        corrections[item.field][i] = 0
      }
    }
  }
  const TRGroup = useCalculations()
    .floorOptions.map((option) => option.value)
    .filter((item) => item.includes('TR') && item.length > 2)
  if (TRGroup.length) {
    for (let y = 1; y < TRGroup.length + 1; y++) {
      corrections[`${THIRD_FLOOR_AND_ABOVE_LOCATION_COEFFICIENT}${y}`] = []
      for (let i = 0; i < useCalculations().objects.length; i++) {
        corrections[`${THIRD_FLOOR_AND_ABOVE_LOCATION_COEFFICIENT}${y}`][i] = 0
      }
    }
  }

  return corrections
}
