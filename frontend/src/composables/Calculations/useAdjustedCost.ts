import { useFinalAdjustment } from '~/composables/Calculations/useFinalAdjustment'
import { useFinalPrice } from '~/composables/Calculations/useFinalPrice'

export const useAdjustedCost = (counter: number) => {
  if (useFinalPrice(counter - 1) === 'Ошибка!') return 'Ошибка!'
  return useFinalAdjustment(counter) === 'Ошибка!'
    ? useFinalAdjustment(counter)
    : Number(useFinalPrice(counter - 1)) * (1 + Number(useFinalAdjustment(counter)) / 100)
}
