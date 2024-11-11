<!-- 
  Слой для вывода на карте результатов поиска по адресу.
  Выводятся точки с иконкой лупы, активный объект выделяется ярким цветом.
  Используется внутри тэга MapComponent
-->
<script lang="ts" setup>
import type { Map, Popup } from 'maplibre-gl'
import maplibre from 'maplibre-gl'

const props = defineProps({
  // Объект карты MapLibre-gl
  map: { type: Object as PropType<Map>, required: true },
  mapMode: { type: String, required: true },
  mapStore: { type: Object, required: true },
})

// Названия для источников и слоёв maplibre
const id = ref(0)
let sourceName: string = ''
let circleLayerName: string = ''
let labelLayerName: string = ''
let imageLayerName: string = ''
let clusterLayerName: string = ''
let clusterCountLayerName: string = ''
let selectedBuildingLayerName: string = ''
let selectedBuildingSourceName: string = ''
const colorOrdinar: string = '#516516'
const colorActive: string = '#429993'

let hoveredStateId: any
let mapPopup: Popup

onMounted(() => {
  const instance = getCurrentInstance()
  const name = 'saLayer'
  if (instance) {
    id.value = instance.uid
    // Названия для источников и слоёв maplibre
    sourceName = name + '_' + id.value + '_source'
    selectedBuildingSourceName = name + '_' + id.value + '_building_polygon_source'
    circleLayerName = name + '_' + id.value + '_points'
    labelLayerName = name + '_' + id.value + '_label'
    imageLayerName = name + '_' + id.value + '_image'
    clusterLayerName = name + '_' + id.value + '_cluster'
    clusterCountLayerName = name + '_' + id.value + '_cluster_count'
    selectedBuildingLayerName = name + '_' + id.value + '_building_polygon'
  }
})

onUnmounted(() => {
  removeSourceAndLayers()
})

onUpdated(() => {})

watch([() => props.mapStore.saVariants, () => props.mapStore.saActiveIndex], () => {
  addSourceAndLayers()
})

const addSourceAndLayers = async () => {
  const boundaryObjects: any[] = []

  for (let i = 0; i < props.mapStore.saVariants.length; ++i) {
    const _object = props.mapStore.saVariants[i]
    boundaryObjects.push({
      id: _object.osm_id,
      type: 'Feature',
      properties: {
        type: 'Point',
        lng: _object.lon,
        lat: _object.lat,
        color: i === props.mapStore.saActiveIndex ? colorActive : colorOrdinar,
        icon: 'search-marker',
        index: i,
        active: i === props.mapStore.saActiveIndex ? 1 : 0,
      },
      geometry: {
        type: 'Point',
        coordinates: [_object.lon, _object.lat],
      },
    })
  }

  const boundaryObjectsSource = props.map.getSource(sourceName)

  if (boundaryObjectsSource) {
    ;(boundaryObjectsSource as any).setData({
      type: 'FeatureCollection',
      features: boundaryObjects,
    })
  } else {
    // загрузка значка
    if (!props.map.hasImage('search-marker')) {
      const searchImgResp = await props.map.loadImage('/img/magnifying-glass-16.png')
      props.map.addImage('search-marker', searchImgResp.data)
    }

    props.map.addSource(sourceName, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: boundaryObjects,
      },
      cluster: true,
      clusterMaxZoom: 14, // Max zoom to cluster points on
      clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
      clusterProperties: {
        active: ['+', ['get', 'active']],
      },
    })

    props.map.addLayer({
      id: circleLayerName,
      type: 'circle',
      source: sourceName,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-radius': 13,
        'circle-color': ['get', 'color'],
        'circle-stroke-width': 0,
      },
    })

    props.map.addLayer({
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

    props.map.addLayer({
      id: clusterLayerName,
      type: 'circle',
      source: sourceName,
      filter: ['has', 'point_count'],
      paint: {
        // with three steps to implement three types of circles:
        //   * Blue, 20px circles when point count is less than 100
        //   * Yellow, 30px circles when point count is between 100 and 750
        //   * Pink, 40px circles when point count is greater than or equal to 750
        'circle-color': ['case', ['==', ['get', 'active'], 1], colorActive, colorOrdinar],
        'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
      },
    })

    props.map.addLayer({
      id: clusterCountLayerName,
      type: 'symbol',
      source: sourceName,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
        'text-anchor': 'top',
        'icon-image': 'search-marker',
        'icon-anchor': 'bottom',
      },
      paint: {
        'text-color': '#fff',
      },
    })

    // События для точки объекта
    props.map.on('mouseenter', circleLayerName, onObjectMouseEnter)
    props.map.on('mouseleave', circleLayerName, onObjectMouseLeave)
    props.map.on('click', circleLayerName, onObjectClick)

    // События для кластера
    props.map.on('mouseenter', clusterLayerName, onClusterMouseEnter)
    props.map.on('mouseleave', clusterLayerName, onClusterMouseLeave)
    props.map.on('click', clusterLayerName, onClusterClick)
  }
}

