import type { Point } from 'geojson'

export type geoTsofObjectType = {
  pricing_factor: string
  label: string
  type: string
  all_types: {
    direct?: {
      time: null | number
      distance: null | number
    }
    by_car?: {
      time: null | number
      distance: null | number
    }
    by_foot?: {
      time: null | number
      distance: null | number
    }
  }
  address: string
  name?: string
  point?: [number, number]
  start_point?: [number, number]
  shape?: {
    startPoint: Point
    endPoint: Point
    route: string
  }
  source: string
  source_address: string
  pricing_factor_name: string
}
