import useCalculations from '~/store/calculations'
import { useAimEngineeringCommunicationList } from '~/composables/Calculations/useAimEngineeringCommunicationList'
import { useAnalogEngineeringCommunicationList } from '~/composables/Calculations/useAnalogEngineeringCommunicationList'

export const useEngineeringCommunicationGroupCoefficients = (index: number) => {
  if (!useCalculations().referenceBooksSelected[useCalculations().engineeringCommunicationArray[0]]) return 1
  if (!useCalculations().adjustableFields.includes(useCalculations().engineeringCommunicationArray[0])) return 0

  if (
    useCalculations().referenceBooksSelected[useCalculations().engineeringCommunicationArray[0]].source === 'Ручное'
  ) {
    return useCalculations().corrections[useCalculations().engineeringCommunicationArray[0]][index]
  }

  let engineeringCommunicationList: Array<string> = []
  if (index > 0) {
    engineeringCommunicationList = useAnalogEngineeringCommunicationList(useCalculations().currentAnalogs[index - 1])
  } else {
    engineeringCommunicationList = useAimEngineeringCommunicationList()
  }

  const actualEngineeringCommunicationArray = Object.keys(useCalculations().engineeringCommunicationObject).filter(
    (key) => engineeringCommunicationList.includes(useCalculations().engineeringCommunicationObject[key]),
  )

  let result = 1
  for (const key of useCalculations().engineeringCommunicationArray.slice(1)) {
    const correction = actualEngineeringCommunicationArray.includes(key) ? 1 : useCalculations().corrections[key][index]
    result = result * correction
  }

  return result
}
