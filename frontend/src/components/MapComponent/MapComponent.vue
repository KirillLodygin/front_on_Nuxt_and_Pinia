<template>
  <div class="map-wrap" :key="key">
    <div ref="mapContainer" class="map"></div>
    <div class="maplibregl-ctrl-top-right mapboxgl-ctrl-top-right">
      <div
        v-if="!addressFromMap"
        class="maplibregl-ctrl maplibregl-ctrl-group mapboxgl-ctrl mapboxgl-ctrl-group dropdown"
        style="margin-top: 102px"
      >
        <!-- <button
          v-if="props.showLayersButton"
          id="showLayersBtn"
          :class="{ 'text-primary': showLayersPanel }"
          aria-expanded="false"
          aria-haspopup="true"
          aria-label="Отображение слоёв"
          data-bs-toggle="dropdown"
          title="Отображение слоёв"
          type="button"
          @click="showLayersPanel = !showLayersPanel"
        >
          <i class="fas fa-layer-group"></i>
        </button>
        <div
          v-if="showLayersPanel"
          aria-labelledby="showLayersBtn"
          class="dropdown-menu dropdown-menu-lg-end show px-3 py-2"
        >
          <div class="text-primary text-center text-uppercase mb-2" style="width: 270px">Отображение слоёв</div>
          <span v-if="!layersTree.tree_data.length" class="text-muted"> cлои не загружены </span>
          <KsTreeInput v-else ref="layersTreeInput" :input="layersTree" class="mb-1"> </KsTreeInput>
        </div> -->
      </div>
    </div>

    <slot :map="map" :mapInit="mapInit"></slot>
    <SearchAddressLayer
      v-if="map"
      :map="map"
      :map-mode="'free'"
      :map-store="$mapStoreInUse"
      @variantClick="showCtxMenu"
    />
    <GeoLayer
      v-for="layerId in $mapStoreInUse.visibleLayersId"
      :key="layerId"
      :map="map"
      :bounds="bounds"
      :layer-item="$mapStoreInUse.layersTreeItem(layerId)"
    />
    <GeometryLayer :map="map" :geometry="$mapStoreInUse.geometryToDraw" :emphasis="$mapStoreInUse.geometryEmphasis" />
    <MapMeasureLayer :map="map" :mapInit="mapInit" />
    <MapCtxMenu
      v-if="Object.keys(map).length && props.ctxMenuMode === 'default'"
      ref="ctxMenu"
      :addressFromMap="addressFromMap"
      :map="map"
      :only-buildings="onlyBuildings"
      :map-store="$mapStoreInUse"
      class="border"
      @return-address="
        (lngLat: any, address: string, osm_id: number, geo_json: Geometry) => {
          emit('returnAddress', lngLat, address, osm_id, geo_json)
        }
      "
      @return-to-card="emit('returnToCard')"
    />
    <WorkWithMapCtxMenu
      v-else-if="Object.keys(map).length && props.ctxMenuMode === 'workWithMap'"
      ref="workWithMapCtxMenu"
      :map="map"
      :map-store="$mapStoreInUse"
      :semi-transparent="true"
    />
    <CompareMapCtxMenu
      v-else-if="Object.keys(map).length && props.ctxMenuMode === COMPARE && !$mapStore.addObjectToComparisonFullscreen"
      ref="ctxMenuCompare"
      :addressFromMap="addressFromMap"
      :map="map"
      class="border"
      @return-object="(obj: Record<string, any>) => emit('returnObject', obj)"
      @return-point="(obj: Record<string, any>) => emit('returnPoint', obj)"
    />
    <Teleport v-if="$mapStore.addObjectToComparisonFullscreen" to=".map">
      <CompareMapCtxMenu
        v-if="Object.keys(map).length && props.ctxMenuMode === COMPARE"
        ref="ctxMenuCompare"
        :addressFromMap="addressFromMap"
        :map="map"
        class="border"
        @return-object="(obj: Record<string, any>) => emit('returnObject', obj)"
        @return-point="(obj: Record<string, any>) => emit('returnPoint', obj)"
      />
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import type { LngLatLike, Map, Marker, NavigationControl, FullscreenControl } from 'maplibre-gl'
import type { Geometry } from 'geojson'
import maplibre from 'maplibre-gl'
import { isEmpty } from 'lodash'
import { extendBounds, nmbox2mlbox } from '~/components/MapComponent/Common'
import { COMPARE } from '~/app_constants/comparisonConsts'
import MapCtxMenu from '~/components/MapComponent/MapCtxMenu.vue'
import CompareMapCtxMenu from '../GeoObject/compare/CompareMapCtxMenu.vue'
import WorkWithMapCtxMenu from '~/components/MapComponent/WorkWithMapCtxMenu.vue'
import SearchAddressLayer from '~/components/MapComponent/SearchAddressLayer.vue'
import GeoLayer from '~/components/MapComponent/GeoLayer.vue'
import MapMeasureLayer from '~/components/MapComponent/MapMeasureLayer.vue'
import GeometryLayer from '~/components/MapComponent/GeometryLayer.vue'

