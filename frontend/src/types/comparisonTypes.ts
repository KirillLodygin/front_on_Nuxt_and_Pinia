import type { fpInterface } from '~/store/constants'

export type objectTypesTypes = {
  B: string
  Q: string
}

export type compareParametersTableHeaderObjectType = Array<{ title: string; field: string }>

export type distanceObjectType = {
  field: string
  check: boolean
  label: string
  distance: string
  weight: number
  is_open: boolean
}

export type distanceOptionType = {
  value: string
  display_name: string
}

export type parametersComparisonTableType = {
  parameter: string
  title: string
}

export type pricingFactorType = {
  is_checked: boolean
  pricing_factor: {
    field: string
    label: string
  }
  all_types: string
  weight: number
  is_open: boolean
}

export type allTypesObjectType = {
  distance: number | null
  time: number | null
}

export type allTypesKeysType = 'by_car' | 'by_foot' | 'direct'

export type allTypesType = {
  by_car: allTypesObjectType
  by_foot: allTypesObjectType
  direct: allTypesObjectType
}

export type distanceDescrType = {
  address: string | null
  all_types: allTypesType
  distance: number
  name: string
  osm_id: number
  point: [number, number]
  source: string
  time: number
  type: allTypesKeysType
}

export type objectTypeCalcType = 'OO' | 'OA' | 'NE' | null
export type objectTypeType = 'B' | 'Q' | 'L'
export type geoPosType = {
  type: string
  coordinates: [number, number]
}

export type comparisonObjectsValueType =
  | number
  | string
  | null
  | fpInterface
  | distanceDescrType
  | objectTypeCalcType
  | objectTypeType
  | geoPosType

export type comparisonObjectsType = Record<string, any>

export type activeComparisonItemType = Record<string, any>

export type activeGeoTsofItemType = Record<string, any>

export type objectTypeCalcColumnValueType = Record<string, boolean>
