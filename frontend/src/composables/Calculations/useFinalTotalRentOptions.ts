import { VATConst } from '~/app_constants/calculationsConsts'
import useCalculations from '~/store/calculations'
import { numberWithSpaces } from '~/utils/calculationsUtils'

const getVPW = () => {
  return +useCalculations().weightedAverageCost / (1 - useCalculations().corrections.utilities[0])
}

const getVWC = () => {
  return +useCalculations().weightedAverageCost / (1 - useCalculations().corrections.operating_costs[0])
}

const getWPW = () => {
  return +useCalculations().weightedAverageCost / (1 - useCalculations().corrections.utilities[0]) / (1 + VATConst)
}

const getVPC = () => {
  return (
    +useCalculations().weightedAverageCost /
    (1 - (useCalculations().corrections.utilities[0] + useCalculations().corrections.operating_costs[0]))
  )
}

const getWWC = () => {
  return (
    +useCalculations().weightedAverageCost / (1 - useCalculations().corrections.operating_costs[0]) / (1 + VATConst)
  )
}

const getWPC = () => {
  return (
    +useCalculations().weightedAverageCost /
    (1 - (useCalculations().corrections.utilities[0] + useCalculations().corrections.operating_costs[0])) /
    (1 + VATConst)
  )
}

const getWWW = () => {
  return +useCalculations().weightedAverageCost / (1 + VATConst)
}

const getVWW = () => {
  return +useCalculations().weightedAverageCost
}

export const useFinalTotalRentOptions = (obj: Record<string, string>) => {
  const string = `${obj.rent_vat}${obj.rent_pu}${obj.rent_co}${obj.rent_dimension}`

  switch (string) {
    case 'VWWSM':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces(getVWW().toFixed(0))
        : useCalculations().weightedAverageCost

    case 'VPWSM':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces(getVPW().toFixed(0))
        : useCalculations().weightedAverageCost

    case 'VWCSM':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces(getVWC().toFixed(0))
        : useCalculations().weightedAverageCost

    case 'VPCSM':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces(getVPC().toFixed(0))
        : useCalculations().weightedAverageCost

    case 'WPWSM':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces(getWPW().toFixed(0))
        : useCalculations().weightedAverageCost

    case 'WWCSM':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces(getWWC().toFixed(0))
        : useCalculations().weightedAverageCost

    case 'WPCSM':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces(getWPC().toFixed(0))
        : useCalculations().weightedAverageCost

    case 'WWWSM':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces(getWWW().toFixed(0))
        : useCalculations().weightedAverageCost

    case 'VPWSY':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces((getVPW() * 12).toFixed(0))
        : useCalculations().weightedAverageCost

    case 'VWCSY':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces((getVWC() * 12).toFixed(0))
        : useCalculations().weightedAverageCost

    case 'VPCSY':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces((getVPC() * 12).toFixed(0))
        : useCalculations().weightedAverageCost

    case 'VWWSY':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces((getVWW() * 12).toFixed(0))
        : useCalculations().weightedAverageCost

    case 'WPWSY':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces((getWPW() * 12).toFixed(0))
        : useCalculations().weightedAverageCost

    case 'WWCSY':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces((getWWC() * 12).toFixed(0))
        : useCalculations().weightedAverageCost

    case 'WPCSY':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces((getWPC() * 12).toFixed(0))
        : useCalculations().weightedAverageCost

    case 'WWWSY':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces((getWWW() * 12).toFixed(0))
        : useCalculations().weightedAverageCost

    case 'VPWM':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces((getVPW() * useCalculations().aim.object_area).toFixed(0))
        : useCalculations().weightedAverageCost

    case 'VWCM':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces((getVWC() * useCalculations().aim.object_area).toFixed(0))
        : useCalculations().weightedAverageCost

    case 'VPCM':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces((getVPC() * useCalculations().aim.object_area).toFixed(0))
        : useCalculations().weightedAverageCost

    case 'VWWM':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces((getVWW() * useCalculations().aim.object_area).toFixed(0))
        : useCalculations().weightedAverageCost

    case 'WPWM':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces((getWPW() * useCalculations().aim.object_area).toFixed(0))
        : useCalculations().weightedAverageCost

    case 'WWCM':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces((getWWC() * useCalculations().aim.object_area).toFixed(0))
        : useCalculations().weightedAverageCost

    case 'WPCM':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces((getWPC() * useCalculations().aim.object_area).toFixed(0))
        : useCalculations().weightedAverageCost

    case 'WWWM':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces((getWWW() * useCalculations().aim.object_area).toFixed(0))
        : useCalculations().weightedAverageCost

    case 'VPWY':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces((getVPW() * useCalculations().aim.object_area * 12).toFixed(0))
        : useCalculations().weightedAverageCost

    case 'VWCY':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces((getVWC() * useCalculations().aim.object_area * 12).toFixed(0))
        : useCalculations().weightedAverageCost

    case 'VPCY':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces((getVPC() * useCalculations().aim.object_area * 12).toFixed(0))
        : useCalculations().weightedAverageCost

    case 'VWWY':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces((getVWW() * useCalculations().aim.object_area * 12).toFixed(0))
        : useCalculations().weightedAverageCost

    case 'WPWY':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces((getWPW() * useCalculations().aim.object_area * 12).toFixed(0))
        : useCalculations().weightedAverageCost

    case 'WWCY':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces((getWWC() * useCalculations().aim.object_area * 12).toFixed(0))
        : useCalculations().weightedAverageCost

    case 'WPCY':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces((getWPC() * useCalculations().aim.object_area * 12).toFixed(0))
        : useCalculations().weightedAverageCost

    case 'WWWY':
      return useCalculations().weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces((getWWW() * useCalculations().aim.object_area * 12).toFixed(0))
        : useCalculations().weightedAverageCost

    default:
      return string
  }
}
