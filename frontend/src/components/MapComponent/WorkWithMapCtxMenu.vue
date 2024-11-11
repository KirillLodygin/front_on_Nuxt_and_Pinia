<template>
  <div
    v-if="visible"
    id="mapCtxMenu"
    ref="mapCtxMenu"
    aria-labelledby="dropdownMenuButton"
    :class="[
      'dropdown-menu show shadow mt-0 dropdown-menu-button',
      { 'dropdown-semi-transparent': props.semiTransparent },
    ]"
  >
    <div v-if="loading" class="my-0 mx-3">
      <BSpinner small class="me-1"></BSpinner>
      <span>Загрузка данных</span>
    </div>
    <template v-else>
      <!-- Подменю объектов OSM -->
      <div v-if="errorOSM" class="my-0 mx-3 text-danger">
        <i class="icon icon-lg fi_alert-triangle me-1 bg-cur-color"></i>
        Ошибка обращения к серверу
      </div>
      <template v-else-if="ctxOSMObject">
        <div v-if="ctxOSMObject.address" class="my-1 mx-3 text-primary text-uppercase">
          {{ ctxOSMObject.shortAddress }}
        </div>
        <div class="my-1 mx-3 cursor-pointer" @click="collapse_1 = !collapse_1">
          <i v-if="collapse_1" class="icon fi_chevron-down box-lg when-open me-1"></i>
          <i v-else class="icon fi_chevron-right box-lg when-closed me-1"></i>
          <i class="icon icon-lg ksi_osm me-1"></i>
          Объекты на карте
          <span
            class="badge rounded-pill text-dark position-relative"
            style="background: rgba(200, 100, 240, 0.4); border: 1px solid rgba(200, 100, 240, 1); top: -2px"
            >1</span
          >
        </div>
        <BCollapse id="collapse-1" v-model="collapse_1" class="my-1" visible @mouseleave="leaveObjects()">
          <a
            class="dropdown-item"
            href="#"
            @click.prevent="showOSMInfo(ctxOSMObject)"
            @mouseenter="focusObject(ctxOSMObject.osm_id)"
          >
            <span class="d-inline-block text-truncate" style="max-width: 340px; margin-left: 50px">
              <i :class="'icon icon-lg me-1 ' + ctxOSMObject.icon"></i> {{ ctxOSMObject.title }}
            </span>
          </a>
        </BCollapse>
      </template>

      <!-- Подменю объектов Гисанды -->
      <div v-if="errorGs" class="my-0 mx-3 text-danger">
        <i class="icon icon-lg fi_alert-triangle me-1 bg-cur-color"></i> Ошибка загрузки ОН
      </div>
      <temlate v-else>
        <div class="my-1 mx-3 cursor-pointer" @click="collapse_2 = !collapse_2">
          <i v-if="collapse_2" class="icon fi_chevron-down box-lg when-open me-1"></i>
          <i v-else class="icon fi_chevron-right box-lg when-closed me-1"></i>
          <i class="icon icon-lg fi_database me-1"></i>
          Объекты недвижимости
          <span
            v-if="ctxGsObjects.length"
            class="badge rounded-pill text-dark position-relative"
            style="background: rgba(var(--primary-rgb), 0.4); border: 1px solid var(--primary); top: -2px"
            >{{ ctxGsObjects.length }}</span
          >
        </div>
        <BCollapse id="collapse-2" v-model="collapse_2" class="my-1" visible @mouseleave="leaveObjects()">
          <a
            v-for="gsObject in ctxGsObjects"
            class="dropdown-item"
            href="#"
            @click.prevent="goToObject(gsObject)"
            @mouseenter="focusObject(gsObject.id)"
          >
            <span class="d-inline-block text-truncate" style="max-width: 340px; margin-left: 50px" :title="gsObject.name || gsObject.id">
              <i :class="'icon icon-lg me-1 ' + getGsObjectIcon(gsObject)"></i> {{ gsObject.name || gsObject.id }}
            </span>
          </a>
          <a
            :class="['dropdown-item', { disabled: !ctxOSMObject || ctxGsObjects.length }]"
            href="#"
            @click.prevent="addObject()"
          >
            <span class="ms-4"
              ><i class="icon box-lg fi_plus-circle me-1"></i> Добавить объект недвижимости (здание)</span
            >
          </a>
        </BCollapse>
      </temlate>
    </template>

    <li><hr class="dropdown-divider" /></li>

    <!-- Подменю минисервисов карты -->
    <a class="dropdown-item" href="#" @click.prevent="routeToPoint()">
      <i class="icon icon-lg ksi_route me-1"></i> Маршрут сюда
    </a>
    <a class="dropdown-item" href="#" @click.prevent="routeFromPoint()">
      <i class="icon icon-lg ksi_route me-1"></i> Маршрут отсюда
    </a>
    <a class="dropdown-item" href="#" @click.prevent="isochroneFromPoint()">
      <i class="icon icon-lg ksi_isochrone me-1"></i> Изохрона отсюда
    </a>
    <a class="dropdown-item" href="#" @click.prevent="measureFromPoint()">
      <i class="icon icon-lg fi_ruler me-1"></i> Измерить отсюда
    </a>
  </div>
  <AddObjectModal v-model="isAddObjectModalVisible" :objectType="'B'" :default-values="newRealtyObjectDefaultValues" />
