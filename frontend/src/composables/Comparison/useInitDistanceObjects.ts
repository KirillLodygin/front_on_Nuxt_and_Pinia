import type { distanceObjectType } from '~/types/comparisonTypes'
import useConstants from '~/store/constants'
import { DISTANCE_ } from '~/app_constants/geoTsofTable'

export const useInitDistanceObjects = () => {
  const distanceObjects: Array<distanceObjectType> = []

  const distanceObjectsFields = Object.keys(useConstants().realtyObjectOptions).filter((key) =>
    key.includes(DISTANCE_),
  )

  distanceObjectsFields.forEach((field) => {
    distanceObjects.push({
      field: field,
      check: false,
      label: useConstants().realtyObjectOptions[field].label,
      distance: 'by_foot',
      weight: 1,
      is_open: false,
    })
  })

  return distanceObjects
}
