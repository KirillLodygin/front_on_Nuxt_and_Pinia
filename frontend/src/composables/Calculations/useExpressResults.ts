import { median } from 'mathjs'
import {
  deviationCoefficient,
  OBJECT_AREA,
  rentLabelForExpressComponents,
  VATConst,
} from '~/app_constants/calculationsConsts'
import type { expressResultType, expressResultKeyType, expressResultBlockType } from '~/types/calculationsTypes'
import { numberWithSpaces } from '~/utils/calculationsUtils'
import useCalculations from '~/store/calculations'
import { useAimValue } from '~/composables/Calculations/useAimValue'

const finalResults = () => {
  if (
    useCalculations().finalTableArr.length &&
    useCalculations().finalTableArr[useCalculations().finalTableArr.length - 1].length > 3
  ) {
    const finalTableArrResultArr = useCalculations().finalTableArr[useCalculations().finalTableArr.length - 1]
    return finalTableArrResultArr
      .slice(2, finalTableArrResultArr.length)
      .map((sum) => Number((sum as string).replace(' ₽', '')))
  }
  return [0]
}

const sortedFinalResults = () => finalResults().sort((a, b) => a - b)

const medianValue = () => {
  const checkedAnalogsIndexes = useCalculations()
    .analogs.map((analog, index) => (analog.is_checked ? index : -1))
    .filter((index) => index !== -1)
  const countOfCheckedAnalogs = checkedAnalogsIndexes.length

  const medianResult = median(sortedFinalResults())
  const minChecked = countOfCheckedAnalogs > 3 ? finalResults()[checkedAnalogsIndexes[0]] : finalResults()[0]
  const maxChecked =
    countOfCheckedAnalogs > 3
      ? finalResults()[checkedAnalogsIndexes[checkedAnalogsIndexes.length - 1]]
      : finalResults()[finalResults().length - 1]

  if (countOfCheckedAnalogs > 3 && (medianResult < minChecked || medianResult > maxChecked)) {
    return (minChecked + maxChecked) / 2
  }
  return medianResult
}

const minValue = () => {
  const roundPower = Math.pow(10, 3 - (medianValue() * (1 - deviationCoefficient)).toFixed(0).length)
  return Math.round(((medianValue() * (1 - deviationCoefficient)) / roundPower) * roundPower)
}

const maxValue = () => {
  const roundPower = Math.pow(10, 3 - (medianValue() * (1 + deviationCoefficient)).toFixed(0).length)
  return Math.round(((medianValue() * (1 + deviationCoefficient)) / roundPower) * roundPower)
}

const getTotalRentLabelString = (key: string, obj: Record<string, string>) => {
  let resultString = rentLabelForExpressComponents.label[key]

  Object.keys(obj).forEach((item) => {
    resultString += ', ' + `${rentLabelForExpressComponents[item][obj[item]]}`
  })

  return resultString
}

const getVPW = (weightedAverageCost: number) => {
  return weightedAverageCost / (1 - useCalculations().corrections.utilities[0])
}

const getVWC = (weightedAverageCost: number) => {
  return weightedAverageCost / (1 - useCalculations().corrections.operating_costs[0])
}

const getWPW = (weightedAverageCost: number) => {
  return weightedAverageCost / (1 - useCalculations().corrections.utilities[0]) / (1 + VATConst)
}

const getVPC = (weightedAverageCost: number) => {
  return (
    weightedAverageCost /
    (1 - (useCalculations().corrections.utilities[0] + useCalculations().corrections.operating_costs[0]))
  )
}

const getWWC = (weightedAverageCost: number) => {
  return weightedAverageCost / (1 - useCalculations().corrections.operating_costs[0]) / (1 + VATConst)
}

const getWPC = (weightedAverageCost: number) => {
  return (
    weightedAverageCost /
    (1 - (useCalculations().corrections.utilities[0] + useCalculations().corrections.operating_costs[0])) /
    (1 + VATConst)
  )
}

const getWWW = (weightedAverageCost: number) => {
  return weightedAverageCost / (1 + VATConst)
}

const getVWW = (weightedAverageCost: number) => {
  return weightedAverageCost
}