const { $tileServer, $mapStore } = useNuxtApp()

const props = defineProps({
  express: { type: Boolean, required: true },
  isAnalogMapModal: { type: Boolean, required: true },
  addressFromMap: { type: Boolean, required: true },
  layersTree: { type: Object, required: true },
  // Отображить кнопку со списком слоёв
  // showLayersButton: { type: Boolean, default: false },
  // Отображить кнопку расширения область просмотра
  showFullscreenButton: { type: Boolean, default: false },
  // Отображить кнопки масштаба
  showNavigationButtons: { type: Boolean, default: true },
  // Отображить ли контекстное меню
  showCtxMenu: { type: Boolean, default: true },
  // Обработчик fullscreenstart
  onFullScreenStart: { type: Function, required: false },
  // Обработчик fullscreenend
  onFullScreenEnd: { type: Function, required: false },
  // Вид контекстного меню
  ctxMenuMode: { type: String, required: false, default: 'default' },
  // Фильтрация контекстного меню по зданиям
  onlyBuildings: { type: Boolean, default: false },
  mapStore: { type: Object, default: {} },
  dbClickZoom: { type: Boolean, default: true },
})

const $mapStoreInUse = Object.keys(props.mapStore).length ? props.mapStore : $mapStore
console.log($mapStoreInUse, 'map')
interface CtxMenu {
  show: (options?: { point?: any; lngLat?: any }) => void
}

interface CustomMouseEvent extends MouseEvent {
  point?: any
  lngLat?: any
}

const emit = defineEmits(['returnAddress', 'returnToCard', 'mapLoaded', 'returnObject', 'returnPoint'])
const measure = ref(null)
const showLayersPanel = ref(false)
const marker = ref<Marker | any>(null)
const markerFrom = ref(null)
const markerTo = ref(null)
const bounds = ref<Record<string, any> | undefined>({})
const searchBounds = ref(null)
const searchCenter = ref(null)

const mapContainer = ref('')
const map = ref<Map | any>({})
const mapInit = ref(false)
const initialState = {
  lng: 37.631896283501646,
  lat: 55.751382599017376,
  zoom: 12.5,
  url: $tileServer,
}

const ctxMenu = ref<CtxMenu | null>(null)
const ctxMenuCompare = ref<CtxMenu | null>(null)
const workWithMapCtxMenu = ref<CtxMenu | null>(null)
let navigationControl: NavigationControl
let fullscreenControl: FullscreenControl

onMounted(() => {
  createMap()
})

onUnmounted(() => {
  map.value?.remove()
})

watch(
  () => $mapStoreInUse.mapMode,
  (mode: string) => {
    if (mode === 'frameCircle' || mode === 'frameRect' || mode === 'measure')
      map.value.canvas.style.cursor = 'crosshair'
    else map.value.canvas.style.cursor = null
  },
)
watch(
  () => $mapStoreInUse.goToAddress,
  (address: any) => {
    if (map.value && address.boundingbox) {
      map.value.fitBounds(nmbox2mlbox(address.boundingbox), { padding: 50, linear: true, maxZoom: 18 })
    }
    $mapStoreInUse.selectedOSMObject = null
    nextTick(() => {
      $mapStoreInUse.selectedOSMObject = address
    })
  },
)
watch(
  () => $mapStoreInUse.saVariants,
  () => {
    console.log('$mapStore.saVariants ' + $mapStoreInUse.saVariants.length, $mapStoreInUse)
    scaleMapToVariants()
  },
)
watch(
  () => $mapStoreInUse.saAutoScale,
  () => {
    scaleMapToVariants()
  },
)
watch(
  () => props.showFullscreenButton,
  () => {
    updateControls()
  },
)
watch(
  () => props.showNavigationButtons,
  () => updateControls,
)

const updateControls = () => {
  if (mapInit.value) {
    if (fullscreenControl) {
      map.value.removeControl(fullscreenControl)
    }
    if (navigationControl) {
      map.value.removeControl(navigationControl)
    }

    if (props.showFullscreenButton) {
      fullscreenControl = new maplibre.FullscreenControl()
      if (props.onFullScreenStart) {
        fullscreenControl.on('fullscreenstart', () => {
          props.onFullScreenStart!()
        })
      }
      if (props.onFullScreenEnd) {
        fullscreenControl.on('fullscreenend', () => {
          props.onFullScreenEnd!()
        })
      }
      map.value.addControl(fullscreenControl, 'top-right')
    }
    if (props.showNavigationButtons) {
      navigationControl = new maplibre.NavigationControl()
      map.value.addControl(navigationControl, 'top-right')
    }
  }
}

