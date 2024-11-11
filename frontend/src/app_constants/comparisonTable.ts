import type { SortableHeaderType } from '~/types/objectEvaluationType'
import type {
  compareParametersTableHeaderObjectType,
  distanceOptionType,
  parametersComparisonTableType,
} from '~/types/comparisonTypes'

export const compareSelectionTableHeaderObject: SortableHeaderType[] = [
  { title: '#', sortDirection: 'none', sorted: false, field: 'index', type: 'string' },
  { title: 'Тип объекта', sortDirection: 'none', sorted: false, field: 'object_type', type: 'string' },
  { title: 'Адрес', sortDirection: 'none', sorted: false, field: 'address_raw', type: 'string' },
  { title: 'Название', sortDirection: 'none', sorted: false, field: 'name', type: 'string' },
  { title: 'Статус', sortDirection: 'none', sorted: false, field: 'object_type_calc', type: 'string' },
  { title: 'Функциональное назначение', sortDirection: 'none', sorted: false, field: 'func_purpose', type: 'string' },
  { title: 'Изменён', sortDirection: 'none', sorted: false, field: 'added_date', type: 'string' },
]

export const savedCompareSelectionTableHeaderObject: SortableHeaderType[] = [
  { title: '#', sortDirection: 'none', sorted: false, field: 'index', type: 'string' },
  { title: 'Название', sortDirection: 'none', sorted: false, field: 'name', type: 'string' },
  { title: 'Описание', sortDirection: 'none', sorted: false, field: 'description', type: 'string' },
  { title: 'Число объектов', sortDirection: 'none', sorted: false, field: 'obj_arr_length', type: 'string' },
  { title: 'Изменён', sortDirection: 'none', sorted: false, field: 'modified_by', type: 'string' },
]

export const compareParametersText =
  'Выберите показатели, по которым необходимо сравнить объекты. При необходимости задайте вес показателя, чтобы выделить наиболее важные'

export const compareParametersTableHeaderObject: compareParametersTableHeaderObjectType = [
  { title: '', field: 'check' },
  { title: 'Показатель', field: 'distance' },
  { title: 'Расчёт расстояния', field: 'type' },
  { title: 'Вес', field: 'weight' },
]

export const distanceOptions: Array<distanceOptionType> = [
  {
    value: 'by_foot',
    display_name: 'пешком',
  },
  {
    value: 'by_car',
    display_name: 'на автомобиле',
  },
  {
    value: 'direct',
    display_name: 'по прямой',
  },
]

export const parametersComparisonTableHeaderObject: parametersComparisonTableType[] = [
  { parameter: 'is_checked', title: '' },
  { parameter: 'pricing_factor', title: 'Показатель' },
  { parameter: 'all_types', title: 'Расчёт расстояния' },
  { parameter: 'weight', title: 'Вес' },
]
