import type { aimType } from '~/types/calculationsTypes'
import useCalculations from '~/store/calculations'

export const useUtilitiesAndOperatingCostsList = (analog: aimType) => {
  let utilitiesItemsList = useCalculations().utilitiesArray.filter((item) => analog[item] === 'I')
  utilitiesItemsList = utilitiesItemsList.map((item) => {
    const obj = useCalculations().fieldsForStageTwo.filter((el) => el.field === item)[0]
    return obj.label
  })

  let operatingCostsList = useCalculations().operatingCostsArray.filter((item) => analog[item] === 'I')
  operatingCostsList = operatingCostsList.map((item) => {
    const obj = useCalculations().fieldsForStageTwo.filter((el) => el.field === item)[0]
    return obj.label
  })

  return utilitiesItemsList.concat(operatingCostsList)
}
