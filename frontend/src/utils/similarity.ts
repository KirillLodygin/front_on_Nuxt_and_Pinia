import type { aimType } from '~/types/calculationsTypes'

const toRadians = (degrees: number) => {
  return degrees * (Math.PI / 180)
}

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const lat1Rad = toRadians(lat1)
  const lat2Rad = toRadians(lat2)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export const calculateSimilarity = (aim: aimType, result: aimType, radius: number): number => {
  const aim_lat = aim.geo_pos.coordinates[1]
  const aim_lon = aim.geo_pos.coordinates[0]
  const target_lat = result.geo_pos.coordinates[1]
  const target_lon = result.geo_pos.coordinates[0]
  const distance = getDistance(aim_lat, aim_lon, target_lat, target_lon)
  // console.log(radius, distance)
  const AREA_WEIGHT_LEVEL_1 = 1
  const AREA_WEIGHT_LEVEL_2 = 2
  const AREA_WEIGHT_LEVEL_3 = 3
  const AREA_WEIGHT_LEVEL_4 = 4

  const DIST_WEIGHT_LEVEL_1 = 5
  const DIST_WEIGHT_LEVEL_2 = 6
  const DIST_WEIGHT_LEVEL_3 = 7
  const DIST_WEIGHT_LEVEL_4 = 8

  const DAYS_WEIGHT_LEVEL_1 = 9
  const DAYS_WEIGHT_LEVEL_2 = 10
  const DAYS_WEIGHT_LEVEL_3 = 11
  const DAYS_WEIGHT_LEVEL_4 = 12

  const CHECKED_WEIGHT_LEVEL_1 = 0
  const CHECKED_WEIGHT_LEVEL_2 = 25

  const UNLIMITED_WEIGHT_LEVEL = 100

  const AREA_VER_FACTOR_1 = 0.25
  const AREA_VER_FACTOR_2 = 0.5
  const AREA_VER_FACTOR_3 = 0.75
  const AREA_VER_FACTOR_4 = 1

  const DIST_VER_FACTOR_1 = 0.25
  const DIST_VER_FACTOR_2 = 0.5
  const DIST_VER_FACTOR_3 = 0.75
  const DIST_VER_FACTOR_4 = 1

  const DAYS_VER_FACTOR_1 = 92
  const DAYS_VER_FACTOR_2 = 185
  const DAYS_VER_FACTOR_3 = 278
  const DAYS_VER_FACTOR_4 = 366

  // Calculate area difference weight
  const areaDifs = Math.abs((result.object_area - aim.object_area) / aim.object_area)
  let areaDifsWeight = UNLIMITED_WEIGHT_LEVEL
  if (areaDifs <= AREA_VER_FACTOR_1) {
    areaDifsWeight = AREA_WEIGHT_LEVEL_1
  } else if (areaDifs <= AREA_VER_FACTOR_2) {
    areaDifsWeight = AREA_WEIGHT_LEVEL_2
  } else if (areaDifs <= AREA_VER_FACTOR_3) {
    areaDifsWeight = AREA_WEIGHT_LEVEL_3
  } else if (areaDifs <= AREA_VER_FACTOR_4) {
    areaDifsWeight = AREA_WEIGHT_LEVEL_4
  }
  // console.log('areaDifsWeight ', areaDifsWeight)

  // Calculate distance weight
  let distanceWeight = UNLIMITED_WEIGHT_LEVEL
  if (distance <= radius * DIST_VER_FACTOR_1) {
    distanceWeight = DIST_WEIGHT_LEVEL_1
  } else if (distance <= radius * DIST_VER_FACTOR_2) {
    distanceWeight = DIST_WEIGHT_LEVEL_2
  } else if (distance <= radius * DIST_VER_FACTOR_3) {
    distanceWeight = DIST_WEIGHT_LEVEL_3
  } else if (distance <= radius * DIST_VER_FACTOR_4) {
    distanceWeight = DIST_WEIGHT_LEVEL_4
  }
  // console.log('distanceWeight ', distanceWeight)

  // Calculate days difference weight
  const adsUpdatedAim = aim.date_calc ? new Date(aim.date_calc) : new Date('2020-01-01')
  const adsUpdatedResult = result.ads_updated ? new Date(result.ads_updated) : new Date('2020-01-01')

  const daysDifs = Math.abs(Math.ceil((adsUpdatedResult.getTime() - adsUpdatedAim.getTime()) / (1000 * 60 * 60 * 24)))
  let daysWeight = UNLIMITED_WEIGHT_LEVEL
  if (daysDifs <= DAYS_VER_FACTOR_1) {
    daysWeight = DAYS_WEIGHT_LEVEL_1
  } else if (daysDifs <= DAYS_VER_FACTOR_2) {
    daysWeight = DAYS_WEIGHT_LEVEL_2
  } else if (daysDifs <= DAYS_VER_FACTOR_3) {
    daysWeight = DAYS_WEIGHT_LEVEL_3
  } else if (daysDifs <= DAYS_VER_FACTOR_4) {
    daysWeight = DAYS_WEIGHT_LEVEL_4
  }
  // console.log('daysWeight ', daysWeight)

  // Calculate if exceeds max factors
  const exceedsMaxFactors =
    areaDifsWeight === UNLIMITED_WEIGHT_LEVEL ||
    distanceWeight === UNLIMITED_WEIGHT_LEVEL ||
    daysWeight === UNLIMITED_WEIGHT_LEVEL

  // console.log('exceedsMaxFactors ', exceedsMaxFactors)
  if (exceedsMaxFactors) {
    return -1
  }

  const checkedWeight = CHECKED_WEIGHT_LEVEL_1

  // Calculate similarity
  const similarity =
    ((AREA_WEIGHT_LEVEL_1 + DIST_WEIGHT_LEVEL_1 + DAYS_WEIGHT_LEVEL_1 + CHECKED_WEIGHT_LEVEL_1) /
      (areaDifsWeight + distanceWeight + daysWeight + checkedWeight)) *
    100

  return similarity
}
