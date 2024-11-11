<!-- 
  Слой для вывода на карте мини-сервиса "Измерение"
  Выводятся точки линейки, линия или полигон в зависимости от режима измерения.
  Используется внутри тэга MapComponent
-->
<script setup>
import * as turf from '@turf/turf'
import { boolean } from 'mathjs'
import { mapModeType, measureModeType } from '~/types/mapTypes'

const { $mapStore } = useNuxtApp()

const props = defineProps({
  map: { type: Object, required: true },
  mapInit: { type: boolean, required: true },
})

const visible = ref(false)
// Названия для источника и слоёв maplibre
let pointsSrcName = 'pointsSrc'
let lineScrName = 'lineSrc'
let polygonSrcName = 'polygonSrc'

let pointsSrc = {}
let lineSrc = {}
let polygonSrc = {}

let lineSrcPointer = null

let dragPointId = null

watch(
  () => props.map,
  () => {
    if (props.map) {
      props.map.on('load', onMapLoad)
    }
  },
)

watch(
  () => $mapStore.measureMode,
  () => {
    toggleMode($mapStore.measureMode)
  },
)

watch(
  () => visible.value,
  () => {
    updateVisible($mapStore.measureVisible)
  },
)

watch(
  () => $mapStore.measureVisible,
  () => {
    visible.value = $mapStore.measureVisible
  },
)

watch(
  () => $mapStore.measureReset,
  () => {
    if ($mapStore.measureReset) {
      reset()
    }
  },
)

watch(
  () => $mapStore.measurePointFromCoords,
  () => {
    if ($mapStore.measurePointFromCoords) {
      reset()
      addPoint([$mapStore.measurePointFromCoords.lng, $mapStore.measurePointFromCoords.lat])
      $mapStore.measurePointFromCoords = null
    }
  },
)

onMounted(() => {})

onUnmounted(() => {
  if (!props.mapInit) return
  removeSourceAndLayers()

  props.map.off('click', onMapClick)
  props.map.off('mousemove', onMapMouseMove)
})

const onMapLoad = () => {
  addSourceAndLayers()

  props.map.on('click', onMapClick)
  props.map.on('mousemove', onMapMouseMove)
  props.map.on('mousedown', 'measure-points', onPointMouseDown)

  visible.value = true
}

const toggleMode = (measureMode) => {
  if (measureMode === measureModeType.distance) {
    lineSrcPointer = lineSrc
    // props.map.setFilter('measure-lines', ['in', '$type', 'LineString'])
    props.map.setLayoutProperty('measure-polygon', 'visibility', 'none')
  } else if (measureMode === measureModeType.area) {
    lineSrcPointer = polygonSrc
    // props.map.setFilter('measure-lines', ['in', '$type', 'Polygon'])
    props.map.setLayoutProperty('measure-polygon', 'visibility', 'visible')
  }
  props.map.getSource(lineScrName).setData(lineSrcPointer)
}

// Создаёт чистые объекты источников (Source)
const clearSources = () => {
  pointsSrc = {
    type: 'FeatureCollection',
    features: [],
  }

  lineSrc = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [],
    },
  }

  lineSrcPointer = lineSrc

  polygonSrc = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[]],
    },
  }
}

// Добавляет источники MapLibre и слои для них
const addSourceAndLayers = () => {
  clearSources()

  props.map.addSource(pointsSrcName, {
    type: 'geojson',
    data: pointsSrc,
  })
  props.map.addSource(lineScrName, {
    type: 'geojson',
    data: lineSrc,
  })
  props.map.addSource(polygonSrcName, {
    type: 'geojson',
    data: polygonSrc,
  })

  props.map.addLayer({
    id: 'measure-lines',
    type: 'line',
    source: lineScrName,
    paint: {
      'line-color': '#888',
      'line-width': 3,
    },
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
      visibility: $mapStore.measureMode === measureModeType.distance ? 'visible' : 'none',
    },
  })

  props.map.addLayer({
    id: 'measure-polygon',
    type: 'fill',
    source: polygonSrcName,
    paint: {
      'fill-color': '#888',
      'fill-opacity': 0.4,
    },
    layout: {
      visibility: $mapStore.measureMode === measureModeType.area ? 'visible' : 'none',
    },
  })

  props.map.addLayer({
    id: 'measure-points',
    type: 'circle',
    source: pointsSrcName,
    paint: {
      'circle-radius': 3.5,
      'circle-color': '#ffffff',
      'circle-stroke-width': 3,
      'circle-stroke-color': '#888',
    },
  })
}

