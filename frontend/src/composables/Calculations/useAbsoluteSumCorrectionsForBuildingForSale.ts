import useCalculations from '~/store/calculations'
import { useCorrectionCalculatedValue } from '~/composables/Calculations/useCorrectionCalculatedValue'
import { useFloorNumberGroupCorrection } from '~/composables/Calculations/useFloorNumberGroupCorrection'
import { useEngineeringCommunicationGroupCorrection } from '~/composables/Calculations/useEngineeringCommunicationGroupCorrection'

export const useAbsoluteSumCorrectionsForBuildingForSale = (index: number) => {
  let procent: number | string = 0

  for (const key in useCalculations().corrections) {
    if (
      !useCalculations().engineeringCommunicationArray.includes(key) &&
      !useCalculations().locationFloorArray.includes(key) &&
      !useCalculations().fieldsForLandPlotCorrection.includes(key) &&
      useCalculations().adjustableFields.includes(key)
    ) {
      if (
        useCorrectionCalculatedValue(
          key,
          useCalculations().corrections[key][0],
          useCalculations().corrections[key][index],
        ) === 'Ошибка!'
      ) {
        procent = useCorrectionCalculatedValue(
          key,
          useCalculations().corrections[key][0],
          useCalculations().corrections[key][index],
        )
        break
      }

      let singleProcent = Math.abs(
        Number(
          useCorrectionCalculatedValue(
            key,
            useCalculations().corrections[key][0],
            useCalculations().corrections[key][index],
          ),
        ),
      )

      if (useCalculations().isExpress) {
        singleProcent = isFinite(singleProcent) ? singleProcent : 0
      }

      procent += singleProcent
    }
  }

  if (procent === 'Ошибка!') return procent
  if (useFloorNumberGroupCorrection(index) === 'Ошибка!') return 'Ошибка!'
  if (useEngineeringCommunicationGroupCorrection(index) === 'Ошибка!') return 'Ошибка!'
  if (
    useCalculations().newPrices[index - 1][useCalculations().newPrices[index - 1].length - 3] === 'Ошибка!' ||
    useCalculations().newPrices[index - 1][useCalculations().newPrices[index - 1].length - 2] === 'Ошибка!'
  )
    return 'Ошибка!'

  const fieldsForLandPlotABSCorrection = Math.abs(
    (Number(useCalculations().newPrices[index - 1][useCalculations().newPrices[index - 1].length - 3]) /
      Number(useCalculations().newPrices[index - 1][useCalculations().newPrices[index - 1].length - 2]) -
      1) *
      100,
  )

  return (
    Number(procent) +
    Math.abs(Number(useEngineeringCommunicationGroupCorrection(index)) * 100) +
    Math.abs(Number(useFloorNumberGroupCorrection(index)) * 100) +
    fieldsForLandPlotABSCorrection
  )
}
