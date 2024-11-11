import useCalculations from '~/store/calculations'
import { useFloorNumberGroupCoefficients } from '~/composables/Calculations/useFloorNumberGroupCoefficients'

export const useFloorNumberGroupCorrection = (analogCounter: number) => {
  if (!useCalculations().adjustableFields.includes(useCalculations().locationFloorArray[0])) return 0
  if (useFloorNumberGroupCoefficients(analogCounter) === 0) {
    if (useFloorNumberGroupCoefficients(0) === 0) return 0
    return 'Ошибка!'
  }
  if (useCalculations().referenceBooksSelected[useCalculations().locationFloorArray[0]].source === 'Ручное') {
    return useCalculations().corrections[useCalculations().locationFloorArray[0]][analogCounter] / 100
  }

  return useFloorNumberGroupCoefficients(0) / useFloorNumberGroupCoefficients(analogCounter) - 1
}
