import useCalculations from '~/store/calculations'

export const useFinalPrice = (counter: number) => {
  return useCalculations().newPrices[counter][useCalculations().newPrices[counter].length - 1]
}
