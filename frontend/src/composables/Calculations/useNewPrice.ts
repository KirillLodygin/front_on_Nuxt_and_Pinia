import { cloneDeep } from 'lodash'
import useCalculations from '~/store/calculations'

export const useNewPrice = (counter: number, index: number) => {
  if (index === -1) {
    return useCalculations().newPrices[counter][useCalculations().newPrices[counter].length - 1]
  }
  const newPricesLine = cloneDeep(useCalculations().newPrices)[counter]
  return newPricesLine[index + 1]
}
