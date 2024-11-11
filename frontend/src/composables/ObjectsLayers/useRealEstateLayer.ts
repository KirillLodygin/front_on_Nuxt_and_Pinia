import maplibre, { LngLatBounds, Map } from 'maplibre-gl'
import type { sideEffectType } from '~/types/objectsLayerTypes'

export function useRealEstateLayer(
  map: Map,
  items: any[],
  activeItem: any,
  firstNo: number,
  sourceName: string,
  imageLayerName: string,
  setListners: () => void,
  addSourceAndLayersSideEffect: sideEffectType,
) {
  console.log('useRealEstateLayer')
  let bounds = new maplibre.LngLatBounds()
  if (!items.length) {
    bounds = new maplibre.LngLatBounds([37.459559, 55.581409, 37.751709, 55.843542])
  }

  let activeItemIndex = -1
  const boundaryObjects: any[] = []
  // console.log('addSourceAndLayers')
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
  // console.log(boundaryObjectsSource, boundaryObjects, isCustomMarkers)
  // if (isCustomMarkers) {
  //   allSourceFeatures.value = [...boundaryObjects]
  //   // console.log(boundaryObjects, [...boundaryObjects], allSourceFeatures.value)
  // }
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

  // map.on('mouseenter', polygonLayerName, onObjectMouseEnter)
  // map.on('mousemove', polygonLayerName, onObjectMouseMove)
  // map.on('mouseleave', polygonLayerName, onObjectMouseLeave)
}
