<template>
  <div class="overflow-y-hidden overflow-x-hidde w-100 h-100 d-flex flex-column position-relative">
    <button
      v-if="!isShowStub && !isNonCardVersion"
      class="btn bth-tool mb-2"
      @click="() => refresh()"
      style="max-width: fit-content"
    >
      Обновить
    </button>
    <div v-if="isShowStub" class="table-load-bg">
      <div class="table-load">
        <div class="spinner-border" role="status"></div>
        <div>Загрузка данных...</div>
      </div>
    </div>
    <AlertEmpty v-if="!isShowStub && !geoTsofObject.length"
      >В окружении данного объекта недвижимости не найдено объектов, влияющих на ценообразование локации.</AlertEmpty
    >
    <template v-if="!isShowStub && geoTsofObject.length"
      ><div class="overflow-y-auto position-relative h-45 w-100 mb-2">
        <table class="table table-content table-geo-tsof" style="{table-layout: fixed}">
          <thead id="_columns" class="w-100">
            <tr>
              <th v-for="header in sortableHeaderData" class="col" scope="col" style="width: 20%">
                <SortableHeader
                  v-if="header.field !== 'source'"
                  :sortDirection="header.sortDirection"
                  :sorted="header.sorted"
                  :title="header.title"
                  field=""
                  @click="onColumnClick(header.title)"
                />
                <div v-else>{{ header.title }}</div>
              </th>
            </tr>
          </thead>

          <tbody id="_body" class="w-100">
            <tr
              v-for="(obj, index) of geoTsofObject"
              :class="[
                {
                  'table-active':
                    $geoTsofs.activeGeoTsofItem && obj.pricing_factor === $geoTsofs.activeGeoTsofItem.pricing_factor,
                },
                'table-string',
              ]"
              @click="$geoTsofs.setActiveGeoTsofItem(obj)"
            >
              <td v-for="header in sortableHeaderData" class="col" style="width: 20%" :key="header.field">
                <div v-if="header.field === 'pricing_factor'">{{ getPricingFactor(obj) }}</div>
                <div v-else-if="header.field === 'address'">{{ getObjectAddress(obj) }}</div>
                <template v-else-if="header.field === 'all_types'">
                  <div v-if="obj.type === 'by_foot'"><i class="icon ic-walk" />{{ getOnFootLine(obj) }}</div>
                  <div v-if="obj.type === 'by_car'"><i class="icon ic-rent_car" />{{ getOnCarLine(obj) }}</div>
                  <div v-if="obj.type === 'direct'"><i class="icon fi_line" />{{ getDirectLine(obj) }}</div>
                </template>
                <div v-else class="cell-building">
                  <i v-if="obj.source !== 'OSM'" class="icon ksi_building" />{{ getSourceLine(obj) }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <MapComponent
        class="h-50"
        ref="vMap"
        v-slot="{ map, mapInit }"
        :address-from-map="false"
        :express="false"
        :is-analog-map-modal="false"
        :layers-tree="{}"
        :showCtxMenu="false"
        :onFullScreenStart="() => ($geoTsofs.isFullScreen = true)"
        :onFullScreenEnd="() => ($geoTsofs.isFullScreen = false)"
        showFullscreenButton
        style="flex: 1"
      >
        <ObjectsLayer
          ref="ObjectsLayerRef"
          :mode="'geoTsofRoute'"
          :activeItem="$geoTsofs.activeGeoTsofItem"
          :items="[]"
          :map="map"
          :mapInit="mapInit"
        >
        </ObjectsLayer>
      </MapComponent>
      <Teleport v-if="$geoTsofs.isFullScreen" to=".map">
        <div id="geo-tsof-fullscreen" class="geo-tsof-fullscreen">
          <div
            v-for="(obj, index) of geoTsofObject"
            :class="[
              {
                'geo-tsof-fullscreen_active-item':
                  $geoTsofs.activeGeoTsofItem && obj.pricing_factor === $geoTsofs.activeGeoTsofItem.pricing_factor,
              },
              'table-string',
              'geo-tsof-fullscreen_item',
            ]"
            @click="$geoTsofs.setActiveGeoTsofItem(obj)"
          >
            <div class="geo-tsof-fullscreen_item_title mb-2">{{ getPricingFactor(obj) }}</div>
            <div class="d-flex justify-content-start mb-2">
              <div v-if="obj.type === 'by_foot'" class="geo-tsof-fullscreen_item_title small">
                <i class="icon ic-walk icon icon-lg" />{{ getOnFootLine(obj) }}
              </div>
              <div v-if="obj.type === 'by_car'" class="geo-tsof-fullscreen_item_title small">
                <i class="icon ic-rent_car icon-lg" />{{ getOnCarLine(obj) }}
              </div>
              <div v-if="obj.type === 'direct'" class="geo-tsof-fullscreen_item_title small">
                <i class="icon fi_line icon-lg" />{{ getDirectLine(obj) }}
              </div>
            </div>
            <div class="container">
              <template v-for="header in geoTsofFullScreenObject" :key="header.field">
                <div v-if="header.field === 'pricing_factor_name'" class="d-flex justify-content-start row mb-1">
                  <span class="geo-tsof-fullscreen-line geo-tsof-fullscreen-line-title col-2">{{ header.title }}: </span
                  ><span class="geo-tsof-fullscreen-line geo-tsof-fullscreen-line-info col-10">{{
                    getNameLine(obj)
                  }}</span>
                </div>
                <div v-else-if="header.field === 'address'" class="d-flex justify-content-start row mb-1">
                  <span class="geo-tsof-fullscreen-line geo-tsof-fullscreen-line-title col-2 mb-1"
                    >{{ header.title }}: </span
                  ><span class="geo-tsof-fullscreen-line geo-tsof-fullscreen-line-info col-10 mb-1">{{
                    getObjectAddress(obj)
                  }}</span>
                </div>
                <div v-else class="d-flex justify-content-start row">
                  <span class="geo-tsof-fullscreen-line geo-tsof-fullscreen-line-title col-2 mb-1"
                    >{{ header.title }}: </span
                  ><span class="geo-tsof-fullscreen-line geo-tsof-fullscreen-line-info col-10 mb-1">{{
                    getSourceLine(obj)
                  }}</span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </Teleport>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import { geoTsofFullScreenObject, geoTsofTableHeaderObject } from '~/app_constants/geoTsofTable'
