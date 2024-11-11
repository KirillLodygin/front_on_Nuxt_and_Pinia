import useCalculations from '~/store/calculations'
import { useEngineeringCommunicationGroupCoefficients } from '~/composables/Calculations/useEngineeringCommunicationGroupCoefficients'

export const useEngineeringCommunicationGroupCorrection = (analogCounter: number) => {
  if (!useCalculations().adjustableFields.includes(useCalculations().engineeringCommunicationArray[0])) return 0
  if (useEngineeringCommunicationGroupCoefficients(analogCounter) === 0) {
    if (useEngineeringCommunicationGroupCoefficients(0) === 0) return 0
    return 'Ошибка!'
  }

  if (
    useCalculations().referenceBooksSelected[useCalculations().engineeringCommunicationArray[0]].source === 'Ручное'
  ) {
    return useCalculations().corrections[useCalculations().engineeringCommunicationArray[0]][analogCounter] / 100
  }

  return (
    useEngineeringCommunicationGroupCoefficients(0) / useEngineeringCommunicationGroupCoefficients(analogCounter) - 1
  )
}
