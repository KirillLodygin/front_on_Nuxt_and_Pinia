import { TERMS_OF_SALE } from '~/app_constants/calculationsConsts'
import useCalculations from '~/store/calculations'

export const useIsShowMarketTypeSelect = () => {
  return (
    useCalculations().aim.object_type !== 'L' &&
    useCalculations().fieldForCorrection === TERMS_OF_SALE &&
    useCalculations().referenceBooksSelected[useCalculations().fieldForCorrection].source === 'Лейфер'
  )
}
