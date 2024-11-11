// Формат Nominateim::boundingbox [min_latitude, max_latitude, min_longitude, max_longitude]

function adjustLng(value: number) {
  return value <= 0 ? 5 : value >= 180 ? 175 : value
  // return value
}

function adjustLat(value: number) {
  return value <= 0 ? 5 : value >= 90 ? 85 : value
  // return value
}

// Преобразует bounds (MapLibreGL::LngLatBounds)
// в строку (_sw.lng, _sw.lng, _ne.lng, _ne.lng)
function boundsStr(bounds: any) {
  var res = []
  res.push(adjustLng(bounds._sw.lng))
  res.push(adjustLat(bounds._sw.lat))
  res.push(adjustLng(bounds._ne.lng))
  res.push(adjustLat(bounds._ne.lat))
  return res.join(',')
}

// Проверка нахождения точки point (MapLibreGL::LngLat) внутри box ({minLng, maxLng, minLat, maxLat})
function pointInBox(point: any, box: any) {
  return between(point.lng, box.minLng, box.maxLng) && between(point.lat, box.minLat, box.maxLat)
}

// Проверяет вхождение boundsIn в boundsOut (MapLibreGL::LngLatBounds)
function boundsInBounds(boundsIn: any, boundsOut: any) {
  return (
    between(boundsIn._sw.lng, boundsOut._sw.lng, boundsOut._ne.lng) &&
    between(boundsIn._sw.lat, boundsOut._sw.lat, boundsOut._ne.lat) &&
    between(boundsIn._ne.lng, boundsOut._sw.lng, boundsOut._ne.lng) &&
    between(boundsIn._ne.lat, boundsOut._sw.lat, boundsOut._ne.lat)
  )
}

// Находится ли значение value между i1, i2
function between(value: number, i1: number, i2: number) {
  if (i1 < i2) return value >= i1 && value <= i2
  else return value <= i1 && value >= i2
}

// Вписывает значение value в диапазон min...max
function setToRange(value: number, min: number, max: number) {
  if (value < min) value = min
  if (value > max) value = max
  return value
}

// Возвращает bounds, который охватывает оба bounds (Nominateim::boundingbox)
function extendBounds(bounds1: any[], bounds2: any[]) {
  return [
    Math.min(bounds1[0], bounds2[0]),
    Math.max(bounds1[1], bounds2[1]),
    Math.min(bounds1[2], bounds2[2]),
    Math.max(bounds1[3], bounds2[3]),
  ]
}

// Конвертирует bounds (Nominateim::boundingbox) в формат MapLibreGl::LngLatBoundsLike
function nmbox2mlbox(nmbox: any[]) {
  return [
    [nmbox[2], nmbox[0]],
    [nmbox[3], nmbox[1]],
  ]
}

export { boundsStr, setToRange, pointInBox, boundsInBounds, between, extendBounds, nmbox2mlbox }