const getFinalRentOptions = (obj: Record<string, string>, weightedAverageCost: number) => {
  const string = `${obj.rent_vat}${obj.rent_pu}${obj.rent_co}${obj.rent_dimension}`

  switch (string) {
    case 'VWWSM':
      return numberWithSpaces(getVWW(weightedAverageCost).toFixed(0))

    case 'VPWSM':
      return numberWithSpaces(getVPW(weightedAverageCost).toFixed(0))

    case 'VWCSM':
      return numberWithSpaces(getVWC(weightedAverageCost).toFixed(0))

    case 'VPCSM':
      return numberWithSpaces(getVPC(weightedAverageCost).toFixed(0))

    case 'WPWSM':
      return numberWithSpaces(getWPW(weightedAverageCost).toFixed(0))

    case 'WWCSM':
      return numberWithSpaces(getWWC(weightedAverageCost).toFixed(0))

    case 'WPCSM':
      return numberWithSpaces(getWPC(weightedAverageCost).toFixed(0))

    case 'WWWSM':
      return numberWithSpaces(getWWW(weightedAverageCost).toFixed(0))

    case 'VPWSY':
      return numberWithSpaces((getVPW(weightedAverageCost) * 12).toFixed(0))

    case 'VWCSY':
      return numberWithSpaces((getVWC(weightedAverageCost) * 12).toFixed(0))

    case 'VPCSY':
      return numberWithSpaces((getVPC(weightedAverageCost) * 12).toFixed(0))

    case 'VWWSY':
      return numberWithSpaces((getVWW(weightedAverageCost) * 12).toFixed(0))

    case 'WPWSY':
      return numberWithSpaces((getWPW(weightedAverageCost) * 12).toFixed(0))

    case 'WWCSY':
      return numberWithSpaces((getWWC(weightedAverageCost) * 12).toFixed(0))

    case 'WPCSY':
      return numberWithSpaces((getWPC(weightedAverageCost) * 12).toFixed(0))

    case 'WWWSY':
      return numberWithSpaces((getWWW(weightedAverageCost) * 12).toFixed(0))

    case 'VPWM':
      return numberWithSpaces((getVPW(weightedAverageCost) * Number(useCalculations().aim[OBJECT_AREA])).toFixed(0))

    case 'VWCM':
      return numberWithSpaces((getVWC(weightedAverageCost) * Number(useCalculations().aim[OBJECT_AREA])).toFixed(0))

    case 'VPCM':
      return numberWithSpaces((getVPC(weightedAverageCost) * Number(useCalculations().aim[OBJECT_AREA])).toFixed(0))

    case 'VWWM':
      return numberWithSpaces((getVWW(weightedAverageCost) * Number(useCalculations().aim[OBJECT_AREA])).toFixed(0))

    case 'WPWM':
      return numberWithSpaces((getWPW(weightedAverageCost) * Number(useCalculations().aim[OBJECT_AREA])).toFixed(0))

    case 'WWCM':
      return numberWithSpaces((getWWC(weightedAverageCost) * Number(useCalculations().aim[OBJECT_AREA])).toFixed(0))

    case 'WPCM':
      return numberWithSpaces((getWPC(weightedAverageCost) * Number(useCalculations().aim[OBJECT_AREA])).toFixed(0))

    case 'WWWM':
      return numberWithSpaces((getWWW(weightedAverageCost) * Number(useCalculations().aim[OBJECT_AREA])).toFixed(0))

    case 'VPWY':
      return numberWithSpaces((getVPW(weightedAverageCost) * Number(useCalculations().aim[OBJECT_AREA]) * 12).toFixed(0))

    case 'VWCY':
      return numberWithSpaces((getVWC(weightedAverageCost) * Number(useCalculations().aim[OBJECT_AREA]) * 12).toFixed(0))

    case 'VPCY':
      return numberWithSpaces((getVPC(weightedAverageCost) * Number(useCalculations().aim[OBJECT_AREA]) * 12).toFixed(0))

    case 'VWWY':
      return numberWithSpaces((getVWW(weightedAverageCost) * Number(useCalculations().aim[OBJECT_AREA]) * 12).toFixed(0))

    case 'WPWY':
      return numberWithSpaces((getWPW(weightedAverageCost) * Number(useCalculations().aim[OBJECT_AREA]) * 12).toFixed(0))

    case 'WWCY':
      return numberWithSpaces((getWWC(weightedAverageCost) * Number(useCalculations().aim[OBJECT_AREA]) * 12).toFixed(0))

    case 'WPCY':
      return numberWithSpaces((getWPC(weightedAverageCost) * Number(useCalculations().aim[OBJECT_AREA]) * 12).toFixed(0))

    case 'WWWY':
      return numberWithSpaces((getWWW(weightedAverageCost) * Number(useCalculations().aim[OBJECT_AREA]) * 12).toFixed(0))

    default:
      return string
  }
}

const getSum = (key: string) => {
  switch (key) {
    case 'min':
      return minValue()

    case 'median':
      return medianValue()

    default:
      return maxValue()
  }
}

export const useExpressResults = (): expressResultType => {
  if (useCalculations().aim.ads_type === 'S') {
    return {
      rub_sq_m: [
        [
          {
            'Минимальная рыночная стоимость, руб./кв.м':
              typeof minValue() === 'string' ? minValue() : numberWithSpaces(Number(minValue()).toFixed(0)),
          },
          {
            'Средняя рыночная стоимость, руб./кв.м':
              typeof medianValue() === 'string' ? medianValue() : numberWithSpaces(Number(medianValue()).toFixed(0)),
          },
          {
            'Максимальная рыночная стоимость, руб./кв.м':
              typeof maxValue() === 'string' ? maxValue() : numberWithSpaces(Number(maxValue()).toFixed(0)),
          },
        ],
      ],
      rub: [
        [
          {
            'Минимальная рыночная стоимость, руб.':
              typeof minValue() === 'string'
                ? minValue()
                : numberWithSpaces((Number(minValue()) * Number(useCalculations().aim[OBJECT_AREA])).toFixed(0)),
          },
          {
            'Средняя рыночная стоимость, руб.':
              typeof medianValue() === 'string'
                ? medianValue()
                : numberWithSpaces((Number(medianValue()) * Number(useCalculations().aim[OBJECT_AREA])).toFixed(0)),
          },
          {
            'Максимальная рыночная стоимость, руб.':
              typeof maxValue() === 'string'
                ? maxValue()
                : numberWithSpaces((Number(maxValue()) * Number(useCalculations().aim[OBJECT_AREA])).toFixed(0)),
          },
        ],
      ],
    }
  }

  const rentOptionsKeys = ['min', 'median', 'max']
  const expressResults: expressResultKeyType = []

  useCalculations().aim.rent_result_json.forEach((obj: Record<string, string>) => {
    const expressResultBlock: expressResultBlockType = []
    rentOptionsKeys.forEach((key) => {
      const label = getTotalRentLabelString(key, obj)
      const sumValue = getSum(key)

      const sumObj: Record<string, number | string> = {}
      sumObj[label] = getFinalRentOptions(obj, sumValue)
      expressResultBlock.push(sumObj)
    })
    expressResults.push(expressResultBlock)
  })

  return {
    results: expressResults,
  }
}
