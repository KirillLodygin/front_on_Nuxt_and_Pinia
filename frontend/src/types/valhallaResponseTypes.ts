export type ValhallaErrorResponseType = {
  error_code: number
  error: string
  status_code: number
  status: string
}

export type RouteDataType = {
  trip: TripType
}

type TripType = {
  locations: Location[]
  legs: Leg[]
  summary: Summary
  status_message: string
  status: number
  units: string
  language: string
}

type Location = {
  type: string
  lat: number
  lon: number
  original_index: number
  side_of_street?: string
}

type Leg = {
  maneuvers: Maneuver[]
  summary: Summary
  shape: string
}

type Maneuver = {
  type: number
  instruction: string
  verbal_succinct_transition_instruction?: string
  verbal_pre_transition_instruction?: string
  verbal_post_transition_instruction?: string
  street_names?: string[]
  time: number
  length: number
  cost: number
  begin_shape_index: number
  end_shape_index: number
  verbal_multi_cue?: boolean
  travel_mode: string
  travel_type: string
  sign?: Sign
  rough?: boolean
}

type Sign = {
  exit_branch_elements?: BranchElement[]
  exit_toward_elements?: TowardElement[]
}

type BranchElement = {
  text: string
  consecutive_count: number
}

type TowardElement = {
  text: string
}

type Summary = {
  has_time_restrictions: boolean
  has_toll: boolean
  has_highway: boolean
  has_ferry: boolean
  min_lat: number
  min_lon: number
  max_lat: number
  max_lon: number
  time: number
  length: number
  cost: number
}

type Coordinates = [number, number]

type Geometry = {
  type: 'Polygon'
  coordinates: Coordinates[][]
}

type Properties = {
  'fill-opacity': number
  fillColor: string
  opacity: number
  fill: string
  fillOpacity: number
  color: string
  contour: number
  metric: string
}

type Feature = {
  type: 'Feature'
  properties: Properties
  geometry: Geometry
}

export type IsochroneDataType = {
  type: 'FeatureCollection'
  features: Feature[]
}