// Удаление ресурсов и слоёв MapLibre
const removeSourceAndLayers = () => {
  if (props.map.getLayer('measure-lines')) {
    props.map.removeLayer('measure-lines')
  }
  if (props.map.getLayer('measure-polygon')) {
    props.map.removeLayer('measure-polygon')
  }
  if (props.map.getLayer('measure-points')) {
    props.map.removeLayer('measure-points')
  }
  if (props.map.getSource(pointsSrcName)) {
    props.map.removeSource(pointsSrcName)
  }
  if (props.map.getSource(lineScrName)) {
    props.map.removeSource(lineScrName)
  }
  if (props.map.getSource(polygonSrcName)) {
    props.map.removeSource(polygonSrcName)
  }
}

// Обновление источников lineSrc и polygonSrc в соответсвтии с pointsSrc
const updatePoints = (forceUpdateLength, updateArea) => {
  lineSrc.geometry.coordinates = []
  polygonSrc.geometry.coordinates = [[]]

  updateLine(forceUpdateLength, updateArea)

  props.map.getSource(pointsSrcName).setData(pointsSrc)
  props.map.getSource(lineScrName).setData(lineSrcPointer)
  props.map.getSource(polygonSrcName).setData(polygonSrc)
}

// Добавляет новую точку и обновляет все источники
const addPoint = (coordinates) => {
  addFeaturePoint({ id: String(new Date().getTime()), length: 0, coordinates: coordinates })
  lineSrc.geometry.coordinates = []
  polygonSrc.geometry.coordinates = [[]]
  updateLine(false, true)

  props.map.getSource(pointsSrcName).setData(pointsSrc)
  props.map.getSource(lineScrName).setData(lineSrcPointer)
  props.map.getSource(polygonSrcName).setData(polygonSrc)
}

// Добавление в источник типа Point новый элемент
const addFeaturePoint = (point) => {
  const fPoint = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: point.coordinates,
    },
    properties: {
      id: point.id,
      length: point.length,
      label: pointsSrc.features.length == 0 ? 'Начальная точка' : point.length + ' км',
    },
  }
  pointsSrc.features.push(fPoint)
}

// Обновление по точкам из geojson.features источников линии и полигона, а также надписей с расстояниями
const updateLine = (forceUpdateLength, updateArea) => {
  if (pointsSrc.features.length > 1) {
    pointsSrc.features.forEach((fPoint, index) => {
      lineSrc.geometry.coordinates.push(fPoint.geometry.coordinates)
      polygonSrc.geometry.coordinates[0].push(fPoint.geometry.coordinates)

      if (index > 0 && (forceUpdateLength || fPoint.properties.length == 0)) {
        const length = turf.length(lineSrc).toLocaleString()
        fPoint.properties.length = length
        fPoint.properties.label = length + ' км'
      }
    })

    polygonSrc.geometry.coordinates[0].push(pointsSrc.features[0].geometry.coordinates)

    const lastPoint = pointsSrc.features[pointsSrc.features.length - 1]
    $mapStore.measureDistanceValue = lastPoint.properties.length

    if (updateArea) {
      const area = turf.area(polygonSrc).toLocaleString()
      $mapStore.measureAreaValue = area
    }
  }
}

