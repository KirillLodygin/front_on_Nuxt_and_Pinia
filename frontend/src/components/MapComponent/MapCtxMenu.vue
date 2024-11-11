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
      <BSpinner small class="me-1"></BSpinner>
      <span>Загрузка данных</span>
    </div>

    <template v-else-if="addressFromMap">
      <template v-if="onlyBuildings">
        <template v-if="ctxOSMObject">
          <div v-if="buildingNotFound" class="p-2">В выбранной Вами точке здание не найдено</div>
          <template v-else-if="Object.keys(duplicateRealtyObject).length">
            <div class="p-2">В выбранной Вами точке уже создан объект-недвижимости</div>
            <a class="dropdown-item" href="#" @click.prevent="navigateToRealtyObject()"> Перейти к объекту </a>
          </template>

          <template v-else>
            <div v-if="ctxOSMObject.address" class="my-1 mx-3 text-primary text-uppercase">
              {{ ctxOSMObject.shortAddress }}
            </div>
            <div class="my-1 mx-3" @click="collapse_1 = !collapse_1">
              <i v-if="collapse_1" class="icon fi_chevron-down box-lg when-open me-1"></i>
              <i v-else class="icon fi_chevron-right box-lg when-closed me-1"></i>
              <i class="icon icon-lg ksi_osm me-1"></i>
              Объекты OpenStreetMap
            </div>
            <BCollapse id="collapse-1" v-model="collapse_1" class="my-1" visible>
              <div class="mx-3">
                <span class="ms-4 d-inline-block text-truncate" style="max-width: 340px">
                  <i :class="'icon icon-lg me-1 ' + ctxOSMObject.icon"></i> {{ ctxOSMObject.title }}
                </span>
              </div>
            </BCollapse>
            <template v-if="duplicateRealtyObjectArr.length">
              <div class="my-1 mx-3" @click="collapse_2 = !collapse_2">
                <i v-if="collapse_2" class="icon fi_chevron-down box-lg when-open me-1"></i>
                <i v-else class="icon fi_chevron-right box-lg when-closed me-1"></i>
                <i class="fas fa-ad"></i> Оъекты-недвижимости типа помещение
              </div>
              <BCollapse visible id="collapse-2" class="my-1" v-model="collapse_2">
                <template v-for="object in duplicateRealtyObjectArr" :key="object.id">
                  <div class="w-100 dropdown-item" @click.prevent="navigateQuarterRealtyObject(object.id)">
                    <span class="ms-4"> Объект #{{ object.id }}</span>
                  </div>
                </template>
              </BCollapse>
            </template>
          </template>
        </template>

        <template v-if="ctxOSMObject && !buildingNotFound && !Object.keys(duplicateRealtyObject).length">
          <li><hr class="dropdown-divider" /></li>
          <a class="dropdown-item" href="#" @click.prevent="getAddress(ctxOSMObject)">
            <i class="icon icon-lg fi_map-pin-checked me-1"></i> Выбрать для адреса
          </a>
          <a class="dropdown-item" href="#" @click.prevent="returnToObject()">
            <i class="icon icon-lg fi_arrow-left me-1"></i> Вернуться к карточке объекта
          </a>
        </template>
      </template>
      <template v-else>
        <template v-if="ctxOSMObject">
          <div v-if="ctxOSMObject.address" class="my-1 mx-3 text-primary text-uppercase">
            {{ ctxOSMObject.shortAddress }}
          </div>
          <div class="my-1 mx-3" @click="collapse_1 = !collapse_1">
            <i v-if="collapse_1" class="icon fi_chevron-down box-lg when-open me-1"></i>
            <i v-else class="icon fi_chevron-right box-lg when-closed me-1"></i>
            <i class="icon icon-lg ksi_osm me-1"></i>
            Объекты OpenStreetMap
          </div>
          <BCollapse id="collapse-1" v-model="collapse_1" class="my-1" visible>
            <div class="mx-3">
              <span class="ms-4 d-inline-block text-truncate" style="max-width: 340px">
                <i :class="'icon icon-lg me-1 ' + ctxOSMObject.icon"></i> {{ ctxOSMObject.title }}
              </span>
            </div>
          </BCollapse>
        </template>

        <template v-if="ctxOSMObject">
          <li><hr class="dropdown-divider" /></li>
          <a class="dropdown-item" href="#" @click.prevent="getAddress(ctxOSMObject)">
            <i class="icon icon-lg fi_map-pin-checked me-1"></i> Выбрать для адреса
          </a>
          <a class="dropdown-item" href="#" @click.prevent="returnToObject()">
            <i class="icon icon-lg fi_arrow-left me-1"></i> Вернуться к карточке объекта
          </a>
        </template>
      </template>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { api_realty_objects } from '~/app_constants/api'
import { isOsmBuilding, realtyObjectBuildingCategories } from '~/app_constants/geoInfoLists'
import { navigateString } from '~/app_constants/objectsTable'
import type { objectDataType } from '~/types/geoObjectTypes'