import type { SortableHeaderType } from '~/types/objectEvaluationType'
import type { geoTsofObjectType } from '~/types/geoTsofTableTypes'
import SortableHeader from '~/components/ObjectsTable/SortableHeader.vue'
import ObjectsLayer from '../../MapComponent/ObjectsLayer.vue'
import AlertEmpty from '~/components/UI-KIT/Alerts/AlertEmpty.vue'
import { getDirectLine, getOnCarLine, getOnFootLine } from '~/utils/tableCellsValues'
import type { Point } from 'geojson'

interface Props {
  geo_pos?: Point
  isLinkedRealEstate?: boolean
  isGeoObject?: boolean
  isNonCardVersion?: boolean
}
const props = defineProps<Props>()
const { $geoTsofs, $geoObject } = useNuxtApp()
const sortableHeaderData: Ref<SortableHeaderType[]> = ref(geoTsofTableHeaderObject)

onMounted(async () => {
  if (!props.isNonCardVersion) {
    await initRefresh()
  }
  await init()
})

const initRefresh = async () => {
  if (props.isGeoObject) {
    if ($geoObject.objectData) {
      const finded = Object.entries($geoObject.objectData).find(
        ([key, value]) => key.startsWith('distance_') && key.endsWith('_descr') && value,
      )
      if (!finded) {
        await refresh(false)
      }
    }
  }
}

async function init() {
  $geoTsofs.onIsShowStub()
  if (props.geo_pos) {
    await $geoTsofs.setGeoTsofObject(
      props.geo_pos.coordinates[0],
      props.geo_pos.coordinates[1],
      !!props.isLinkedRealEstate,
      !!props.isGeoObject,
    )
  } else {
    await $geoTsofs.setGeoTsofObject(0, 0, !!props.isLinkedRealEstate, !!props.isGeoObject)
  }

  $geoTsofs.offIsShowStub()
}

async function refresh(toInit = true) {
  $geoTsofs.onIsShowStub()
  await $geoTsofs.refreshGeoTsof(!!props.isLinkedRealEstate, !!props.isGeoObject)
  if (toInit) {
    await init()
  }
}

const isShowStub = computed(() => $geoTsofs.isShowStub)
const geoTsofObject = computed(() =>
  $geoTsofs.geoTsofObject.sort((a: any, b: any): any => {
    const sortData = sortableHeaderData.value.find((obj: SortableHeaderType) => obj.sorted)
    if (sortData) {
      if (sortData.sortDirection === 'asc') {
        if (sortData.field === 'all_types') {
          return a.all_types[a.type].distance - b.all_types[b.type].distance
        }
        return a[sortData.field].toString().localeCompare(b[sortData.field].toString())
      } else if (sortData.sortDirection === 'desc') {
        if (sortData.field === 'all_types') {
          return b.all_types[b.type].distance - a.all_types[a.type].distance
        }
        return b[sortData.field].toString().localeCompare(a[sortData.field].toString())
      }
    } else {
      return b.id - a.id
    }
  }),
)

// watch(
//   () => $geoTsofs.realtyObjectRealtyCards?.id,
//   () => {
//     if ($geoTsofs.realtyObjectRealtyCards) {
//       const distanceKeys = Object.keys($geoTsofs.realtyObjectRealtyCards).filter(
//         (key) => key.startsWith('distance_') && !key.endsWith('_descr'),
//       )
//       const allZero = distanceKeys.every((key) => $geoTsofs.realtyObjectRealtyCards?.[key] === '0.000')
//       if (allZero) {
//         refresh()
//       }
//     }
//   },
// )

const getPricingFactor = (obj: geoTsofObjectType) => {
  return obj.label
}

const getObjectAddress = (obj: geoTsofObjectType) => {
  const address = obj.address ? obj.address : null
  const name = obj.name && obj.name !== 'noname' ? obj.name : null
  let geoString
  if (obj.point) {
    geoString = obj.point?.map((num) => num.toString().replace(/\./g, ',')).join(', ')
  }
  if (name && address) {
    return `${name} (${address})`
  }
  if (name) {
    return `${name} (${geoString})`
  }
  if (address) {
    return `${address}`
  }
  return `${geoString}`
}

const getSourceLine = (obj: geoTsofObjectType) => {
  return ` ${obj.source}`
}

const getNameLine = (obj: geoTsofObjectType) => {
  return ` ${obj.pricing_factor_name}`
}

const onColumnClick = (title: string) => {
  sortableHeaderData.value.forEach((header: SortableHeaderType) => {
    if (header.title === title) {
      switch (header.sortDirection) {
        case 'none':
          header.sortDirection = 'asc'
          break
        case 'asc':
          header.sortDirection = 'desc'
          break
        case 'desc':
          header.sortDirection = 'none'
          break
      }
      header.sorted = header.sortDirection !== 'none'
    } else {
      header.sortDirection = 'none'
      header.sorted = false
    }
  })
}
</script>

<style lang="scss" scoped>
.table-geo-tsof {
  tbody tr td div {
    word-break: break-word;
    overflow-wrap: break-word;
  }
}
</style>
