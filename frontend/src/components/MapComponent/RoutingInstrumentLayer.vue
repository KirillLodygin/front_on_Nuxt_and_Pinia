<template></template>

<script setup lang="ts">
import * as turf from '@turf/turf'
import { boolean } from 'mathjs'
import { mapModeType, measureModeType } from '~/types/mapTypes'
import { LngLatBounds, MapMouseEvent, Marker, type Map, type Offset, type Popup } from 'maplibre-gl'
import maplibre from 'maplibre-gl'
import type { RouteDataType } from '~/types/valhallaResponseTypes'
import { decodeRoute } from '~/utils/mapUtils.js'

const { $mapStore } = useNuxtApp()

const props = defineProps({
  // Объект карты MapLibre-gl
  map: { type: Object as PropType<Map>, required: true },
  // Прошла ли инициализация карты
  mapInit: { type: Boolean, required: true },
})
// Названия для источника и слоёв maplibre
let lineScrName = 'lineSrc_routing_instrument'
let lineLayerName = 'line_layer_routing_instrument'

let lineSrc: any = {
  type: 'Feature',
  geometry: {
    type: 'LineString',
    coordinates: [],
  },
}

watch(
  () => props.mapInit,
  () => {
    if (props.mapInit) {
      onMapLoad()
    }
  },
)
onUnmounted(() => {
  if (!props.mapInit) return
  removeSourceAndLayers()
  props.map.off('mousedown', onMapMouseDown)
  props.map.off('mouseout', onMapMouseOut)
  props.map.off('mousemove', onMapMouseMove)
})

// Добавляет источники MapLibre и слои для них
const addSourceAndLayers = () => {
  clearSources()
  removeSourceAndLayers()
  props.map.addSource(lineScrName, {
    type: 'geojson',
    data: lineSrc,
  })

  props.map.addLayer({
    id: lineLayerName,
    type: 'line',
    source: lineScrName,
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': '#868D92',
      'line-width': 5,
    },
  })
}

// Создаёт чистые объекты источников (Source)
const clearSources = () => {
  lineSrc = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [],
    },
  }
}

// Удаление ресурсов и слоёв MapLibre
const removeSourceAndLayers = () => {
  if (props.map.getLayer(lineLayerName)) {
    props.map.removeLayer(lineLayerName)
  }

  if (props.map.getSource(lineScrName)) {
    props.map.removeSource(lineScrName)
  }
  if (startPointMarker) {
    startPointMarker.remove()
    startPointMarker = null
  }
  if (endPointMarker) {
    endPointMarker.remove()
    endPointMarker = null
  }
}

const reset = () => {
  clearSources()
  // @ts-ignore
  props.map.getSource(lineScrName)?.setData(lineSrc)
}

function onMapLoad() {
  addSourceAndLayers()
  props.map.on('mousedown', onMapMouseDown)
  props.map.on('mouseout', onMapMouseOut)
  props.map.on('mousemove', onMapMouseMove)
}

function returnMapPointFromXYClick(x: number, y: number) {
  const rect = props.map._canvas.getBoundingClientRect()
  const mouseX = x - rect.left
  const mouseY = y - rect.top

  return { x: mouseX, y: mouseY }
}

const x = ref(0)
const y = ref(0)
let mouseOverCanvas = false

function update(event: MouseEvent) {
  x.value = event.pageX
  y.value = event.pageY
}

onMounted(() => window.addEventListener('mousemove', update))
onUnmounted(() => window.removeEventListener('mousemove', update))

let startPointMarker: Marker | null
let endPointMarker: Marker | null

watch([() => x.value, () => y.value], () => {
  if ($mapStore.isStartPointFromMapActive) {
    const XY = returnMapPointFromXYClick(x.value, y.value)
    XY.y -= 20
    const lngLat = props.map.unproject(XY as any)
    const mapBounds = props.map.getBounds()
    if (!mapBounds.contains(lngLat)) return
    startPointMarker?.setLngLat(lngLat)
  }
  if ($mapStore.isEndPointFromMapActive) {
    const XY = returnMapPointFromXYClick(x.value, y.value)
    XY.y -= 20
    const lngLat = props.map.unproject(XY as any)
    const mapBounds = props.map.getBounds()
    if (!mapBounds.contains(lngLat)) return
    endPointMarker?.setLngLat(lngLat)
  }
})

watch(
  () => $mapStore.isStartPointFromMapActive,
  (newVal) => {
    if (newVal) {
      reset()
      if (startPointMarker) {
        startPointMarker.remove()
        startPointMarker = null
      }
      const XY = returnMapPointFromXYClick(x.value, y.value)
      const lngLat = props.map.unproject(XY as any)
      const elStart = document.createElement('div')
      elStart.innerHTML = '<i class="icon-color icon-2x fi_map-pin fill-white"></i>'
      const newMarker = new Marker({ element: elStart })
      startPointMarker = newMarker
      startPointMarker._element.style.zIndex = '10000'
      startPointMarker.setLngLat(lngLat).addTo(props.map)
    } else {
      if (startPointMarker && !$mapStore.firstRoutingCoords) {
        startPointMarker.remove()
        startPointMarker = null
      }
    }
  },
)