const removeSourceAndLayers = () => {
  if (!Object.keys(props.map).length) return

  if (props.map.getLayer(circleLayerName)) {
    props.map.removeLayer(circleLayerName)
  }
  if (props.map.getLayer(labelLayerName)) {
    props.map.removeLayer(labelLayerName)
  }
  if (props.map.getLayer(imageLayerName)) {
    props.map.removeLayer(imageLayerName)
  }
  if (props.map.getLayer(clusterLayerName)) {
    props.map.removeLayer(clusterLayerName)
  }
  if (props.map.getLayer(clusterCountLayerName)) {
    props.map.removeLayer(clusterCountLayerName)
  }
  if (props.map.getLayer(selectedBuildingLayerName)) {
    props.map.removeLayer(selectedBuildingLayerName)
  }
  if (props.map.getSource(sourceName)) {
    props.map.removeSource(sourceName)
  }
  if (props.map.getSource(selectedBuildingSourceName)) {
    props.map.removeSource(selectedBuildingSourceName)
  }
}

const updateHoverObject = (event: any) => {
  var coordinates
  if (event.features[0].properties.type === 'Polygon') {
    coordinates = event.lngLat
  } else if (event.features[0].properties.type === 'Point') {
    coordinates = event.features[0].geometry.coordinates.slice()
  }

  if (event.features.length > 0) {
    if (hoveredStateId) {
      props.map.setFeatureState({ source: sourceName, id: hoveredStateId }, { hover: false })
    }
    hoveredStateId = event.features[0].id
    props.map.setFeatureState({ source: sourceName, id: hoveredStateId }, { hover: true })
  }

  const _object = props.mapStore.saVariants[event.features[0].properties.index]
  const icon = `<i class="fas fa-search"></i>`
  const title =
    `<div style="font-size: 1.2em; color:${event.features[0].properties.color}">` +
    icon +
    ' Результаты поиска </div><div style="margin-left: 20px;">' +
    _object.shortName +
    '</div>'
  mapPopup?.remove()
  mapPopup = new maplibre.Popup({
    closeButton: false,
    closeOnClick: false,
  })
  mapPopup.setLngLat(coordinates).setHTML(title).addTo(props.map)
}

// Событие при наведении на точку объекта
const onObjectMouseEnter = (event: any) => {
  props.map.getCanvas().style.cursor = 'pointer'
  updateHoverObject(event)
}

const onObjectMouseMove = (event: any) => {
  updateHoverObject(event)
}

// Событие при уходе с точки объекта
const onObjectMouseLeave = (event: any) => {
  if (hoveredStateId) {
    props.map.setFeatureState({ source: sourceName, id: hoveredStateId }, { hover: false })
    hoveredStateId = null
  }

  props.map.getCanvas().style.cursor = ''
  mapPopup?.remove()
}

// Событие при клике на точке объекта
const onObjectClick = (event: any) => {}

// Событие по клику на кластере (приближение карты)
const onClusterClick = (event: any) => {
  var features = props.map.queryRenderedFeatures(event.point, {
    layers: [clusterLayerName],
  })
  var clusterId = features[0].properties.cluster_id
  const source: any = props.map.getSource(sourceName)
  source?.getClusterExpansionZoom(clusterId, function (err: Error, _zoom: number) {
    if (err) return

    props.map.easeTo({
      center: (features[0].geometry as any).coordinates,
      zoom: _zoom,
    })
  })
}

// Событие по наведению на точке кластера
const onClusterMouseEnter = (event: any) => {
  props.map.getCanvas().style.cursor = 'pointer'

  var coordinates = event.features[0].geometry.coordinates.slice()

  if (event.features.length > 0) {
    if (hoveredStateId) {
      props.map.setFeatureState({ source: sourceName, id: hoveredStateId }, { hover: false })
    }
    hoveredStateId = event.features[0].id
    props.map.setFeatureState({ source: sourceName, id: hoveredStateId }, { hover: true })
  }

  const color = '#ff0000'
  const pointCount = event.features[0].properties.point_count
  const pointCountLabel = 'в точке ' + pointCount + (pointCount <= 4 ? ' объекта' : ' объектов')
  const icon = `<i class="fas fa-dot-circle" style="color:#000"></i>`
  const title =
    `<div style="font-size: 1.2em;">` +
    icon +
    ` Группа объектов</div><div style="margin-left: 20px;">(${pointCountLabel})</div>`
  const clusterId = event.features[0].properties.cluster_id
  const source: any = props.map.getSource(sourceName)
  source?.getClusterChildren(clusterId, function (err: Error, features: any) {
    if (err) return
  })
  mapPopup?.remove()
  mapPopup = new maplibre.Popup({
    closeButton: false,
    closeOnClick: false,
  })
  mapPopup.setLngLat(coordinates).setHTML(title).addTo(props.map)
}

// Событие по уходу с точки кластера
const onClusterMouseLeave = (event: any) => {
  props.map.getCanvas().style.cursor = ''
  mapPopup?.remove()
}

const render = () => {
  return ''
}
</script>
