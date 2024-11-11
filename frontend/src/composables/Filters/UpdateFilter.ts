import { cloneDeep } from 'lodash'

export function useFilters() {
  function updateFilter(
    allFilters: any[],
    additionalFilters: any[],
    field: string,
    newValue: any,
    inputNum: string,
    isAllFilters: boolean,
    applyFilters: () => void,
  ) {
    const filters = isAllFilters ? cloneDeep(allFilters) : cloneDeep(additionalFilters)
    const filterIndex = filters.findIndex((filter) => filter.field === field)

    if (filterIndex !== -1) {
      if (!inputNum) {
        filters[filterIndex].value = newValue ? newValue.toString() : ''

        if (isAllFilters) {
          return { allFilters: cloneDeep(filters), additionalFilters }
        } else {
          return { allFilters, additionalFilters: cloneDeep(filters) }
        }
      }

      filters[filterIndex].intervalValues[inputNum].value = newValue ? newValue.toString() : ''

      if (filters[filterIndex].intervalValues.first.value && filters[filterIndex].intervalValues.second.value) {
        if (+filters[filterIndex].intervalValues.second.value < +filters[filterIndex].intervalValues.first.value) {
          filters[filterIndex].intervalValues.second.value = (
            +filters[filterIndex].intervalValues.first.value + 1
          ).toString()
        }
        filters[filterIndex].value =
          `${filters[filterIndex].intervalValues.first.value}-${filters[filterIndex].intervalValues.second.value}`
      }

      if (!filters[filterIndex].intervalValues.first.value || !filters[filterIndex].intervalValues.second.value) {
        filters[filterIndex].value = ''
      }

      if (isAllFilters) {
        return { allFilters: cloneDeep(filters), additionalFilters }
      } else {
        return { allFilters, additionalFilters: cloneDeep(filters) }
      }
    }

    return { allFilters, additionalFilters }
  }

  return {
    updateFilter,
  }
}