watch(
  () => $mapStore.isEndPointFromMapActive,
  (newVal) => {
    if (newVal) {
      reset()
      if (endPointMarker) {
        endPointMarker.remove()
        endPointMarker = null
      }
      const XY = returnMapPointFromXYClick(x.value, y.value)
      const lngLat = props.map.unproject(XY as any)
      const elStart = document.createElement('div')
      elStart.innerHTML = '<i class="icon-color icon-2x fi_map-pin fill-silver"></i>'
      const newMarker = new Marker({ element: elStart })
      endPointMarker = newMarker
      endPointMarker._element.style.zIndex = '10000'
      endPointMarker.setLngLat(lngLat).addTo(props.map)
    } else {
      if (endPointMarker && !$mapStore.secondRoutingCoords) {
        endPointMarker.remove()
        endPointMarker = null
      }
    }
  },
)

watch(
  () => $mapStore.firstRoutingCoords,
  async (newVal) => {
    if ($mapStore.isStartPointFromMapActive) return
    if (newVal) {
      if (startPointMarker) {
        startPointMarker.setLngLat({
          lat: newVal.lat,
          lon: newVal.lon,
        })
      } else {
        const elStart = document.createElement('div')
        elStart.innerHTML = '<i class="icon-color icon-2x fi_map-pin filled-white"></i>'
        const newMarker = new Marker({ element: elStart })
        startPointMarker = newMarker
        startPointMarker
          .setLngLat({
            lat: newVal.lat,
            lon: newVal.lon,
          })
          .addTo(props.map)
      }
      const data = await $mapStore.getMapObject(newVal.lat, newVal.lon)
      $mapStore.isRouteAdressFromCtx = true
      $mapStore.firstRoutingAddress = data.address_raw || data.display_name
    } else {
      if (startPointMarker) startPointMarker.remove()
      startPointMarker = null
    }
  },
)
watch(
  () => $mapStore.secondRoutingCoords,
  async (newVal) => {
    if ($mapStore.isEndPointFromMapActive) return
    if (newVal) {
      if (endPointMarker) {
        endPointMarker.setLngLat({
          lat: newVal.lat,
          lon: newVal.lon,
        })
      } else {
        const elStart = document.createElement('div')
        elStart.innerHTML = '<i class="icon-color icon-2x fi_map-pin fill-silver"></i>'
        const newMarker = new Marker({ element: elStart })
        endPointMarker = newMarker
        endPointMarker
          .setLngLat({
            lat: newVal.lat,
            lon: newVal.lon,
          })
          .addTo(props.map)
      }
      const data = await $mapStore.getMapObject(newVal.lat, newVal.lon)
      $mapStore.isRouteAdressFromCtx = true
      $mapStore.secondRoutingAddress = data.address_raw || data.display_name
    } else {
      if (endPointMarker) endPointMarker.remove()
      endPointMarker = null
    }
  },
)

function fitPoints() {
  let bounds = new LngLatBounds()
  if (startPointMarker) bounds.extend(startPointMarker.getLngLat())
  if (endPointMarker) bounds.extend(endPointMarker.getLngLat())
  props.map.fitBounds(bounds, { padding: 250, linear: true, maxZoom: 18 })
}

watch(
  () => $mapStore.routingData,
  (newVal) => {
    console.log(newVal)
    // @ts-ignore
    if (newVal && newVal.trip) {
      // @ts-ignore
      const coords = decodeRoute(newVal.trip.legs[0].shape, 6)
      lineSrc = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: coords,
        },
      }
      // @ts-ignore
      props.map.getSource(lineScrName).setData(lineSrc)
      fitPoints()
    } else {
      reset()
    }
  },
)

function onMapMouseDown(e: MapMouseEvent) {
  const nodeUnderPointer = document.elementFromPoint(e.originalEvent.clientX, e.originalEvent.clientY)
  // Если мышь нажата над картой
  if (nodeUnderPointer && nodeUnderPointer.className == 'maplibregl-canvas') {
    const XY = returnMapPointFromXYClick(x.value, y.value)
    XY.y -= 20
    const lngLat = props.map.unproject(XY as any)

    if ($mapStore.isStartPointFromMapActive) {
      $mapStore.firstRoutingCoords = {
        lat: lngLat.lat,
        lon: lngLat.lng,
      }
      $mapStore.isStartPointFromMapActive = false
      $mapStore.getMapRoute()
      if (startPointMarker) startPointMarker._element.style.zIndex = '10'
    }
    if ($mapStore.isEndPointFromMapActive) {
      $mapStore.secondRoutingCoords = {
        lat: lngLat.lat,
        lon: lngLat.lng,
      }
      $mapStore.isEndPointFromMapActive = false
      $mapStore.getMapRoute()
      if (endPointMarker) endPointMarker._element.style.zIndex = '10'
    }
  }
}

function onMapMouseMove(e: MapMouseEvent) {
  mouseOverCanvas = true
  // console.log('onMapMouseMove', mouseOverCanvas, e)
}
function onMapMouseOut(e: MapMouseEvent) {
  mouseOverCanvas = false
  // console.log('onMapMouseOut', mouseOverCanvas, e)
}
</script>

<style scoped></style>