</template>

<script lang="ts" setup>
import { propertiesContainsFilter } from '@turf/turf'
import type { Point } from 'geojson'
import { boolean } from 'mathjs'
import { api_realty_objects } from '~/app_constants/api'
import { isOsmBuilding, realtyObjectBuildingCategories } from '~/app_constants/geoInfoLists'
import { navigateString } from '~/app_constants/objectsTable'
import AddObjectModal from '~/components/UI-KIT/Modals/AddObjectModal.vue'
import type { objectDataType } from '~/types/geoObjectTypes'

const { $mapStore, $searchServer, $baseURL, $mapObjectDefaults }: any = useNuxtApp()
const { $geoObject } = useNuxtApp()

const props = defineProps({
  map: { type: Object, required: true },
  mapStore: { type: Object, default: {} },
  semiTransparent: { type: Boolean, default: false },
})

const $mapStoreInUse = Object.keys(props.mapStore).length ? props.mapStore : $mapStore

const visible = ref(false)
// Оконные координаты точки нажатия
const point = ref({ x: 0, y: 0 })
// Координаты на карте
const lngLat = ref({ lng: 0, lat: 0 })
// Статусы загрузки / ошибки загрузки объектов OSM и ОН, ошибки вообще
const loading = ref(false)
const errorOSM = ref(false)
const errorGs = ref(false)
const error = ref(false)
// Объект OSM
const ctxOSMObject: Ref<Record<string, any>> = ref({})
// Объекты недвижимости
const ctxGsObjects: Ref<any[]> = ref([])
// Подменю свёрнуто/развёрнуто
const collapse_1 = ref(true)
const collapse_2 = ref(true)
const buildingNotFound = ref(false)
// Модальное окно добавления нового ОН
const isAddObjectModalVisible = ref(false)
// Для добавления нового ОН
const newRealtyObjectDefaultValues: Ref<Record<string, any>> = ref({})
// ссылка на div меню
const mapCtxMenu = ref(null)

onMounted(() => {
  document.addEventListener('mousedown', onDocumentMouseDown)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onDocumentMouseDown)
})