const { $mapStore, $searchServer, $mapObjectDefaults, $geoObject }: any = useNuxtApp()
const { map, addressFromMap, onlyBuildings, mapStore } = defineProps({
  map: { type: Object, required: true },
  addressFromMap: { type: Boolean, required: false },
  onlyBuildings: { type: Boolean, default: false },
  mapStore: { type: Object, default: {} },
})
const $mapStoreInUse = Object.keys(mapStore).length ? mapStore : $mapStore
const emit = defineEmits(['returnAddress', 'returnToCard'])

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
const buildingNotFound = ref(false)
const duplicateRealtyObject: Ref<Record<string, any>> = ref({})
const duplicateRealtyObjectArr: Ref<Record<string, any>[]> = ref([])

const selectedMapObject = computed({
  get: () => $mapStore.selectedMapObject,
  set: (value) => $mapStore.setSelectedMapObject(value),
})
const ctxOSMObject: Ref<Record<string, any>> = ref({})
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
    ctxOSMObject.value = {}
    visible.value = false
    mapStore.geometryToDraw = []
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
  visible.value = false
  mapStore.geometryToDraw = []
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
  duplicateRealtyObject.value = {}
  duplicateRealtyObjectArr.value = []
  
  // -- Объект OpenStreetMap по API Nomination
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

  buildingNotFound.value = !isOsmBuilding(cnObject)

  if (!onlyBuildings || (onlyBuildings && !buildingNotFound.value)) {
    $mapStoreInUse.geometryToDraw = [{
      id: cnObject.osm_id,
      type: 'Feature',
      properties: { style: 'purple' },
      geometry: cnObject.geojson,  
    }]
  }

  if (!buildingNotFound.value) {
    if ($geoObject.objectData.object_type === 'B') {
      const { _data } = await $http.get(api_realty_objects, {
        params: { osm_id: cnObject.osm_id, object_type: $geoObject.objectData.object_type, limit: 1, page: 1 },
      })
      if (_data.results.length) {
        duplicateRealtyObject.value = _data.results[0]
      }
    } else {
      const { _data } = await $http.get(api_realty_objects, {
        params: { osm_id: cnObject.osm_id, object_type: $geoObject.objectData.object_type },
      })
      if (_data.results.length) {
        duplicateRealtyObjectArr.value = _data.results
      }
    }
  }

  $mapObjectDefaults(cnObject)
  // -- Объекты слоёв с объявлениями
  // Коэффициент расширения области поиска объектов, в зависимости от масштаба (масштаб 18 - максимальный)
  const factor = 1 + 18 - map.getZoom()
  const bounds = pointOffset(lngLat.value, factor * 0.00005)
  const paged = await $http
    .get('api/v1/realty/all/?layer_type=A&in_bbox=' + boundsStr(bounds))
    .then((res: Record<string, any>) => res._data)
    .catch((err: any) => {
      error.value = err
    })

  if (!error.value && paged && paged.results) {
    ctxOSMObject.value = cnObject
    advObjects.value = paged.results
  }
  loading.value = false
}

const search = (searchMode: number) => {
  if (
    searchMode === 0 ||
    (searchMode === 4 &&
      geoObjectsIn.value &&
      geoObjectsIn.value.length > 0 &&
      geoObjects.value &&
      geoObjects.value.length > 0 &&
      geoObjectsIn.value[0]['id'] === geoObjects.value[0]['id']) ||
    searchMode === 6 ||
    searchMode === 8
  ) {
    geoObjectsIn.value = []
  }

  if (searchMode === 1) {
    geoObjectsIn.value = geoObjects.value
  }

  if (searchMode === 2) {
    geoObjectsFrom.value = geoObjects.value
  }

  if (
    searchMode === 3 ||
    (searchMode === 4 &&
      geoObjectsFrom.value &&
      geoObjectsFrom.value.length > 0 &&
      geoObjects &&
      geoObjects.value.length > 0 &&
      geoObjectsFrom.value[0]['id'] === geoObjects.value[0]['id']) ||
    searchMode === 6 ||
    searchMode === 8
  ) {
    geoObjectsFrom.value = []
  }

  visible.value = false
}

const getAddress = (objectAddress: any) => {
  console.log(objectAddress)
  const address =
    objectAddress.address.city === objectAddress.address.state
      ? 'г. ' + objectAddress.address.city + ', ' + objectAddress.shortAddress
      : objectAddress.shortName

  emit('returnAddress',
    { lngLat: { lat: lngLat.value.lat, lng: lngLat.value.lng } },
    address,
    objectAddress.osm_id,
    objectAddress.geojson,
  )
}

const returnToObject = () => {  
  emit('returnToCard')
}

const navigateToRealtyObject = () => {
  if (Object.keys(duplicateRealtyObject.value).length) {
    navigateTo({ path: navigateString.real_estate + duplicateRealtyObject.value.id, hash: '#Стандартные поля' })
  }
}

const navigateQuarterRealtyObject = (id: number) => {
  navigateTo(
    { path: navigateString.real_estate + id, hash: '#Стандартные поля' },
    {
      external: true,
      open: {
        target: '_blank',
      },
    },
  )
}

defineExpose({
  show,
})
</script>
