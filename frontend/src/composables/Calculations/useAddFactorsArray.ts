import useCalculations from '~/store/calculations'

export const useAddFactorsArray = () => {
  return useCalculations().aim.add_factors?.map((obj: Record<string, string>) => obj.field)
}
