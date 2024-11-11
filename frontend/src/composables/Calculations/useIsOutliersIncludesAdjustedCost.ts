import useCalculations from '~/store/calculations'

export const useIsOutliersIncludesAdjustedCost = (adjustedCost: number) => {
  return useCalculations().outliers.includes(adjustedCost)
}
