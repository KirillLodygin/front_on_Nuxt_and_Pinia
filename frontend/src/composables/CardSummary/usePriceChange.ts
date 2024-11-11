export function usePriceChange(filteredActions: Ref<any[]>) {
  const actionsWithPriceChange = computed(() => {
    return filteredActions.value.reduce((acc: any, current: any, index: any, array: any) => {
      const previous = index > 0 ? array[index - 1] : null
      let priceChange = ' '
      let priceChangeIcon = 'fi_minus'
      let rentalPriceIcon = ''
      let sellingPriceIcon = ''

      const currentPrice = parseFloat(current.sellingPrice) || parseFloat(current.rentalPrice) || 0
      const previousPrice = previous ? parseFloat(previous.sellingPrice) || parseFloat(previous.rentalPrice) || 0 : 0

      if (previous) {
        const change = currentPrice - previousPrice
        if (change !== 0) {
          priceChange = `${((change / previousPrice) * 100).toFixed(2)}%`
          priceChangeIcon = ''
          if (change > 0) {
            currentPrice === parseFloat(current.sellingPrice)
              ? (sellingPriceIcon = 'fi_triangle-up')
              : (rentalPriceIcon = 'fi_triangle-up')
          } else {
            currentPrice === parseFloat(current.sellingPrice)
              ? (sellingPriceIcon = 'fi_triangle-down')
              : (rentalPriceIcon = 'fi_triangle-down')
          }
        }
      }

      return [...acc, { ...current, sellingPriceIcon, rentalPriceIcon, priceChange, priceChangeIcon }]
    }, [])
  })

  return { actionsWithPriceChange }
}
