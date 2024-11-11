import useCalculations from '~/store/calculations'
import { useSecondGroupFieldsFinalCorrections } from '~/composables/Calculations/useSecondGroupFieldsFinalCorrections'
import { useEngineeringCommunicationGroupCorrection } from '~/composables/Calculations/useEngineeringCommunicationGroupCorrection'
import { useFloorNumberGroupCorrection } from '~/composables/Calculations/useFloorNumberGroupCorrection'

export const useFinalAdjustment = (analogCounter: number): number | string => {
  const engineeringCommunicationGroupCorrection = useEngineeringCommunicationGroupCorrection(analogCounter)
    ? useEngineeringCommunicationGroupCorrection(analogCounter)
    : 0
  if (engineeringCommunicationGroupCorrection === 'Ошибка!') return 'Ошибка!'

  if (useCalculations().aim.object_type === 'L')
    return (
      Number(useSecondGroupFieldsFinalCorrections(analogCounter)) +
      Number(engineeringCommunicationGroupCorrection) * 100
    )

  const floorNumberGroupCorrection = useFloorNumberGroupCorrection(analogCounter)
    ? useFloorNumberGroupCorrection(analogCounter)
    : 0
  if (floorNumberGroupCorrection === 'Ошибка!') return 'Ошибка!'

  if (String(useSecondGroupFieldsFinalCorrections(analogCounter)) === 'Ошибка!')
    return useSecondGroupFieldsFinalCorrections(analogCounter)

  return (
    Number(useSecondGroupFieldsFinalCorrections(analogCounter)) +
    Number(engineeringCommunicationGroupCorrection) * 100 +
    Number(floorNumberGroupCorrection) * 100
  )
}
