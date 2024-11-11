import maplibre, { LngLatBounds, Map } from 'maplibre-gl'
import type { sideEffectType } from '~/types/objectsLayerTypes'

export function useRealtyObjectLayer(
  map: Map,
  items: any[],
  activeItem: any,
  firstNo: number,
  sourceName: string,
  realtyObjectPolygonsSourceName: string,
  imageLayerName: string,
  polygonLayerName: string,
  lineLayerName: string,
  circleLayerName: string,
  setListners: () => void,
  addSourceAndLayersSideEffect: sideEffectType,
) {
  let bounds = new maplibre.LngLatBounds()
  if (!items.length) {
    bounds = new maplibre.LngLatBounds([37.459559, 55.581409, 37.751709, 55.843542])
  }

  let activeItemIndex = -1
  const boundaryObjects: any[] = []
  const boundaryObjectsGeoObj: any[] = []
  for (let i = 0; i < items.length; ++i) {
    const _object = items[i]

    if (_object.geo_pos && _object.geo_pos.type == 'Point') {
      bounds.extend({ lon: _object.geo_pos.coordinates[0], lat: _object.geo_pos.coordinates[1] })

      let _color = '#eee'
      let textColor = '#000'
      let circleStrokeColor = '#636363'

      if (_object == activeItem) {
        activeItemIndex = i
        _color = '#636363'
        textColor = '#fff'
      }
      if (_object.geo_obj.type === 'MultiPolygon' || _object.geo_obj.type === 'Polygon') {
        const boundaryObjectPolygon = {
          id: _object.id,
          type: 'Feature',
          properties: {
            type: 'Polygon',
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
          geometry: _object.geo_obj,
        }
        boundaryObjectsGeoObj.push(boundaryObjectPolygon)
      }
      if (_object.geo_obj.type === 'MultiLineString' || _object.geo_obj.type === 'LineString') {
        const boundaryObjectLine = {
          id: _object.id,
          type: 'Feature',
          properties: {
            type: 'LineString',
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
          geometry: _object.geo_obj,
        }

        boundaryObjectsGeoObj.push(boundaryObjectLine)
      }
      if (_object.geo_obj.type === 'GeometryCollection') {
        const geometries = _object.geo_obj.geometries
        for (let i = 0; i < geometries.length; ++i) {
          const geometry = geometries[i]
          if (geometry.type === 'MultiPolygon' || geometry.type === 'Polygon') {
            const boundaryObjectPolygon = {
              id: _object.id,
              type: 'Feature',
              properties: {
                type: 'Polygon',
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
              geometry: geometry,
            }

            boundaryObjectsGeoObj.push(boundaryObjectPolygon)
          }
          if (geometry.type === 'MultiLineString' || geometry.type === 'LineString') {
            const boundaryObjectLine = {
              id: _object.id,
              type: 'Feature',
              properties: {
                type: 'LineString',
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
              geometry: geometry,
            }

            boundaryObjectsGeoObj.push(boundaryObjectLine)
          }
          if (geometry.type === 'MultiPoint' || geometry.type === 'Point') {
            const boundaryObjecPoint = {
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
              geometry: geometry,
            }

            boundaryObjectsGeoObj.push(boundaryObjecPoint)
          }
        }
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

    // События для точки объекта
    setListners()
    if (addSourceAndLayersSideEffect) {
      addSourceAndLayersSideEffect(bounds, boundaryObjects, activeItemIndex)
    }
  }

  const boundaryObjectsGeoObjSource = map.getSource(realtyObjectPolygonsSourceName)
  if (boundaryObjectsGeoObjSource) {
    ;(boundaryObjectsGeoObjSource as any).setData({
      type: 'FeatureCollection',
      features: boundaryObjectsGeoObj,
    })
  } else {
    map.addSource(realtyObjectPolygonsSourceName, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: boundaryObjectsGeoObj,
      },
    })
    map.addLayer({
      id: polygonLayerName,
      type: 'fill',
      source: realtyObjectPolygonsSourceName,
      paint: {
        'fill-color': 'rgba(200, 100, 240, 0.4)',
        'fill-opacity': 0.75,
        'fill-outline-color': '#000',
      },
      filter: ['==', '$type', 'Polygon'],
    })
    map.addLayer({
      id: lineLayerName,
      type: 'line',
      source: realtyObjectPolygonsSourceName,
      paint: {
        'line-color': 'rgba(200, 100, 240, 0.6)',
        'line-width': 5,
      },
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      filter: ['==', '$type', 'LineString'],
    })
    map.addLayer({
      id: circleLayerName,
      type: 'circle',
      source: realtyObjectPolygonsSourceName,
      filter: ['==', '$type', 'Point'],
      paint: {
        'circle-radius': 10,
        'circle-color': 'rgba(200, 100, 240, 0.5)',
        'circle-stroke-color': 'rgba(200, 100, 240, 0.6)',
        'circle-stroke-width': 1,
      },
    })
  }
}
