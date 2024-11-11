import { cloneDeep } from 'lodash'
import { isEmpty } from 'lodash'

export function openFilter() {
  return function (allFilters: any[], additionalFilters: any[], field: string, isAllFilters: boolean) {
    const filters = isAllFilters ? cloneDeep(allFilters) : cloneDeep(additionalFilters)
    const usedFilterIndex = filters.findIndex((filter) => filter.field === field)

    if (usedFilterIndex !== -1) {
      if (
        (filters[usedFilterIndex].type === 'choice' || filters[usedFilterIndex].type === 'nested object') &&
        isEmpty(filters[usedFilterIndex].choices)
      ) {
        return { allFilters, additionalFilters }
      }

      filters[usedFilterIndex].isOpen = !filters[usedFilterIndex].isOpen

      if (isAllFilters) {
        return { allFilters: cloneDeep(filters), additionalFilters }
      } else {
        return { allFilters, additionalFilters: cloneDeep(filters) }
      }
    }

    return { allFilters, additionalFilters }
  }
}