const createMap = () => {
  const mapCenterOb = JSON.parse(localStorage.getItem('mapCenter') || '{}')
  let mapCenter: LngLatLike = [55.7515, 37.6241]
  if (!isEmpty(mapCenterOb) && !props.express) {
    mapCenter = [mapCenterOb.lng, mapCenterOb.lat]
  } else {
    mapCenter = [initialState.lng, initialState.lat]
  }
  const mapZoom = props.express || props.isAnalogMapModal ? initialState.zoom : Number(localStorage.getItem('mapZoom'))
  map.value = new maplibre.Map({
    container: mapContainer.value,
    attributionControl: false,
    style: {
      version: 8,
      sources: {
        'raster-tiles': {
          type: 'raster',
          tiles: [initialState.url + 'tile/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: 'OSM',
        },
      },
      layers: [
        {
          id: 'simple-tiles',
          type: 'raster',
          source: 'raster-tiles',
          minzoom: 0,
          maxzoom: 20,
        },
      ],
      glyphs: 'https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=HsPRi5lpWLL34EGEoiEj',
    },
    center: mapCenter,
    zoom: mapZoom,
    maxZoom: 18,
    preserveDrawingBuffer: true,
    doubleClickZoom: props.dbClickZoom,
  })
  map.value.on('load', onMapLoad)
}
const key = ref(0)

const onMapLoad = () => {
  map.value.popup = new maplibre.Popup({
    closeButton: true,
    closeOnClick: false,
    maxWidth: 'none',
  })

  map.value.boxZoom.disable()

  map.value.canvas = map.value.getCanvasContainer()
  map.value.on('contextmenu', onContextMenu)
  map.value.on('moveend', onMoveEnd)
  // map.value.resize()
  bounds.value = map.value.getBounds()
  searchBounds.value = map.value.getBounds()
  mapInit.value = true
  updateControls()
  props.mapStore.saVariants = []
  map.value.resize()
  emit('mapLoaded')
}

const scaleMapToVariants = () => {
  if ($mapStoreInUse.saAutoScale) {
    if ($mapStoreInUse.saVariants.length === 1) {
      const address = $mapStoreInUse.saVariants[0]
      map.value.fitBounds(nmbox2mlbox(address.boundingbox), { padding: 50, linear: true, maxZoom: 16 })
    } else if ($mapStoreInUse.saVariants.length > 1) {
      let boundingbox = $mapStoreInUse.saVariants[0].boundingbox
      for (let i = 1; i < $mapStoreInUse.saVariants.length; i++) {
        boundingbox = extendBounds(boundingbox, $mapStoreInUse.saVariants[i].boundingbox)
      }
      map.value.fitBounds(nmbox2mlbox(boundingbox), { padding: 50, linear: true, maxZoom: 16 })
    }
  }
}

const setMarker = (longLat: any) => {
  map.value.setCenter([longLat.lng, longLat.lat])
  if (marker.value) {
    marker.value.setLngLat([longLat.lng, longLat.lat])
  } else {
    marker.value = new maplibre.Marker()
      .setLngLat([longLat.lng, longLat.lat])
      .setPopup(new maplibre.Popup().setText('Центр поиска'))
      .addTo(map.value)
  }

  bounds.value = map.value.getBounds()
  searchBounds.value = map.value.getBounds()
}

const onContextMenu = (e: CustomMouseEvent) => {
  e.preventDefault()
  console.log('oncontextmenu')
  if (props.showCtxMenu) {
    if (props.ctxMenuMode === 'default') {
      ctxMenu.value?.show({ point: e.point, lngLat: e.lngLat })
    } else if (props.ctxMenuMode === 'workWithMap') {
      workWithMapCtxMenu.value?.show({ point: e.point, lngLat: e.lngLat })
    } else if (props.ctxMenuMode === COMPARE) {
      ctxMenuCompare.value?.show({ point: e.point, lngLat: e.lngLat })
    }
  }
}

const showCtxMenu = () => {
  if (props.ctxMenuMode === 'default') {
    ctxMenu.value?.show()
  } else if (props.ctxMenuMode === 'workWithMap') {
    workWithMapCtxMenu.value?.show()
  } else {
    ctxMenuCompare.value?.show()
  }
}

// Событие по окончанию перемещения карты
const onMoveEnd = () => {
  // Обновляем объекты из слоёв, которые попадают в область видимости
  bounds.value = map.value.getBounds()
  searchBounds.value = map.value.getBounds()
  localStorage.setItem('mapBounds', JSON.stringify(bounds.value))
  localStorage.setItem('mapCenter', JSON.stringify(map.value.getCenter()))
  localStorage.setItem('mapZoom', JSON.stringify(map.value.getZoom()))
}

defineExpose({
  setMarker,
  map,
  mapInit,
})
</script>
