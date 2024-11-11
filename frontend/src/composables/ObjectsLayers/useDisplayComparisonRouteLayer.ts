import maplibre, { LngLatBounds, Map, Marker } from 'maplibre-gl'
import type { sideEffectType } from '~/types/objectsLayerTypes'
import useDisplayCompare from '~/store/displayCompareObjectStore.js'
import { decodeRoute } from '~/utils/mapUtils.js'

export function useDisplayComparisonRouteLayer(
  map: Map,
  items: any[],
  activeItem: any,
  firstNo: number,
  sourceName: string,
  routeSourceName: string,
  imageLayerName: string,
  lineLayerName: string,
  endPointMarker: Marker | null,
  setListners: () => void,
  addSourceAndLayersSideEffect: sideEffectType,
) {
  let bounds = new maplibre.LngLatBounds()
  if (!items.length) {
    bounds = new maplibre.LngLatBounds([37.459559, 55.581409, 37.751709, 55.843542])
  }

  let activeItemIndex = -1
  const boundaryObjects: any[] = []
  const boundaryRouteObjects: any[] = []
  const geoTsofItem = useDisplayCompare().route
  const geoTsofItemShape = useDisplayCompare().route?.route
  const obj = useDisplayCompare().currentRealtyObject
  const factor = useDisplayCompare().currentPricingFactor + '_descr'
  const objIsValid = obj && factor && obj[factor]
  for (let i = 0; i < items.length; ++i) {
    const _object = items[i]

    if (_object.geo_pos && _object.geo_pos.type == 'Point') {
      if (!geoTsofItem || !geoTsofItemShape) {
        bounds.extend({ lon: _object.geo_pos.coordinates[0], lat: _object.geo_pos.coordinates[1] })
      }

      let _color = '#eee'
      let textColor = '#000'
      let circleStrokeColor = '#636363'

      if (_object == activeItem) {
        activeItemIndex = i
        _color = '#636363'
        textColor = '#fff'
      }

      const boundaryObject = {
        id: _object.id,
        type: 'Feature',
        properties: {
          type: 'Point',
          object_type: _object.object_type,
          lng: _object.geo_pos.coordinates[0],
          lat: _object.geo_pos.coordinates[1],
          color: _color,
          stroke: circleStrokeColor,
          text_color: textColor,
          // icon: 'analog-marker',
          index: i,
          no: '#' + (firstNo + i),
          id: _object.id,
        },
        geometry: _object.geo_pos,
      }

      boundaryObjects.push(boundaryObject)
    }
  }

  const boundaryObjectsSource = map.getSource(sourceName)
  const boundaryRouteObjectsSource = map.getSource(routeSourceName)

  let newEndPointMarker
  if (endPointMarker) endPointMarker.remove()
  if (geoTsofItemShape && geoTsofItem && objIsValid) {
    if (geoTsofItem.route !== 'LineString') {
      const coords = decodeRoute(geoTsofItemShape, 6)

      coords.reduce((boundsLineString, coord) => {
        return boundsLineString.extend(coord as any)
      }, bounds)
      boundaryRouteObjects.push({
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

      // console.log(boundaryObjectsSource, boundaryObjects, isCustomMarkers)
    } else {
      const coords = [geoTsofItem.startPoint.coordinates, geoTsofItem.endPoint.coordinates]
      bounds.extend({
        lon: geoTsofItem.startPoint.coordinates[0],
        lat: geoTsofItem.startPoint.coordinates[1],
      })
      bounds.extend({ lon: geoTsofItem.endPoint.coordinates[0], lat: geoTsofItem.endPoint.coordinates[1] })
      boundaryRouteObjects.push({
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

      // console.log(boundaryObjectsSource, boundaryObjects, isCustomMarkers)
    }

    const elStart = document.createElement('div')
    elStart.innerHTML = '<i class="icon fi_star"></i>'

    // add marker to map
    const endPointPopupHtml =
      '<div class="popup-container">' +
      '<div style="font-size: 1.2em" class="popup-container_title">' +
      geoTsofItem.name +
      '</div><p class="popup-container_row-text">' +
      (geoTsofItem.address ? geoTsofItem.address : 'Нет данных') +
      '</p>' +
      '</div>'
    const endPointPopup = new maplibre.Popup({ offset: [0, 15], anchor: 'top' }).setHTML(endPointPopupHtml)
    const elEnd = document.createElement('div')
    elEnd.innerHTML = '<i class="icon fi_disc icon-sm"></i>'

    // add marker to map
    newEndPointMarker = new maplibre.Marker({ element: elEnd })
    newEndPointMarker
      .setLngLat(geoTsofItem.endPoint.coordinates as any)
      .setPopup(endPointPopup)
      .addTo(map)
      .addClassName('aim-marker')
  }

  if (boundaryObjectsSource) {
    ;(boundaryObjectsSource as any).setData({
      type: 'FeatureCollection',
      features: boundaryObjects,
    })
  } else {
    map.addSource(sourceName, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: boundaryObjects,
      },
      cluster: true,
      clusterProperties: {
        ids: ['concat', ['concat', ['get', 'id'], ',']],
      },
      clusterMaxZoom: 20, // Max zoom to cluster points on
      clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
    })

    map.addLayer({
      id: imageLayerName,
      type: 'symbol',
      source: sourceName,
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-image': ['get', 'icon'],
        'icon-offset': [0, -1],
        // 'icon-size': 1
      },
    })
  }

  if (boundaryRouteObjectsSource) {
    ;(boundaryRouteObjectsSource as any).setData({
      type: 'FeatureCollection',
      features: boundaryRouteObjects,
    })
  } else {
    map.addSource(routeSourceName, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: boundaryRouteObjects,
      },
      cluster: false,
    })

    map.addLayer({
      id: lineLayerName,
      type: 'line',
      source: routeSourceName,
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

    // События для точки объекта
  }

  setListners()
  if (addSourceAndLayersSideEffect) {
    addSourceAndLayersSideEffect(bounds, newEndPointMarker, boundaryObjects, activeItemIndex)
  }
  // map.on('mouseenter', polygonLayerName, onObjectMouseEnter)
  // map.on('mousemove', polygonLayerName, onObjectMouseMove)
  // map.on('mouseleave', polygonLayerName, onObjectMouseLeave)
}
