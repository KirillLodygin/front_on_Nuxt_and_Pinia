import useCalculations from '~/store/calculations'
import type { aimType } from '~/types/calculationsTypes'

export const useAnalogEngineeringCommunicationList = (analog: aimType) => {
  const listItems = useCalculations()
    .engineeringCommunicationArray.slice(1)
    .filter((item) => analog[item] === 'E')
  return listItems.map((item) => {
    const obj = useCalculations().fieldsForStageTwo.filter((el) => el.field === item)[0]
    return obj.label
  })
}
