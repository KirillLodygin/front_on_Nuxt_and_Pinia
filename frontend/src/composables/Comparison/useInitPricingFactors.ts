import type { pricingFactorType } from '~/types/comparisonTypes'
import useConstants from '~/store/constants'
import { DISTANCE_ } from '~/app_constants/geoTsofTable'

export const useInitPricingFactors = async () => {
  const serverOptions = await useConstants().getRealtyObjectOptions()

  const pricingFactors: string[] = Object.keys(serverOptions).filter((item) => item.includes(DISTANCE_))
  const pricingFactorsArr: Array<pricingFactorType> = []

  pricingFactors.forEach((key) => {
    const pricingFactor: pricingFactorType = {
      is_checked: false,
      pricing_factor: {
        field: key,
        label: serverOptions[key].label,
      },
      all_types: 'by_car',
      weight: 1,
      is_open: false,
    }
    pricingFactorsArr.push(pricingFactor)
  })

  return pricingFactorsArr
}
