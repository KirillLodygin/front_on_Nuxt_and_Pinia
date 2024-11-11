import type { geoLayerTreeNodeNodeType } from '~/types/treeTypes'

export const headersLabels: Record<number, string> = {
  1: 'Слои',
  2: 'Визуализация данных',
  3: 'Маршрут',
  4: 'Изохрона',
  5: 'Измерение',
}

export const geoLayerSettingsTabs = [
  { value: 'main', name: 'Основные', icon: 'fi_edit-3' },
  { value: 'style', name: 'Стиль', icon: 'ksi_brush' },
]

export type settingsTypeOptions = {
  iconClass?: string
  displayName?: string
  value: string | number | boolean
}

export type settingsType = {
  field: string
  name: string
  type: string
  required: boolean
  take: string
  options?: settingsTypeOptions[]
}

export const geoLayerMainSettings: settingsType[] = [
  { field: 'name', name: 'Название', type: 'input', required: true, take: 'full' },
  {
    field: 'layer_type',
    name: 'Тип слоя',
    type: 'hButtons',
    required: false,
    take: 'full',
    options: [
      { displayName: 'Объявления', value: 'A' },
      { displayName: 'Вспомогательный', value: 'G' },
    ],
  },
  {
    field: 'glyph_name',
    name: 'Иконка слоя',
    type: 'select',
    required: false,
    take: 'half',
    options: [
      { iconClass: 'color-circle', displayName: 'Круг', value: 'circle' },
      { iconClass: 'color-square', displayName: 'Квадрат', value: 'square' },
      { iconClass: 'color-triangle', displayName: 'Треугольник', value: 'triangle' },
    ],
  },
  { field: 'color', name: 'Цвет слоя', type: 'colorSelect', required: false, take: 'half' },
  { field: 'descr', name: 'Описание', type: 'text', required: false, take: 'full' },
]

export const geoLayerStyleSettings: settingsType[] = [
  {
    field: 'is_fill_color',
    name: 'Способ заполнения',
    type: 'select',
    required: false,
    take: 'half',
    options: [
      { iconClass: 'fi_x-square', displayName: 'Нет заполнения', value: false },
      { iconClass: 'fi_square', displayName: 'Сплошной цвет', value: true },
    ],
  },
  { field: 'fill_color', name: 'Цвет заполнения', type: 'colorSelect', required: false, take: 'half' },
  {
    field: 'is_line_color',
    name: 'Способ обводки',
    type: 'select',
    required: false,
    take: 'half',
    options: [
      { iconClass: 'fi_x-square', displayName: 'Нет обводки', value: false },
      { iconClass: 'fi_square', displayName: 'Сплошной цвет', value: true },
    ],
  },
  { field: 'line_color', name: 'Цвет обводки', type: 'colorSelect', required: false, take: 'half' },
  {
    field: 'line_width',
    name: 'Толщина обводки',
    type: 'select',
    required: false,
    take: 'half',
    options: [
      { iconClass: 'fi_minus', displayName: 'Тонкая', value: 1 },
      { iconClass: 'fi_minus icon-medium', displayName: 'Средняя', value: 2 },
      { iconClass: 'fi_minus icon-bold', displayName: 'Толстая', value: 3 },
    ],
  },
  {
    field: 'line_dasharray',
    name: 'Шаблон обводки',
    type: 'select',
    required: false,
    take: 'half',
    options: [
      { iconClass: 'dashed-border-s', value: 1 },
      { iconClass: 'dashed-border-m', value: 2 },
      { iconClass: 'dashed-border-l', value: 3 },
    ],
  },
]

export const geoLayerDefaultSettings: geoLayerTreeNodeNodeType = {
  name: null,
  descr: null,
  color: '#0000FF',
  style: {
    fill_color: '#0000FF',
    line_color: '#0000FF',
    line_width: 1,
    line_dasharray: 1,
    is_fill_color: true,
    is_line_color: true,
  },
  caption: null,
  file_name: null,
  layer_type: 'A',
  glyph_name: 'circle',
  tn_parent: null,
  target_id: null,
  order: 0,
}

export const dataVisualizationData: settingsType[] = [
  {
    field: 'dataForMap',
    name: 'Данные на карте',
    type: 'select',
    required: false,
    take: 'full',
    options: [
      { displayName: 'Число предложений', value: 'analogs_count' },
      { displayName: 'Удельная цена, руб. за кв. м', value: 'price_sale_per_m' },
    ],
  },
  {
    field: 'visualType',
    name: 'Вид отображения',
    type: 'select',
    required: false,
    take: 'full',
    options: [
      { displayName: 'Кластеры', value: 'clusters' },
      { displayName: 'Гексагоны', value: 'hexagons' },
      { displayName: 'Тепловая карта', value: 'heatMap' },
    ],
  },
  {
    field: 'colorGradation',
    name: 'Градация цвета (мин -> макс)',
    type: 'gradation',
    required: false,
    take: 'full',
  },
  {
    field: 'samplingPeriod',
    name: 'Период выборки',
    type: 'quarterly',
    required: false,
    take: 'full',
  },
  {
    field: 'objectType',
    name: 'Тип объекта',
    type: 'select',
    required: false,
    take: 'full',
    options: [
      { displayName: 'Помещение', value: 'Q' },
      { displayName: 'Здание', value: 'B' },
      { displayName: 'Земельный участок', value: 'L' },
    ],
  },
  {
    field: 'adsType',
    name: 'Тип объявления',
    type: 'select',
    required: false,
    take: 'full',
    options: [
      { displayName: 'Аренда', value: 'R' },
      { displayName: 'Продажа', value: 'S' },
    ],
  },
  {
    field: 'funcPurpose',
    name: 'Функциональное назначение',
    type: 'select',
    required: false,
    take: 'full',
    options: [
      { displayName: 'Офисное', value: 'Офисное' },
      { displayName: 'Торговое', value: 'Торговое' },
      { displayName: 'Производственно-складское', value: 'Производственно-складское' },
      { displayName: 'ПСН', value: 'ПСН' },
    ],
  },
]

export const routingModeCompliance: Record<number, string> = { 1: 'auto', 2: 'pedestrian', 3: 'bicycle' }
