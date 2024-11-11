import useCalculations from '~/store/calculations'
import { useCorrectionCalculatedValue } from '~/composables/Calculations/useCorrectionCalculatedValue'

export const useFinalCorrections = (key: string, analogCounter: number) => {
  let correction = useCorrectionCalculatedValue(
    key,
    useCalculations().corrections[key][0],
    useCalculations().corrections[key][analogCounter],
  )

  if (useCalculations().isExpress) {
    correction = String(correction) !== 'Ошибка!' ? correction : 0
  }

  return correction
}
