import maplibre, { LngLatBounds, Map, Marker } from 'maplibre-gl'
import useCalculations from '~/store/calculations'
import type { sideEffectType } from '~/types/objectsLayerTypes'

export function useAnalogsComponentLayer(
  map: Map,
  items: any[],
  activeItem: any,
  firstNo: number,
  sourceName: string,
  imageLayerName: string,
  aimMarker: Marker | null,
  setListners: () => void,
  addSourceAndLayersSideEffect: sideEffectType,
) {
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
          selected: useCalculations().selectedAnalogs.some((item: any) => item.id === items[i].id),
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
    const selectedFilter = ['==', ['get', 'selected'], true]
    const unselectedFilter = ['==', ['get', 'selected'], false]
    map.addSource(sourceName, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: boundaryObjects,
      },
      cluster: true,
      clusterProperties: {
        selected: ['+', ['case', selectedFilter, 1, 0]],
        unselected: ['+', ['case', unselectedFilter, 1, 0]],
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
    if (aimMarker) aimMarker.remove()
    const _object = { ...useCalculations().aim }
    bounds.extend({ lon: _object.geo_pos.coordinates[0], lat: _object.geo_pos.coordinates[1] })

    const el = document.createElement('div')
    el.innerHTML = '<i class="icon fi_star"></i>'

    // add marker to map
    aimMarker = new maplibre.Marker({ element: el })
    aimMarker.setLngLat(_object.geo_pos.coordinates).addTo(map).addClassName('aim-marker')

    // События для точки объекта
    setListners()
    if (addSourceAndLayersSideEffect) {
      addSourceAndLayersSideEffect(bounds, boundaryObjects, activeItemIndex)
    }
  }
}
