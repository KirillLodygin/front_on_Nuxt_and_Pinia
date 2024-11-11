import { type Geometry, type Point } from 'geojson'
import type { objectTypeType } from './mapObjectPropertiesTypes'

export interface mutableData {
  name: string
  address_raw: string
  osm_id: number
  geo_pos: Point
  geo_obj: Geometry
  object_type: objectTypeType
  realty_cards: Record<string, any>[]
  children: objectDataType[]
}

export interface objectDataType extends mutableData {
  [key: string]: any
}
