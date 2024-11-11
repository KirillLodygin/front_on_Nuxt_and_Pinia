import type { SortableHeaderType } from '~/types/objectEvaluationType'

export const geoTsofTableHeaderObject: SortableHeaderType[] = [
  { title: 'Ценообразующий фактор', sortDirection: 'none', sorted: false, field: 'pricing_factor', type: 'string' },
  { title: 'Значение', sortDirection: 'none', sorted: false, field: 'all_types', type: 'string' },
  { title: 'Объект, адрес', sortDirection: 'none', sorted: false, field: 'address', type: 'string' },
  { title: 'Источник', sortDirection: 'none', sorted: false, field: 'source', type: 'string' },
]

export const geoTsofFullScreenObject = [
  { title: 'Объект', field: 'pricing_factor_name', type: 'string' },
  { title: 'Адрес', field: 'address' },
  { title: 'Источник', field: 'source' },
]

export const DISTANCE_ = 'distance_'
export const _DESCR = '_descr'
