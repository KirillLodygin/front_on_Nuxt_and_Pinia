import useCalculations from '~/store/calculations'

export const useUpdateNewPrices = () => {
  const newPrices: Array<Array<number | string>> = []

  let coefficient = useCalculations().isBuildingForSale ? 3 : 1
  if (useCalculations().aim.ads_type === 'R' && !useCalculations().isExpress) {
    coefficient += 1
  }

  useCalculations().currentAnalogs.forEach((item) => {
    let newPricesItem: Array<number> = []
    for (let i = 0; i < useCalculations().hasCorrectionsFields.length + coefficient; i++) {
      newPricesItem = newPricesItem.concat([
        +item.price_sale_per_m || +item.price_rent_per_m || +item.price_sale / +item.object_area,
      ])
    }
    newPrices.push(newPricesItem)
  })

  return newPrices
}
