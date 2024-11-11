<template>
  <div class="table-block h-100 overflow-y-auto">
    <TableFiltersLine :onDeleteFilter="deleteFilter" :table-header-filters="tableHeaderFilters"></TableFiltersLine>
    <ToolLine
      :activeItem="activeAnalog"
      :navigate-string-for-add-button="navigateString"
      :showMap="showMap"
      :title-for-add-button="titleForAddButton"
      :default-navigate="false"
      @onAddObject="showAddObjectModal"
      @onOptionsClick="toggleOptions"
      @onShowMapClick="toggleMap"
      @addComparison="addComparison"
    ></ToolLine>
    <Table
      ref="table"
      class="new-style-table"
      :activeItem="activeAnalog"
      :firstNo="firstNo"
      :items="objects"
      :loading="loading"
      :navigate-string="navigateString"
      :style="tableHeightStyle"
      :store="tableStore"
      :tableStructure="dynamicTableStructureKey"
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
        :mode="'onlyRealtyObjectsNoFunctionality'"
        :activeItem="activeAnalog"
        :firstNo="firstNo"
        :items="objects"
        :map="map"
        :mapInit="mapInit"
        @onItemSelect="
          (item) => {
            onItemSelect(item)
            table?.scrollToItem(item)
          }
        "
      ></ObjectsLayer>
    </MapComponent>
    <Pager
      :page="page"
      :pages="pages"
      :records="records"
      class="px-1 pb-1"
      @onChange="getRecords"
      @onRefresh="refreshRecords"
    ></Pager>
    <ButtonWithLoader
      v-if="comparisonObjectsLength || comparisonObjectsForTopMenu.length > 1"
      :value="'Назад к сравнению'"
      button-class="px-4 fixed-fs-17"
      width="20%"
      start-icon-class="icon fi_arrow-left me-2"
      variant="outline-secondary"
      @click="
        () => {
          navigateTo(`/compare`)
        }
      "
    />
    <GeoObjectTableBlockFooter v-if="$geoObject.linkExistingObjectsTable" />
  </div>
  <TableSettingsModal
    v-model="showOptions"
    :data="tableParamsData"
    :table-params="tableParams"
    @accept-parameters="acceptParameters"
  />
  <AddObjectModal v-model="isAddObjectModalVisible" :objectType="currentObjectType" />
</template>

<script lang="ts" name="TableBlock" setup>
import { ref, computed, watch, onBeforeMount, onMounted } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import { cloneDeep } from 'lodash'
import type { optionType } from '~/types/tablesTypes'

import TableFiltersLine from '~/components/UI-KIT/Table/TableFiltersLine.vue'
import ToolLine from './ToolLine.vue'
import Table from '~/components/UI-KIT/Table/Table.vue'
import Pager from '~/components/UI-KIT/Table/Pager.vue'
import Splitter from '~/components/UI-KIT/Splitter.vue'
import MapComponent from '~/components/MapComponent/MapComponent.vue'
import ObjectsLayer from '~/components/MapComponent/ObjectsLayer.vue'
import GeoObjectTableBlockFooter from '../ObjectsTable/GeoObjectTableBlockFooter.vue'
import TableSettingsModal from '~/components/UI-KIT/Modals/TableSettingsModal.vue'
import AddObjectModal from '~/components/UI-KIT/Modals/AddObjectModal.vue'
import { useTableParams } from '~/composables/TableParams/RealEstate'
import ButtonWithLoader from '~/components/UI-KIT/Buttons/BaseFormButton.vue'

defineProps({
  titleForAddButton: { type: String, required: true },
  navigateString: { type: String, required: true },
})

const nuxtApp = useNuxtApp()
const { $geoObject, $objectModelTable, $comparison }: any = nuxtApp

const vMap = ref<HTMLElement | null>(null)
const activeAnalog = ref(null)
const showMap = ref(!$geoObject.linkExistingObjectsTable)
const showOptions = ref(false)
const isAddObjectModalVisible = ref(false)
const objects = computed(() => $objectModelTable.objectsRespData.results)
const page = ref($objectModelTable.page)
const pages = ref(1)
const rows = ref(15)
const records = ref(1)
const tableSplHeight = ref(40)
const currentObjectType = ref('Q')

const tableHeaderFilters = computed(() => $objectModelTable.tableHeaderFilters)
const tableStore = computed(() => $objectModelTable)
const loading = computed(() => $objectModelTable.objectsRespLoading)
const firstNo = computed(() => (page.value - 1) * rows.value + 1)
const tableHeightStyle = computed(() => (showMap.value ? `height: ${tableSplHeight.value}%` : 'height: 100%'))
const comparisonObjectsIdsArr = computed(() => $comparison.comparisonObjects.map((obj: Record<string, any>) => obj.id))
const comparisonObjectsLength = computed(() => $comparison.currentComparisonObjects.length)
const comparisonObjectsForTopMenu = computed(() => $comparison.getComparisonObjectsForTopMenu())

