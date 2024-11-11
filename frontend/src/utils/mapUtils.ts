export function decodeRoute(str: string, precision: number) {
  var index = 0
  var lat = 0
  var lng = 0
  var coordinates = []
  var shift = 0
  var result = 0
  var byte = null
  var latitudeChange
  var longitudeChange
  var factor = Math.pow(10, precision || 6)

  // Coordinates have variable length when encoded, so just keep
  // track of whether we've hit the end of the string. In each
  // loop iteration, a single coordinate is decoded.
  while (index < str.length) {
    // Reset shift, result, and byte
    byte = null
    shift = 0
    result = 0

    do {
      byte = str.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    latitudeChange = result & 1 ? ~(result >> 1) : result >> 1

    shift = result = 0

    do {
      byte = str.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    longitudeChange = result & 1 ? ~(result >> 1) : result >> 1

    lat += latitudeChange
    lng += longitudeChange

    coordinates.push([lng / factor, lat / factor])
  }

  return coordinates
}
