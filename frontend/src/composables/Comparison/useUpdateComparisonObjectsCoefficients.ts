import { max, sumBy, cloneDeep } from 'lodash'
import type { comparisonObjectsType } from '~/types/comparisonTypes'
import { noDataAvailable } from '~/app_constants/comparisonConsts'
import { _DESCR } from '~/app_constants/geoTsofTable'
import useComparison from '~/store/comparison'

export const useUpdateComparisonObjectsCoefficients = () => {
  const coefficients: Record<string, Array<any>> = {}
  const currentComparisonObjects = cloneDeep(useComparison().currentComparisonObjects)

  useComparison().currentPricingFactorsArr
    .filter((item) => item.is_checked)
    .forEach((item) => {
      if (item.pricing_factor.field && typeof item.pricing_factor.field === 'string') {
        coefficients[item.pricing_factor.field] = []

        currentComparisonObjects.forEach((obj: comparisonObjectsType) => {
          let mark: number | string = noDataAvailable
          if (obj[`${item.pricing_factor.field}${_DESCR}`]) {
            mark = ['by_foot', 'by_car'].includes(item.pricing_factor.field)
              ? obj[`${item.pricing_factor.field}${_DESCR}`].time
              : obj[`${item.pricing_factor.field}${_DESCR}`].distance
          }
          coefficients[item.pricing_factor.field].push(mark)
        })

        const maxValues = max(coefficients[item.pricing_factor.field].filter((item) => item !== noDataAvailable))
        coefficients[item.pricing_factor.field] = coefficients[item.pricing_factor.field].map((val) => {
          if (maxValues === undefined || val === noDataAvailable) return noDataAvailable
          if (maxValues === 0) return 0
          return 1 - val / maxValues / item.weight
        })
      }
    })

  const final_coefficient: Array<number> = []
  for (let i = 0; i < currentComparisonObjects.length; i++) {
    final_coefficient.push(0)
    currentComparisonObjects[i].coefficients = {}
  }

  for (let i = 0; i < currentComparisonObjects.length; i++) {
    Object.keys(coefficients).forEach((key) => {
      if (coefficients[key][i] !== noDataAvailable) {
        final_coefficient[i] += Number(coefficients[key][i])
      }
    })
  }

  const maxFinalCoefficient = max(final_coefficient)
  Object.keys(coefficients).forEach((key) => {
    for (let i = 0; i < currentComparisonObjects.length; i++) {
      if (coefficients[key][i] !== noDataAvailable) {
        coefficients[key][i] = maxFinalCoefficient ? (coefficients[key][i] / maxFinalCoefficient) * 100 : 0
      }
      currentComparisonObjects[i].coefficients[key] = coefficients[key][i]
    }
  })

  currentComparisonObjects.forEach((obj) => {
    const coefficientsForFinal = Object.values(obj.coefficients).filter((item) => item !== noDataAvailable)
    obj.final_coefficient = coefficientsForFinal.length ? sumBy(coefficientsForFinal) : noDataAvailable
  })

  return currentComparisonObjects
}