const tableParamsData = ref({
  limit: 15,
  displayedColumns: ['object_type', 'ads_type', 'func_purpose', 'address_raw'],
  sortField: 'object_type',
  sortDirection: 'asc',
})

const { tableParams } = useTableParams()

const deleteFilter = (key: string) => $objectModelTable.deleteFilter(key)
const toggleOptions = () => (showOptions.value = !showOptions.value)
const toggleMap = () => (showMap.value = !showMap.value)
const showAddObjectModal = (objectType: string) => {
  isAddObjectModalVisible.value = true
  currentObjectType.value = objectType
}

const table = ref<InstanceType<typeof Table> | null>(null)
const ObjectsLayerRef = ref<InstanceType<typeof ObjectsLayer> | null>(null)

const dynamicTableStructureKey = computed(() => {
  const objectTypeKey = $objectModelTable.searchParams.object_type_calc || 'OA'
  return `tableStructure_${objectTypeKey}`
})

const onItemSelect = (item: any) => {
  activeAnalog.value = item
  console.log(item, activeAnalog.value)
  $objectModelTable.lastSelectedObject = item
}

const getRecords = async (_page: Number) => {
  if (_page && _page != page.value) {
    activeAnalog.value = null
  }
  $objectModelTable.setObjectsRespLoading(true)
  $objectModelTable.getObjects(_page).then((resp: boolean) => {
    if (resp) {
      $objectModelTable.setObjectsRespLoading(false)
    }
  })
}

const refreshRecords = () => getRecords(page.value)

const setSortDirection = (event: Event, field: string) => {
  const sortDirection = $objectModelTable.getColumnSortDirection(field)
  $objectModelTable.setSortDirection(sortDirection, field)
  getRecords(page.value)
}

const acceptParameters = (data: any) => {
  tableParamsData.value = cloneDeep(data)
  $objectModelTable.setSortDirection(data.sortDirection, data.sortField)
  $objectModelTable.updateSearchObjectLimit(data.limit)
  $objectModelTable.onTableColumns(
    data.displayedColumns,
    tableParams.displayedColumns.options.map((option: optionType) => option.value),
  )
  getRecords(1)
}

const addComparison = (obj: Record<string, any>) => {
  if (comparisonObjectsIdsArr.value && comparisonObjectsIdsArr.value.includes(obj.id)) return

  const comparisonObject = {
    id: obj.id,
    object_type: obj.object_type,
    geo_pos: obj.geo_pos,
    address_raw: obj.address_raw,
    name: obj.name,
    object_type_calc: obj.object_type_calc,
    func_purpose: obj.func_purpose,
    added_date: obj.added_date.split('-').reverse().join('.'),
  }
  $comparison.addComparisonObject(comparisonObject)
}

onMounted(() => {
  if ($objectModelTable.lastSelectedObject) {
    activeAnalog.value = $objectModelTable.lastSelectedObject
  }
  if (Object.keys($objectModelTable.objectsRespData).length) {
    page.value = $objectModelTable.objectsRespData.page
    pages.value = $objectModelTable.objectsRespData.total_pages
    records.value = $objectModelTable.objectsRespData.rows_filtered
    rows.value = $objectModelTable.searchParams.limit
  }
})

watch([() => $objectModelTable.objectsRespData, () => $objectModelTable.searchParams.limit], () => {
  page.value = $objectModelTable.objectsRespData.page
  pages.value = $objectModelTable.objectsRespData.total_pages
  records.value = $objectModelTable.objectsRespData.rows_filtered
  rows.value = $objectModelTable.searchParams.limit
})

watch(
  () => showOptions.value,
  (newVal) => {
    if (newVal) {
      tableParamsData.value.displayedColumns = $objectModelTable.tableColumns
        .filter((item: any) => item.isSwitchOn)
        .map((item: any) => item.field)
    }
  },
)

onBeforeMount(() => {
  if (!$geoObject.linkExistingObjectsTable && !Object.keys($objectModelTable.objectsRespData).length)
    $objectModelTable.getObjects()
})

watch(
  () => $geoObject.linkExistingObjectsTableFiltersApplied,
  (newVal) => {
    if (newVal) $objectModelTable.getObjects()
  },
)
</script>

<style lang="scss" scoped>
.new-style-table {
  :deep(tbody tr .comparison) {
    text-align: center !important;
  }
  :deep(tbody tr .name),
  :deep(tbody tr .address_raw) {
    word-break: break-word;
    overflow-wrap: break-word;
  }
}
</style>
