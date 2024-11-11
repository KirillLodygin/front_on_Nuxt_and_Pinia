import useComparison from '~/store/comparison'

export const useCollectCompareForSave = () => {
  if (useComparison().compareNewLabel) {
    useComparison().setNewCompareName(useComparison().compareNewLabel)
  }

  return {
    comparation_objects: useComparison().currentComparisonObjects,
    comparation_data: useComparison().currentPricingFactorsArr,
    name: useComparison().compareName,
    description: useComparison().description,
  }
}
