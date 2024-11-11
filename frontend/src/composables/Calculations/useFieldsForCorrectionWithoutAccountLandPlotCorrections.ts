import useCalculations from '~/store/calculations'
import { useEngineeringCommunicationGroupCorrection } from '~/composables/Calculations/useEngineeringCommunicationGroupCorrection'
import { useFloorNumberGroupCorrection } from '~/composables/Calculations/useFloorNumberGroupCorrection'
import { useFinalCorrections } from '~/composables/Calculations/useFinalCorrections'

export const useFieldsForCorrectionWithoutAccountLandPlotCorrections = (analogCounter: number) => {
  if (
    String(useEngineeringCommunicationGroupCorrection(analogCounter)) == 'Ошибка!' ||
    String(useFloorNumberGroupCorrection(analogCounter)) == 'Ошибка!'
  )
    return 'Ошибка!'

  const engineeringCommunicationGroupCorrection: number = useEngineeringCommunicationGroupCorrection(analogCounter)
    ? Number(useEngineeringCommunicationGroupCorrection(analogCounter))
    : 0
  const floorNumberGroupCorrection: number = useFloorNumberGroupCorrection(analogCounter)
    ? Number(useFloorNumberGroupCorrection(analogCounter))
    : 0

  let result: number | string = 0

  useCalculations()
    .fieldsForCorrectionWithoutAccountLandPlot.filter(
      (item: string) =>
        !useCalculations().engineeringCommunicationArray.includes(item) &&
        !useCalculations().locationFloorArray.includes(item) &&
        Object.keys(useCalculations().corrections).includes(item) &&
        useCalculations().adjustableFields.includes(item),
    )
    .forEach((key: string) => {
      result =
        useFinalCorrections(key, analogCounter) === 'Ошибка!' || result === 'Ошибка!'
          ? 'Ошибка!'
          : Number(result) + Number(useFinalCorrections(key, analogCounter))
    })

  return String(result) === 'Ошибка!'
    ? result
    : Number(result) + engineeringCommunicationGroupCorrection + floorNumberGroupCorrection
}
