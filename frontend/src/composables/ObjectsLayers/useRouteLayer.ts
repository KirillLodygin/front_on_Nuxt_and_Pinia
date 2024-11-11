import maplibre, { LngLatBounds, Map, Marker } from 'maplibre-gl'
import useGeoTsof from '~/store/geoTsofs'
import type { sideEffectType } from '~/types/objectsLayerTypes'
import { decodeRoute } from '~/utils/mapUtils.js'

export function useRouteLayer(
  map: Map,
  sourceName: string,
  lineLayerName: string,
  startPointMarker: Marker | null,
  endPointMarker: Marker | null,
  addSourceAndLayersSideEffect: sideEffectType,
) {
  const bounds = new maplibre.LngLatBounds()

  const geoTsofItem = useGeoTsof().activeGeoTsofItem
  const geoTsofItemShape = geoTsofItem?.shape
  if (!geoTsofItemShape) return

  const boundaryObjects: any[] = []
  const boundaryObjectsSource = map.getSource(sourceName)
  // console.log('addSourceAndLayers')
  if (geoTsofItemShape.route !== 'LineString') {
    const coords = decodeRoute(geoTsofItemShape.route, 6)

    coords.reduce((boundsLineString, coord) => {
      return boundsLineString.extend(coord as any)
    }, bounds)
    boundaryObjects.push({
      geometry: {
        type: 'LineString',
        coordinates: coords,
      },
      id: 0,

      type: 'Feature',
      obj_misc: {
        name: 'Маршрут',
      },
    })
    console.log(boundaryObjects)

    // console.log(boundaryObjectsSource, boundaryObjects, isCustomMarkers)
  } else {
    const coords = [geoTsofItemShape.startPoint.coordinates, geoTsofItemShape.endPoint.coordinates]
    bounds.extend({ lon: geoTsofItemShape.startPoint.coordinates[0], lat: geoTsofItemShape.startPoint.coordinates[1] })
    bounds.extend({ lon: geoTsofItemShape.endPoint.coordinates[0], lat: geoTsofItemShape.endPoint.coordinates[1] })
    boundaryObjects.push({
      geometry: {
        type: 'LineString',
        coordinates: coords,
      },
      id: 0,

      type: 'Feature',
      obj_misc: {
        name: 'Маршрут',
      },
    })
    console.log(boundaryObjects)

    // console.log(boundaryObjectsSource, boundaryObjects, isCustomMarkers)
  }
  if (boundaryObjectsSource) {
    ;(boundaryObjectsSource as any).setData({
      type: 'FeatureCollection',
      features: boundaryObjects,
    })
  } else {
    // События для точки объекта
    map.addSource(sourceName, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: boundaryObjects,
      },
    })

    map.addLayer({
      id: lineLayerName,
      type: 'line',
      source: sourceName,
      paint: {
        'line-color': '#868D92',
        'line-width': 5,
      },
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      filter: ['==', '$type', 'LineString'],
    })
  }
  if (startPointMarker) startPointMarker.remove()
  if (endPointMarker) endPointMarker.remove()
  const elStart = document.createElement('div')
  elStart.innerHTML = '<i class="icon fi_star"></i>'

  // add marker to map

  const startPointPopupHtml =
    '<div class="popup-container">' +
    '<div style="font-size: 1.2em" class="popup-container_title">' +
    geoTsofItem.source +
    '</div><p class="popup-container_row-text">' +
    geoTsofItem.source_address +
    '</p>' +
    '</div>'
  const endPointPopupHtml =
    '<div class="popup-container">' +
    '<div style="font-size: 1.2em" class="popup-container_title">' +
    geoTsofItem.pricing_factor_name +
    '</div><p class="popup-container_row-text">' +
    (geoTsofItem.address ? geoTsofItem.address : 'Нет данных') +
    '</p>' +
    '</div>'
  const startPointPopup = new maplibre.Popup({ offset: [0, 15], anchor: 'top' }).setHTML(startPointPopupHtml)
  const endPointPopup = new maplibre.Popup({ offset: [0, 15], anchor: 'top' }).setHTML(endPointPopupHtml)
  let newStartPointMarker = new maplibre.Marker({ element: elStart })
  newStartPointMarker
    .setLngLat(geoTsofItemShape.startPoint.coordinates as any)
    .setPopup(startPointPopup)
    .addTo(map)
    .addClassName('aim-marker')
  const elEnd = document.createElement('div')
  elEnd.innerHTML = '<i class="icon fi_disc icon-sm"></i>'

  // add marker to map
  let newEndPointMarker = new maplibre.Marker({ element: elEnd })
  newEndPointMarker
    .setLngLat(geoTsofItemShape.endPoint.coordinates as any)
    .setPopup(endPointPopup)
    .addTo(map)
    .addClassName('aim-marker')
  if (addSourceAndLayersSideEffect) {
    addSourceAndLayersSideEffect(bounds, newStartPointMarker, newEndPointMarker)
  }
}
