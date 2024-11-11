<script setup lang="ts">
import { onMounted, watch, computed } from 'vue'
import maplibregl, { type Map, MapMouseEvent, Marker } from 'maplibre-gl'
import type { IsochroneDataType } from '~/types/valhallaResponseTypes'
import { useNuxtApp } from '#app'
import type { locationPointType } from '~/types/treeTypes'

const props = defineProps({
  map: { type: Object as PropType<Map>, required: true },
  mapInit: { type: Boolean, required: true },
})

const { $mapStore } = useNuxtApp()

const isochroneData = computed(() => $mapStore.isochroneData as IsochroneDataType)
const isochroneObjectsData = computed(() => $mapStore.isochroneObjectsData)
const isochronePointCoords = computed(() => $mapStore.isochronePointCoords as locationPointType)
const isIsochronePointFromMapActive = computed(() => $mapStore.isIsochronePointFromMapActive)
let aimMarker: Marker | null
const x = ref(0)
const y = ref(0)

onMounted(() => {
  window.addEventListener('mousemove', update)
  addIsochroneLayer()
  addIsochroneObjectsLayer()
  fitToIsochroneBounds()
  addIsochronePoint()
  flyToIsochronePoint()

  // Следим за изменениями в geoJson и обновляем данные источника
  watch(
    () => isochroneData.value,
    (newData) => {
      if (newData) {
        updateIsochroneLayer(newData)
        addIsochroneObjectsLayer()
        fitToIsochroneBounds()
      } else {
        removeIsochroneLayer()
      }
    },
  )
  watch(
    () => isochronePointCoords.value,
    (newPoint) => {
      if (newPoint) {
        updateIsochronePoint(newPoint)
        flyToIsochronePoint()
      } else {
        removeIsochronePoint()
      }
    },
  )
  watch(
    () => props.mapInit,
    () => {
      if (props.mapInit) {
        props.map.on('mousedown', onMapMouseDown)
      }
    },
  )

  watch(isIsochronePointFromMapActive, (newVal) => {
    if (newVal) {
      removeIsochronePoint()
      const XY = returnMapPointFromXYClick(x.value, y.value)
      const lngLat = props.map.unproject(XY as any)
      const elStart = document.createElement('div')
      elStart.innerHTML = '<i class="icon-color icon-2x fi_map-pin fill-white"></i>'
      const newMarker = new Marker({ element: elStart })
      aimMarker = newMarker
      if (aimMarker?.getElement()) {
        aimMarker.getElement().style.zIndex = '10000'
      }
      aimMarker.setLngLat(lngLat).addTo(props.map)
    }
  })

  watch([() => x.value, () => y.value], () => {
    if ($mapStore.isIsochronePointFromMapActive) {
      const XY = returnMapPointFromXYClick(x.value, y.value)
      XY.y -= 20
      const lngLat = props.map.unproject(XY as any)
      const mapBounds = props.map.getBounds()
      if (!mapBounds.contains(lngLat)) return
      updateIsochronePoint({
        lat: lngLat.lat,
        lon: lngLat.lng,
      })
    }
  })
})

async function onMapMouseDown(e: MapMouseEvent) {
  const nodeUnderPointer = document.elementFromPoint(e.originalEvent.clientX, e.originalEvent.clientY)
  if (nodeUnderPointer && nodeUnderPointer.className == 'maplibregl-canvas') {
    const XY = returnMapPointFromXYClick(x.value, y.value)
    XY.y -= 20
    const lngLat = props.map.unproject(XY as any)

    if ($mapStore.isIsochronePointFromMapActive) {
      $mapStore.isochronePointCoords = {
        lat: lngLat.lat,
        lon: lngLat.lng,
      }
      $mapStore.isIsochronePointFromMapActive = false
      if (aimMarker) aimMarker._element.style.zIndex = '10'
      const data = await $mapStore.getMapObject(lngLat.lat, lngLat.lng)
      $mapStore.isIsochroneAddressFromCtx = true
      $mapStore.isochronePointAddress = data.address_raw || data.display_name
    }
  }
}

onUnmounted(() => {
  window.removeEventListener('mousemove', update)
  removeIsochroneLayer()
  removeIsochronePoint()
})

function update(event: MouseEvent) {
  x.value = event.pageX
  y.value = event.pageY
}

function returnMapPointFromXYClick(x: number, y: number) {
  const rect = props.map._canvas.getBoundingClientRect()
  const mouseX = x - rect.left
  const mouseY = y - rect.top

  return { x: mouseX, y: mouseY }
}