// Обновление положения меню
onUpdated(() => {
  const ctxMenu: any = mapCtxMenu.value
  if (ctxMenu) {
    const ctxPoint = {
      x: point.value.x,
      y: point.value.y,
    }
    const container = props.map.getContainer()
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
    close()
  }
}

// Показать меню (сброс параметров и загрузка объектов в точке)
const show = (event: any) => {
  point.value = event.point
  lngLat.value = event.lngLat
  error.value = false
  errorOSM.value = false
  errorGs.value = false
  loading.value = true
  visible.value = true
  getObjects()
}

const close = () => {
  visible.value = false
  ctxOSMObject.value = {}
  ctxGsObjects.value = []
  $mapStoreInUse.geometryToDraw = []
}

// Получение данных об объектах под указателем
const getObjects = async () => {
  let _geometryToDraw: any[] = []

  const pointStr = 'lat=' + lngLat.value.lat + '&lon=' + lngLat.value.lng
  // -- Объект OpenStreetMap по API Nomination
  const cnObject = await $http
    .get(
      $searchServer +
        '/reverse.php?' +
        pointStr +
        '&zoom=18&format=jsonv2&accept-language=ru&limit=10&polygon_geojson=1',
    )
    .then((res: Record<string, any>) => res._data)
    .catch((err: any) => {
      error.value = err
      errorOSM.value = err
    })

  if (!isOsmBuilding(cnObject)) {
    buildingNotFound.value = true
  } else {
    buildingNotFound.value = false

    _geometryToDraw.push({
      id: cnObject.osm_id,
      type: 'Feature',
      properties: { style: 'purple' },
      geometry: cnObject.geojson,
    })
  }

  $mapObjectDefaults(cnObject)

  ctxOSMObject.value = cnObject

  // -- Объекты Гисанды (здания и ЗУ)
  const gsObjects = await $http
    .get($baseURL + '/api/v1/osm_obj/get_by_coords?' + pointStr + '&radius=25&limit=10')
    .then((res: Record<string, any>) => res._data)
    .catch((err: any) => {
      error.value = err
      errorGs.value = err
    })

  if (gsObjects) {
    ctxGsObjects.value = gsObjects
    gsObjects.forEach((gsObj: any) => {
      _geometryToDraw.push({
        id: gsObj.id,
        type: 'Feature',
        properties: { style: 'primary' },
        geometry: gsObj.geo_obj,
      })
    })
  } else {
    ctxGsObjects.value = []
    _geometryToDraw = []
  }

  $mapStoreInUse.geometryToDraw = _geometryToDraw

  loading.value = false
}

// Иконка объекта недвижимости
const getGsObjectIcon = (gsObject: Record<string, any>) => {
  const icons: Record<string, any> = { B: 'ksi_building', L: 'fi_landplot', Q: 'ksi_premise' }
  return icons[gsObject.object_type] || 'empty'
}

// Переход на страницу объекта
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

// Клик по пункту меню - объекту OSM (открывается модальное окно)
const showOSMInfo = (OSMObject: Record<string, any>) => {
  close()
  $mapStore.geoInfoOsmObj = OSMObject
  const geoPos = {
    lat: lngLat.value.lat,
    lon: lngLat.value.lng,
  }
  $mapStore.showGeoInfoModal(geoPos, OSMObject)
}

// Клик по пункту меню - объекту недвижиости (переход к страице объекта)
const goToObject = (gsObject: Record<string, any>) => {
  close()
  navigateQuarterRealtyObject(gsObject.id)
}

// Помечаем объект для вывода его на карте с акцентом
const focusObject = (id: string) => {
  $mapStore.geometryEmphasis = [id]
}

const leaveObjects = () => {
  $mapStore.geometryEmphasis = []
}

// Клик по пункту меню - добавить объект недвижиости (переход к страице объекта)
const addObject = () => {
  const defaultValues: Record<string, any> = {
    geo_pos: {
      type: 'Point',
      coordinates: [lngLat.value.lng, lngLat.value.lat],
    },
  }

  if (ctxOSMObject.value) {
    const address =
      ctxOSMObject.value.address.city === ctxOSMObject.value.address.state
        ? 'г. ' + ctxOSMObject.value.address.city + ', ' + ctxOSMObject.value.shortAddress
        : ctxOSMObject.value.shortName
    defaultValues.address_raw = address
    defaultValues.osm_id = ctxOSMObject.value.osm_id
    defaultValues.geo_obj = ctxOSMObject.value.geojson
  }
  newRealtyObjectDefaultValues.value = defaultValues

  close()

  isAddObjectModalVisible.value = true
  close()
}

// Клик по пункту меню - маршрут сюда
const routeToPoint = () => {
  $mapStore.isRouteAdressFromCtx = true
  $mapStore.mapInstrumentActiveTabIndex = 3
  $mapStore.secondRoutingAddress = ctxOSMObject.value.display_name
  $mapStore.secondRoutingCoords = {
    lat: lngLat.value.lat,
    lon: lngLat.value.lng,
  }
  close()
}

// Клик по пункту меню - маршрут отсюда
const routeFromPoint = () => {
  $mapStore.isRouteAdressFromCtx = true
  $mapStore.mapInstrumentActiveTabIndex = 3
  $mapStore.firstRoutingAddress = ctxOSMObject.value.display_name
  $mapStore.firstRoutingCoords = {
    lat: lngLat.value.lat,
    lon: lngLat.value.lng,
  }
  close()
}

// Клик по пункту меню - изохрона отсюда
const isochroneFromPoint = () => {
  $mapStore.isIsochroneAddressFromCtx = true
  $mapStore.mapInstrumentActiveTabIndex = 4
  const geoPos = {
    lat: lngLat.value.lat,
    lon: lngLat.value.lng,
  }
  $mapStore.isochronePointAddress = ctxOSMObject.value.display_name
  $mapStore.isochronePointCoords = geoPos
  close()
}

// Клик по пункту меню - измерить отсюда
const measureFromPoint = () => {
  $mapStore.mapInstrumentActiveTabIndex = 5
  $mapStore.measurePointFromCoords = lngLat.value
  close()
}

defineExpose({
  show,
})
</script>
