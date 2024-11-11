import { cloneDeep, isEqual } from 'lodash'
import useCalculations from '~/store/calculations'

export const useFloorNumberGroupCoefficients = (index: number) => {
  if (!useCalculations().adjustableFields.includes(useCalculations().locationFloorArray[0])) return 0
  if (useCalculations().referenceBooksSelected[useCalculations().locationFloorArray[0]].source === 'Ручное') {
    return useCalculations().corrections[useCalculations().locationFloorArray[0]][index]
  }

  let result = 0
  const floorNumberObj =
    index === 0
      ? cloneDeep(useCalculations().aim.floor_number)
      : cloneDeep(useCalculations().currentAnalogs[index - 1].floor_number)

  let objectArea =
    index === 0 ? useCalculations().aim.object_area : useCalculations().currentAnalogs[index - 1].object_area
  if (
    useCalculations().isExpress &&
    index !== 0 &&
    isEqual(
      cloneDeep(useCalculations().aim.floor_number),
      cloneDeep(useCalculations().currentAnalogs[index - 1].floor_number),
    )
  ) {
    objectArea = useCalculations().aim.object_area
  }

  for (const key in floorNumberObj) {
    const percent = floorNumberObj[key].area / objectArea
    const actualFloorOption = useCalculations().floorOptions.filter(
      (item) => (String(item.value).length > 1 && key.includes(item.value)) || key === item.value,
    )[0]

    result += percent * useCalculations().corrections[actualFloorOption.field][index]
  }

  return result
}
