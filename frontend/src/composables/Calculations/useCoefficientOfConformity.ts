import useCalculations from '~/store/calculations'
import { useAbsoluteSumCorrectionsForBuildingForSale } from '~/composables/Calculations/useAbsoluteSumCorrectionsForBuildingForSale'
import { useAbsoluteSumCorrection } from '~/composables/Calculations/useAbsoluteSumCorrection'

export const useCoefficientOfConformity = (index: number) => {
  const absoluteSumCorrection = useCalculations().isBuildingForSale
    ? useAbsoluteSumCorrectionsForBuildingForSale(index)
    : useAbsoluteSumCorrection(index)
  if (absoluteSumCorrection === 'Ошибка!') return 'Ошибка!'
  return 1 / (Number(absoluteSumCorrection) / 100)
}
