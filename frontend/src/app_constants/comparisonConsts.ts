export const objectTypes: Record<string, any> = {
  B: 'Здание',
  Q: 'Помещение',
  L: 'Земельный участок'
}

export const noDataAvailable = ' —'

export const dictanceDescrStub = {
  address: null,
  all_types: {
    by_car: { distance: 0, time: 0 },
    by_foot: { distance: 0, time: 0 },
    direct: { distance: 0, time: 0 },
  },
  distance: 0,
  name: '',
  osm_id: null,
  point: [],
  source: 'osm',
  time: 0,
  type: 'by_foot',
}

export const currentComparisonList = 'Текущий список сравнения'

export const COMPARE = 'compare'
