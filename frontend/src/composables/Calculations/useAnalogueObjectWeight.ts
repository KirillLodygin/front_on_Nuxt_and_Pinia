import useCalculations from '~/store/calculations'
import { useCoefficientOfConformity } from '~/composables/Calculations/useCoefficientOfConformity'
import { useCoefficientSum } from '~/composables/Calculations/useCoefficientSum'

export const useAnalogueObjectWeight = (index: number) => {
  const quotient =
    useCoefficientOfConformity(index) === 'Ошибка!' || useCoefficientSum() === 'Ошибка!'
      ? 'Ошибка!'
      : Number(useCoefficientOfConformity(index)) / Number(useCoefficientSum())

  useCalculations().updateAnalogueObjectWeightArray(index - 1, quotient)
  return quotient
}
