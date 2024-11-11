export type treeNodeType = {
  id: number
  name: string
  children: treeNodeType[]
}

export type geoLayerTreeNodeNodeType = {
  caption: string | null
  color: string | null
  descr: string | null
  file_name: string | null
  glyph_name: string | null
  id?: number
  layer_type: string | null
  name: string | null
  order: number
  style: Record<string, string | number | boolean | null> | null
  added_by?: number | null
  tn_parent?: number | null
  target_id?: number | null
}

export type geoLayerTreeNodeType = {
  data: geoLayerTreeNodeNodeType
  id: number
  children?: geoLayerTreeNodeType[]
  objCount?: number
  percentLoaded?: number
  status?: string | undefined
  isExpanded?: boolean
}

export type visualizationDataType = {
  dataForMap: string
  visualType: string
  colorGradation: string
  samplingPeriod: string
  objectType: string
  adsType: string
  funcPurpose: string
}

export type locationPointType = {
  lat: number
  lon: number
}
