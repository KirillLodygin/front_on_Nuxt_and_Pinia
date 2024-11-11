import { cloneDeep } from 'lodash'
import {
  THIRD_FLOOR_AND_ABOVE_LOCATION_COEFFICIENT,
  COMPOSITION_ELEMENTS_SECOND_GROUP,
} from '~/app_constants/calculationsConsts'
import useCalculations from '~/store/calculations'

export const useRebuiltObjectEvolutionTableStageTwoArray = () => {
  const objectEvolutionTableStageTwoArray = cloneDeep(useCalculations().objectEvolutionTableStageTwoArray)
  const floorsForSecondGroup = []
  for (let i = 1; i < useCalculations().TRGroup.length + 1; i++) {
    floorsForSecondGroup.push(`${THIRD_FLOOR_AND_ABOVE_LOCATION_COEFFICIENT}${i}`)
  }

  const index = useCalculations().objectEvolutionTableStageTwoArray.findIndex(
    (item) => item.group === COMPOSITION_ELEMENTS_SECOND_GROUP,
  )
  const newSecondGroup = cloneDeep(useCalculations().objectEvolutionTableStageTwoArray[index])
  const indexForFloorsForSecondGroup = newSecondGroup.fields.indexOf(
    THIRD_FLOOR_AND_ABOVE_LOCATION_COEFFICIENT.slice(0, -1),
  )
  const firsPiece = newSecondGroup.fields.slice(0, indexForFloorsForSecondGroup + 1)
  const secondPiece = newSecondGroup.fields.slice(indexForFloorsForSecondGroup + 1)
  newSecondGroup.fields = firsPiece.concat(floorsForSecondGroup).concat(secondPiece)
  objectEvolutionTableStageTwoArray[index] = newSecondGroup
  return objectEvolutionTableStageTwoArray
}
