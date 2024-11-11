import useCalculations from '~/store/calculations'

export const useRentCalculation = (field: string, counter: number) => {
  return useCalculations().rentCalculationObject[field][counter]
}