const onMapClick = (e) => {
  if ($mapStore.mapMode !== 'measuring') return

  // Если клик + ctrl, то удаляем точку под курсором
  if (e.originalEvent.ctrlKey) {
    const features = props.map.queryRenderedFeatures(e.point, {
      layers: ['measure-points'],
    })

    if (features.length) {
      const deleteIndex = getPointIndexById(features[0].properties.id)
      if (deleteIndex >= 0) {
        pointsSrc.features.splice(deleteIndex, 1)
        updatePoints(true, true)
      }
    }
  }
  // Иначе добавляем новую точку под указателем
  else {
    addPoint([e.lngLat.lng, e.lngLat.lat])
  }
}

const getPointIndexById = (id) => {
  for (let i = 0; i < pointsSrc.features.length; i++) {
    if (pointsSrc.features[i].properties.id == id) {
      return i
    }
  }
  return -1
}

const onMapMouseMove = (e) => {
  if ($mapStore.mapMode !== 'measuring') return

  if (dragPointId) {
    const dragPointIndex = getPointIndexById(dragPointId)
    // console.log(pointsSrc.features[dragPointIndex])
    pointsSrc.features[dragPointIndex].geometry.coordinates = [e.lngLat.lng, e.lngLat.lat]
    updatePoints(false, false)
  }
  else {
    const features = props.map.queryRenderedFeatures(e.point, {
      layers: ['measure-points'],
    })
    // UI indicator for clicking/hovering a point on the map
    if (features.length) {
      props.map.getCanvas().style.cursor = 'pointer'
      const coordinates = features[0].geometry.coordinates
      props.map.popup.setLngLat(coordinates).setHTML(features[0].properties.label).addTo(props.map)
    } else {
      props.map.popup.remove()
      if ($mapStore.mapMode !== 'measuring') {
        props.map.getCanvas().style.cursor = 'crosshair'
      } else {
        props.map.getCanvas().style.cursor = null
      }
    }
  }
}

const onPointMouseDown = (e) => {
  if ($mapStore.mapMode !== 'measuring') return

  e.preventDefault();

  const features = props.map.queryRenderedFeatures(e.point, {
    layers: ['measure-points']
  })
  if (features.length > 0) {
    dragPointId = features[0].properties.id
    props.map.setFeatureState(
        {source: pointsSrcName, id: dragPointId},
        {drag: true}
    )

    props.map.once('mouseup', onMapMouseUp)

    props.map.popup.remove()
  }
}

const onMapMouseUp = (e) => {
  dragPointId = null
  props.map.setFeatureState(
      {source: pointsSrcName, id: dragPointId},
      {drag: false}
  )
  updatePoints(true, true)
}

// Сбрасывает параметры мини-сервиса измерений
const reset = () => {
  clearSources()

  props.map.getSource(pointsSrcName).setData(pointsSrc)
  props.map.getSource(lineScrName).setData(lineSrcPointer)
  props.map.getSource(polygonSrcName).setData(polygonSrc)

  $mapStore.measureDistanceValue = 0
  $mapStore.measureAreaValue = 0
  $mapStore.measureReset = false
}

const updateVisible = () => {
  props.map.setLayoutProperty('measure-points', 'visibility', visible.value ? 'visible' : 'none')
  props.map.setLayoutProperty('measure-lines', 'visibility', visible.value ? 'visible' : 'none')
  props.map.setLayoutProperty('measure-polygon', 'visibility', visible.value && ($mapStore.measureMode === measureModeType.area) ? 'visible' : 'none')
}

// Заменяет источник для слоя
const setLayerSource = (map, layerId, source, sourceLayer) => {
    const oldLayers = map.getStyle().layers;
    const layerIndex = oldLayers.findIndex(l => l.id === layerId);
    const layerDef = oldLayers[layerIndex];
    const before = oldLayers[layerIndex + 1] && oldLayers[layerIndex + 1].id;
    layerDef.source = source;
    if (sourceLayer) {
        layerDef['source-layer'] = sourceLayer;
    }
    map.removeLayer(layerId);
    map.addLayer(layerDef, before);
}
</script>
