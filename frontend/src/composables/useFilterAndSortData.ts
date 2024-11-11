import { ref } from 'vue'
import type {
  sortedFieldType,
  sortDirectionType,
  nextDirectionType,
  functionalPurposeObjectType,
  allFiltersType,
  allFilteredFieldsType,
  filterType,
} from '~/types/objectsFiltersStoreTypes'

export function useFilterAndSortData() {
  const sortedField = ref<sortedFieldType>('')
  const sortDirection = ref<sortDirectionType>('none')
  const nextDirection = ref<nextDirectionType>({
    none: 'asc',
    asc: 'desc',
    desc: 'none',
  })

  const functionalPurposeObject = ref<functionalPurposeObjectType>({
    B: { R: { labels: [], ids: [] }, S: { labels: [], ids: [] } },
    Q: { R: { labels: [], ids: [] }, S: { labels: [], ids: [] } },
    L: { R: { labels: [], ids: [] }, S: { labels: [], ids: [] } },
  })

  const filters = ref<allFiltersType>([])
  const additionalFilters = ref<allFiltersType>([])
  const allFilteredFields = ref<allFilteredFieldsType>({
    base_search_fields: [],
    search_fields_by_type: { quater: [], building: [], landplot: [] },
    ignore_search_fields: [],
    OO: [],
    OA: [],
    NE: [],
  })

  const allOptions = ref<Record<string, any>>({})

  return {
    sortedField,
    sortDirection,
    nextDirection,
    functionalPurposeObject,
    filters,
    additionalFilters,
    allFilteredFields,
    allOptions,
  }
}
