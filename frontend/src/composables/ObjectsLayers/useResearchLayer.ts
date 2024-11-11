import maplibre, { Map } from 'maplibre-gl'

export function useResearchLayer(
  map: Map,
  items: any[],
  sourceName: string,
  circleLayerName: string,
  polygonLayerName: string,
  imageLayerName: string,
  setListners: () => void,
) {
  console.log('addSourceAndLayers')

  const boundaryObjects: any[] = []
  // console.log('addSourceAndLayers')
  for (let i = 0; i < items.length; ++i) {
    const _object = items[i]
    console.log(_object)
    if (_object.geo_pos) {
      let _color = _object.color
      let textColor = '#000'
      let circleStrokeColor = '#636363'

      const boundaryObject = {
        id: _object.id,
        type: 'Feature',
        properties: {
          type: _object.geo_pos.type,
          //   object_type: _object.object_type,
          //   lng: _object.geo_pos.coordinates[0],
          //   lat: _object.geo_pos.coordinates[1],
          color: _color,
          stroke: circleStrokeColor,
          text_color: textColor,
          // icon: 'analog-marker',
          index: i,

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

      clusterMaxZoom: 20, // Max zoom to cluster points on
      clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
    })

    map.addLayer({
      id: circleLayerName,
      type: 'circle',
      source: sourceName,
      filter: ['==', '$type', 'Point'],
      paint: {
        'circle-radius': 10,
        'circle-color': ['get', 'color'],
        'circle-stroke-color': ['get', 'stroke'],
        'circle-stroke-width': 1,
      },
    })
    map.addLayer({
      id: polygonLayerName,
      type: 'fill',
      source: sourceName,
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': 1,
        'fill-outline-color': '#000',
      },
      filter: ['==', '$type', 'Polygon'],
    })
  }

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
  setListners()
}