function addIsochroneLayer() {
  if (props.mapInit && !props.map.getSource('isochrone') && isochroneData.value) {
    props.map.addSource('isochrone', {
      type: 'geojson',
      data: isochroneData.value,
    })

    // Добавляем слой для отображения полигона
    props.map.addLayer({
      id: 'isochrone-layer',
      type: 'fill',
      source: 'isochrone',
      layout: {},
      paint: {
        'fill-color': isochroneData.value.features[0].properties.fillColor,
        'fill-opacity': isochroneData.value.features[0].properties['fill-opacity'],
      },
    })

    // Добавляем границу для полигона
    props.map.addLayer({
      id: 'isochrone-outline',
      type: 'line',
      source: 'isochrone',
      layout: {},
      paint: {
        'line-color': isochroneData.value.features[0].properties.color,
        'line-width': 2,
      },
    })
  }
}

function updateIsochroneLayer(newData: IsochroneDataType) {
  if (props.map.getSource('isochrone')) {
    ;(props.map.getSource('isochrone') as maplibregl.GeoJSONSource).setData(newData)
  } else {
    addIsochroneLayer()
  }
}

function removeIsochroneLayer() {
  removeIsochroneObjectLayers()
  if (props.map.getLayer('isochrone-layer')) {
    props.map.removeLayer('isochrone-layer')
  }
  if (props.map.getLayer('isochrone-outline')) {
    props.map.removeLayer('isochrone-outline')
  }
  if (props.map.getSource('isochrone')) {
    props.map.removeSource('isochrone')
  }
}

function addIsochronePoint() {
  removeIsochronePoint()
  if (isochronePointCoords.value) {
    const el = document.createElement('div')
    el.innerHTML = '<i class="icon-color icon-2x fi_map-pin fill-white"></i>'

    aimMarker = new maplibregl.Marker({ element: el })
      .setLngLat([isochronePointCoords.value.lon, isochronePointCoords.value.lat])
      .addTo(props.map)
  }
}

function updateIsochronePoint(coords: locationPointType) {
  if (aimMarker) {
    aimMarker.setLngLat([coords.lon, coords.lat])
  } else {
    addIsochronePoint()
  }
}

function removeIsochronePoint() {
  if (aimMarker) {
    aimMarker.remove()
    aimMarker = null
  }
}

function flyToIsochronePoint() {
  const coords = isochronePointCoords.value
  if (coords) {
    props.map.flyTo({
      center: [coords.lon, coords.lat],
      zoom: 18,
      speed: 1.5,
      curve: 1,
    })
  }
}

function fitToIsochroneBounds() {
  const data = isochroneData.value
  if (data && data.features.length > 0) {
    const bounds = new maplibregl.LngLatBounds()

    data.features.forEach((feature) => {
      const coordinates = feature.geometry.coordinates[0]
      coordinates.forEach((coord) => {
        bounds.extend([coord[0], coord[1]])
      })
    })

    props.map.fitBounds(bounds, {
      padding: 20,
      maxZoom: 18,
    })
  }
}

function addIsochroneObjectsLayer() {
  removeIsochroneObjectLayers()
  if (isochroneObjectsData.value && Object.keys(isochroneObjectsData.value).length) {
    isochroneObjectsData.value.forEach((isochroneObject) => {
      isochroneObject['osm_objects'].forEach((obj: Record<string, any>) => {
        const layerId = `isochrone-object-point-layer-${obj['id']}`
        const sourceId = `isochrone-object-point-${obj['id']}`

        props.map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Point',
                  coordinates: [obj['geo_pos']['coordinates'][0], obj['geo_pos']['coordinates'][1]],
                },
              },
            ],
          },
        })

        props.map.addLayer({
          id: layerId,
          type: 'circle',
          source: sourceId,
          paint: {
            'circle-radius': 2,
            'circle-color': isochroneObject['color'],
            'circle-stroke-color': isochroneObject['color'],
            'circle-stroke-width': 2,
          },
        })
      })
    })
  }
}

function removeIsochroneObjectLayers() {
  const layerPrefix = 'isochrone-object-point-layer-'
  const sourcePrefix = 'isochrone-object-point-'

  props.mapInit &&
    props.map.getStyle().layers?.forEach((layer) => {
      if (layer.id.startsWith(layerPrefix)) {
        props.map.removeLayer(layer.id)
      }
    })

  props.mapInit &&
    Object.keys(props.map.getStyle().sources).forEach((sourceId) => {
      if (sourceId.startsWith(sourcePrefix)) {
        props.map.removeSource(sourceId)
      }
    })
}
</script>
