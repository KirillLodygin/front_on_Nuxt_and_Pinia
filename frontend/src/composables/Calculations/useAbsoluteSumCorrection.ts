import useCalculations from '~/store/calculations'
import { useCorrectionCalculatedValue } from '~/composables/Calculations/useCorrectionCalculatedValue'
import { useEngineeringCommunicationGroupCorrection } from '~/composables/Calculations/useEngineeringCommunicationGroupCorrection'
import { useFloorNumberGroupCorrection } from '~/composables/Calculations/useFloorNumberGroupCorrection'

export const useAbsoluteSumCorrection = (index: number) => {
  let procent: number | string = 0
  for (const key in useCalculations().corrections) {
    if (
      !useCalculations().engineeringCommunicationArray.includes(key) &&
      !useCalculations().locationFloorArray.includes(key) &&
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

  if (useEngineeringCommunicationGroupCorrection(index) === 'Ошибка!')
    return useEngineeringCommunicationGroupCorrection(index)

  if (useCalculations().aim.object_type !== 'L' && useFloorNumberGroupCorrection(index) === 'Ошибка!')
    return useFloorNumberGroupCorrection(index)

  return useCalculations().aim.object_type === 'L'
    ? Number(procent) + Math.abs(Number(useEngineeringCommunicationGroupCorrection(index)) * 100)
    : Number(procent) +
        Math.abs(Number(useEngineeringCommunicationGroupCorrection(index)) * 100) +
        Math.abs(Number(useFloorNumberGroupCorrection(index)) * 100)
}
