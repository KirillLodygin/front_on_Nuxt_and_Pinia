<template>
  <div class="table-block h-100 overflow-y-auto">
    <TableFiltersLine :table-header-filters="tableHeaderFilters"></TableFiltersLine>
    <ToolLine
      :activeItem="activeAnalog"
      :navigate-string-for-add-button="navigateString"
      :showMap="showMap"
      :title-for-add-button="titleForAddButton"
      @onOptionsClick="showOptions = !showOptions"
      @onShowMapClick="showMap = !showMap"
    ></ToolLine>
    <Table
      ref="table"
      :activeItem="activeAnalog"
      :firstNo="(page - 1) * rows + 1"
      :items="objects"
      :loading="$filtersStore.objectsRespLoading"
      :navigate-string="navigateString"
      :style="showMap ? 'height: ' + tableSplHeight + '%' : 'height: 100%'"
      @onColumnClick="setSortDirection"
      @onItemSelect="
        (item) => {
          onItemSelect(item)
          ObjectsLayerRef?.fitActiveItem()
        }
      "
    ></Table>
    <splitter v-if="showMap" v-model="tableSplHeight" :max="60" :min="20" style="margin: -14px 0"></splitter>

    <MapComponent
      v-if="showMap"
      ref="vMap"
      v-slot="{ map, mapInit }"
      :address-from-map="false"
      :express="false"
      :is-analog-map-modal="false"
      :layers-tree="{}"
      :showCtxMenu="false"
      showFullscreenButton
      style="flex: 1"
    >
      <ObjectsLayer
        ref="ObjectsLayerRef"
        :mode="'onlyRealEstateNoFunctionality'"
        :activeItem="activeAnalog"
        :firstNo="(page - 1) * rows + 1"
        :items="objects"
        :map="map"
        :mapInit="mapInit"
        :is-custom-markers="true"
        :is-analogs-component="false"
        @onItemSelect="
          (item) => {
            onItemSelect(item)

            table?.scrollToItem(item)
          }
        "
      >
      </ObjectsLayer>
    </MapComponent>
    <Pager
      :page="page"
      :pages="pages"
      :records="records"
      class="px-1 pb-1"
      @onChange="getRecords"
      @onRefresh="getRecords(page)"
    ></Pager>
    <GeoObjectTableBlockFooter v-if="$geoObject.linkExistingCardTable" />
  </div>
  <TableSettingsModal
    v-model="showOptions"
    :data="tableParamsData"
    :table-params="tableParams"
    @accept-parameters="acceptParameters"
  />
</template>

<script lang="ts" setup>
import { useNuxtApp } from 'nuxt/app'
import { computed } from 'vue'
import type { optionType } from '~/types/tablesTypes'
import TableFiltersLine from '~/components/UI-KIT/Table/TableFiltersLine.vue'
import ToolLine from '~/components/UI-KIT/Table/ToolLine.vue'
import Table from '~/components/UI-KIT/Table/Table.vue'
import Pager from '~/components/UI-KIT/Table/Pager.vue'
import Splitter from '~/components/UI-KIT/Splitter.vue'
import GeoObjectTableBlockFooter from './GeoObjectTableBlockFooter.vue'
import MapComponent from '~/components/MapComponent/MapComponent.vue'
import ObjectsLayer from '~/components/MapComponent/ObjectsLayer.vue'
import type { sortDirectionType, tableColumnType, tableParamsDataType } from '~/types/objectsFiltersStoreTypes'
import TableSettingsModal from '~/components/UI-KIT/Modals/TableSettingsModal.vue'
import { cloneDeep } from 'lodash'
import { useTableParams } from '~/composables/TableParams/CardTables'

const props = defineProps({
  titleForAddButton: { type: String, required: true },
  navigateString: { type: String, required: true },
})

const { $filtersStore, $auth, $geoObject }: any = useNuxtApp()
const vMap = ref<InstanceType<typeof MapComponent>>()
const activeAnalog = ref(null)
const showMap = ref(!$geoObject.linkExistingCardTable)
const showOptions = ref(false)
const objects = computed(() => $filtersStore.objectsRespData.results)
const page = computed({
  get: () => $filtersStore.page,
  set: (newVal) => $filtersStore.setPage(newVal),
})
const pages = ref(1)
const rows = ref(15)
const records = ref(0)
const tableSplHeight = ref(40)
let filterUpdated = false

const tableHeaderFilters = computed(() => $filtersStore.tableHeaderFilters)

// Событие при выделении записи в таблице
const onItemSelect = (item: any) => {
  activeAnalog.value = item
  $filtersStore.lastSelectedObject = item
}

onMounted(() => {
  if ($filtersStore.lastSelectedObject) activeAnalog.value = $filtersStore.lastSelectedObject
  if (Object.keys($filtersStore.objectsRespData).length) {
    page.value = $filtersStore.objectsRespData.page
    pages.value = $filtersStore.objectsRespData.total_pages
    records.value = $filtersStore.objectsRespData.rows_filtered
    rows.value = $filtersStore.searchParams.limit
  }
  // Фильтрация опций в зависимости от calcType
  filterDisplayedColumnsOptions($filtersStore.searchParams.object_type_calc)
})

watch([() => $filtersStore.objectsRespData, () => $filtersStore.searchParams.limit], () => {
  page.value = $filtersStore.objectsRespData.page
  pages.value = $filtersStore.objectsRespData.total_pages
  records.value = $filtersStore.objectsRespData.rows_filtered
  rows.value = $filtersStore.searchParams.limit
})

const filterDisplayedColumnsOptions = (calcType: string) => {
  const columns = $filtersStore.tableColumns
  tableParams.displayedColumns.options = tableParams.displayedColumns.options.filter((option) => {
    const column = columns.find((col: any) => col.field === option.value)
    if (column && column.calcType) {
      return column.calcType.includes(calcType)
    }
    return true
  })
}

const setSortDirection = (event: Event, field: string) => {
  const sortDirection: sortDirectionType = $filtersStore.getColumnSortDirection(field)
  $filtersStore.setSortDirection(sortDirection, field)
  getRecords(page.value)
}

const getRecords = async (_page: Number) => {
  if (_page && _page != page.value) {
    activeAnalog.value = null
  }
  $filtersStore.setObjectsRespLoading(true)
  $filtersStore.getObjects(_page).then((resp: boolean) => {
    if (resp) {
      $filtersStore.setObjectsRespLoading(false)
    }
  })
}

// Параметры таблицы
const { tableParams } = useTableParams()

const tableParamsData = computed(() => $filtersStore.tableParamsData)

const acceptParameters = (data: tableParamsDataType) => {
  $filtersStore.updateTableParamsData(data)
  $filtersStore.setSortDirection(data.sortDirection, data.sortField, true)
  $filtersStore.updateSearchObjectLimit(data.limit)
  $filtersStore.onTableColumns(
    data.displayedColumns,
    tableParams.displayedColumns.options.map((option: optionType) => option.value),
  )
  getRecords(1)
}

watch(
  () => showOptions.value,
  () => {
    if (showOptions.value) {
      const tableParams = cloneDeep(tableParamsData.value)
      tableParams.displayedColumns = []
      $filtersStore.tableColumns.forEach((item: tableColumnType) => {
        if (item.isSwitchOn) {
          tableParams.displayedColumns.push(item.field)
        }
      })
      $filtersStore.updateTableParamsData(tableParams)
    }
  },
)

const table = ref<InstanceType<typeof Table> | null>(null)
const ObjectsLayerRef = ref<InstanceType<typeof ObjectsLayer> | null>(null)
</script>
