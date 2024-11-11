<template>
  <div
    v-if="visible"
    id="mapCtxMenu"
    ref="mapCtxMenu"
    aria-labelledby="dropdownMenuButton"
    class="dropdown-menu show shadow mt-0 dropdown-menu-button"
  >
    <div v-if="error" class="my-0 mx-3 text-danger">Ошибка загрузки: {{ error }}</div>
    <div v-else-if="loading" class="my-0 mx-3">
      <BSpinner small></BSpinner>
      <span>Загрузка данных</span>
    </div>
    <template v-else-if="addressFromMap">
      <div v-if="Object.keys(currentRealtyObject).length && !currentRealtyObject.is_point" class="popup-container">
        <div class="popup-container_title p-2">
          {{ currentRealtyObject.name }}
        </div>
        <p class="popup-container_row-text popup-container_bordered p-2">
          {{ currentRealtyObject.address_raw }}
        </p>
        <button
          v-if="!$comparison.comparisonObjects.map((item: any) => item.id).includes(currentRealtyObject.id)"
          class="popup-container_add-to-calc btn p-2"
          @click="returnObject"
        >
          <i class="icon fi_compare me-2" /> Добавить объект к сравнению
        </button>
      </div>
      <div v-else-if="Object.keys(currentRealtyObject).length" class="popup-container">
        <div class="popup-container_title popup-container_bordered p-2">{{ lngLat.lat }}, {{ lngLat.lng }}</div>
        <button
          v-if="!$comparison.comparisonObjects.map((item: any) => item.id).includes(currentRealtyObject.id)"
          class="popup-container_add-to-calc btn p-2"
          @click="returnPoint"
        >
          <i class="icon fi_compare me-2" /> Добавить точку к сравнению
        </button>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { api_get_realty_objects_in_coords } from '~/app_constants/api'

const { $mapStore, $searchServer, $mapObjectDefaults, $comparison } = useNuxtApp()
const { map, addressFromMap } = defineProps({
  map: { type: Object, required: true },
  addressFromMap: { type: Boolean, required: false },
})
const emit = defineEmits(['returnObject', 'returnPoint'])

const visible = ref(false)
const point = ref({ x: 0, y: 0 })
const lngLat = ref({ lng: 0, lat: 0 })
const loading = ref(false)
const error = ref(false)
const advObjects = ref([])
const geoObjects = ref([])
const geoObjectsIn = ref([])
const geoObjectsFrom = ref([])
const pointRouteFrom = ref({})
const pointRouteTo = ref({})
const collapse_1 = ref(true)
const collapse_2 = ref(true)

const selectedMapObject = computed({
  get: () => $mapStore.selectedMapObject,
  set: (value) => $mapStore.setSelectedMapObject(value),
})
const ctxOSMObject = computed({
  get: () => $mapStore.ctxOSMObject,
  set: (value) => $mapStore.setCtxOSMObject(value),
})

const currentRealtyObject = computed({
  get: () => $mapStore.currentRealtyObject,
  set: (value) => $mapStore.setCurrentRealtyObject(value),
})

const mapCtxMenu = ref(null)
onMounted(() => {
  document.addEventListener('mousedown', onDocumentMouseDown)
})
onUnmounted(() => {
  document.removeEventListener('mousedown', onDocumentMouseDown)
})
onUpdated(() => {
  const ctxMenu: any = mapCtxMenu.value
  if (ctxMenu) {
    const ctxPoint = {
      x: point.value.x,
      y: point.value.y,
    }
    const container = map.getContainer()
    const containerRect = container.getBoundingClientRect()
    if (containerRect.right < containerRect.left + point.value.x + ctxMenu.offsetWidth) {
      ctxPoint.x = containerRect.right - containerRect.left - ctxMenu.offsetWidth - 5
    }
    if (containerRect.bottom < containerRect.top + point.value.y + ctxMenu.offsetHeight) {
      ctxPoint.y = containerRect.bottom - containerRect.top - ctxMenu.offsetHeight - 5
    }
    ctxMenu.style.left = ctxPoint.x + 'px'
    ctxMenu.style.top = ctxPoint.y + 'px'
  }
})

const onDocumentMouseDown = (event: MouseEvent) => {
  if (!(event.target as HTMLElement).closest('#mapCtxMenu')) {
    $mapStore.setCtxOSMObject({})
    visible.value = false
  }
}
const show = (event: any) => {
  point.value = event.point
  lngLat.value = event.lngLat
  error.value = false
  loading.value = true
  visible.value = true
  getObjects()
}
const close = () => {
  $mapStore.geometryToDraw = []
  visible.value = false
}
const pointOffset = (lngLat: any, offset: number) => {
  return {
    _sw: { lng: lngLat.lng - offset, lat: lngLat.lat - offset },
    _ne: { lng: lngLat.lng + offset, lat: lngLat.lat + offset },
  }
}
const boundsStr = (bounds: any) => {
  var res = []
  res.push(bounds._sw.lng)
  res.push(bounds._sw.lat)
  res.push(bounds._ne.lng)
  res.push(bounds._ne.lat)
  return res.join(',')
}
// Получение данных об объектах под указателем
const getObjects = async () => {
  let _geometryToDraw: Record<string, any>[] = []
  const paged = await $http
    .get(api_get_realty_objects_in_coords, {
      params: {
        lat: lngLat.value.lat,
        lon: lngLat.value.lng,
        radius: 25,
        limit: 10,
      },
    })
    .then((res: Record<string, any>) => {
      if (res._data.length) {
        currentRealtyObject.value = res._data[0]
        _geometryToDraw.push({
          id: currentRealtyObject.value.id,
          type: 'Feature',
          properties: { style: 'primary' },
          geometry: currentRealtyObject.value.geo_obj,
        })
      } else {
        currentRealtyObject.value = {}
        _geometryToDraw = []
      }
      return res._data
    })
    .catch((err: any) => {
      if (err.status === 400) {
        currentRealtyObject.value = {}
        _geometryToDraw = []
      } else error.value = err
    })
  if (!Object.keys(currentRealtyObject.value).length) {
    currentRealtyObject.value = await createObjFromPoint()
  }
  $mapStore.geometryToDraw = _geometryToDraw
  loading.value = false
  console.log(paged)
}

const getAddress = (objectAddress: any) => {}
const returnObject = () => {
  emit('returnObject', currentRealtyObject.value)
  close()
}
const returnPoint = () => {
  // emit('returnPoint', currentRealtyObject.value)
  $comparison.geoPos = {
    lat: lngLat.value.lat,
    lon: lngLat.value.lng,
    label: lngLat.value.lat + ', ' + lngLat.value.lng,
  }
  $comparison.isMapPointModalOn()
  close()
}
async function createObjFromPoint() {
  const cnObject = await $http
    .get(
      $searchServer +
        '/reverse.php?lat=' +
        lngLat.value.lat +
        '&lon=' +
        lngLat.value.lng +
        '&zoom=18&format=jsonv2&accept-language=ru&limit=10&polygon_geojson=1',
    )
    .then((res: Record<string, any>) => res._data)
    .catch((err: any) => {
      error.value = err
    })
  console.log(cnObject)
  return {
    geo_obj: cnObject.geojson.type === 'Polygon' ? cnObject.geojson : null,
    geo_pos: {
      type: 'Point',
      coordinates: [lngLat.value.lng, lngLat.value.lat],
    },
    name: lngLat.value.lng + ', ' + lngLat.value.lat,
    id: cnObject.osm_id,
    is_point: true,
  }
}
defineExpose({
  show,
})
</script>
