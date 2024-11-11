import { noDataAvailable } from '~/app_constants/comparisonConsts'

export const getOnFootLine = (obj: Record<string, any> | null) => {
  if (!obj) return noDataAvailable
  // if (obj.all_types.by_foot && obj.all_types.by_foot.distance && obj.all_types.by_foot.time) {
  //   return ` ${obj.all_types.by_foot?.distance?.toFixed(1).replace(/\./g, ',')} км (${obj.all_types.by_foot?.time?.toFixed(0).replace(/\./g, ',')} мин)`
  // }
  // return ''
  return ` ${obj.all_types.by_foot?.distance?.toFixed(1).replace(/\./g, ',')} км (${obj.all_types.by_foot?.time?.toFixed(0).replace(/\./g, ',')} мин)`
}

export const getOnCarLine = (obj: Record<string, any> | null) => {
  if (!obj) return noDataAvailable
  // if (obj.all_types.by_car && obj.all_types.by_car.distance && obj.all_types.by_car.time) {
  //   return ` ${obj.all_types.by_car?.distance?.toFixed(1).replace(/\./g, ',')} км (${obj.all_types.by_car?.time?.toFixed(0).replace(/\./g, ',')} мин)`
  // }
  // return ''
  return ` ${obj.all_types.by_car?.distance?.toFixed(1).replace(/\./g, ',')} км (${obj.all_types.by_car?.time?.toFixed(0).replace(/\./g, ',')} мин)`
}

export const getDirectLine = (obj: Record<string, any> | null) => {
  if (!obj) return noDataAvailable
  // if (obj.all_types.direct && obj.all_types.direct.distance) {
  //   return ` ${obj.all_types.direct?.distance.toFixed(1).replace(/\./g, ',')} км`
  // }
  // return ''
  return ` ${obj.all_types.direct?.distance.toFixed(1).replace(/\./g, ',')} км`
}
