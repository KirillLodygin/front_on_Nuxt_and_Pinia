import useCalculations from '~/store/calculations'
import { useAbsoluteSumCorrectionsForBuildingForSale } from '~/composables/Calculations/useAbsoluteSumCorrectionsForBuildingForSale'
import { useAbsoluteSumCorrection } from '~/composables/Calculations/useAbsoluteSumCorrection'

export const useCoefficientSum = () => {
  let coefSum = 0
  for (let i = 1; i < useCalculations().currentAnalogs.length + 1; i++) {
    let procentSum = 0

    const absoluteSumCorrection: number | string = useCalculations().isBuildingForSale
      ? useAbsoluteSumCorrectionsForBuildingForSale(i)
      : useAbsoluteSumCorrection(i)

    if (absoluteSumCorrection === 'Ошибка!') return absoluteSumCorrection

    if (absoluteSumCorrection === 0) {
      return 0
    } else {
      procentSum = 1 / Number(absoluteSumCorrection)
    }
    coefSum = coefSum + procentSum
  }
  return coefSum
}
