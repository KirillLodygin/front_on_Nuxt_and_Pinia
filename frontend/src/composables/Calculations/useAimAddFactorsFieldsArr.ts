import useCalculations from '~/store/calculations'

export const useAimAddFactorsFieldsArr = () => {
  if ('add_factors' in useCalculations().aim && useCalculations().aim.add_factors) {
    return useCalculations().aim.add_factors.map(
      (add_factor: { field: string; label: string; value: string }) => add_factor.field,
    )
  }

  return []
}
