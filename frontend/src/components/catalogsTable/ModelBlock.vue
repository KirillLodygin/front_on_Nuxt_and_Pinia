<template>
  <div class="table-block h-100 overflow-y-auto">
    <ToolLine
      :activeItem="activeAnalog"
      :navigate-string-for-add-button="navigateString"
      :showMap="showMap"
      :title-for-add-button="titleForAddButton"
      @onOptionsClick="toggleOptions"
      @onShowMapClick="toggleMap"
      @onOpenFeature="onOpenFeatures"
      @onAddCatalog="showAddCatalogModal"
      @onAddObject="showAddObjectModal"
      @onOpenObjectClick="onRowDblClick"
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
      :itemsCtxMenu="itemsCtxMenu"
      :groups="grouped"
      :actionDblClick="true"
      :tableStructure="'tableStructureCatalogs'"
      @onDelete="onDelete"
      @onOpenFeatures="onOpenFeatures"
      @onColumnClick="setSortDirection"
      @onRowDblClick="onRowDblClick"
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
        :mode="'mixedRealEstateAndRealtyObjects'"
        :activeItem="activeAnalog"
        :firstNo="firstNo"
        :items="layerObjects"
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
  </div>
  <TableSettingsModal
    v-model="showOptions"
    :data="tableParamsData"
    :table-params="tableParams"
    @accept-parameters="acceptParameters"
  />
  <AddObjectModal
    v-model="isAddObjectModalVisible"
    :objectType="currentObjectType"
    :disableNavigate="true"
    @objectCreated="bindObject"
  />
  <AddCatalogModal v-model="isAddCatalogModalVisible" @acceptParameters="$catalogsTable.addCatalog" />
</template>

<script lang="ts" name="TableBlock" setup>
import { ref, computed, watch, onBeforeMount } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import { cloneDeep } from 'lodash'
import { useRoute } from 'vue-router'
import type { optionType } from '~/types/tablesTypes'

import ToolLine from './ToolLine.vue'
import Table from '~/components/UI-KIT/Table/Table.vue'
import Pager from '~/components/UI-KIT/Table/Pager.vue'
import Splitter from '~/components/UI-KIT/Splitter.vue'
import MapComponent from '~/components/MapComponent/MapComponent.vue'
import ObjectsLayer from '~/components/MapComponent/ObjectsLayer.vue'
import TableSettingsModal from '~/components/UI-KIT/Modals/TableSettingsModal.vue'
import AddObjectModal from '~/components/UI-KIT/Modals/AddObjectModal.vue'
import AddCatalogModal from '~/components/catalogsTable/AddCatalogModal.vue'
import { useTableParams } from '~/composables/TableParams/Catalogs'
import type { tableColumnType } from '~/types/objectsFiltersStoreTypes'
import { calcTypeToPath } from '~/app_constants/routes'

defineProps({
  titleForAddButton: { type: String, required: true },
  navigateString: { type: String, required: true },
})

const nuxtApp = useNuxtApp()
const { $catalogsTable }: any = nuxtApp

const vMap = ref<HTMLElement | null>(null)
const activeAnalog = ref(null)
const showMap = ref(true)
const showOptions = ref(false)
const isAddObjectModalVisible = ref(false)
const isAddCatalogModalVisible = ref(false)
const currentObjectType = ref('Q')
const tableSplHeight = ref(40)

const objects = computed(() => $catalogsTable.objectsRespData.results)
const layerObjects = computed(() =>
  $catalogsTable.objectsRespData.results.filter((item: any) => item.type !== 'Каталог'),
)
const page = ref($catalogsTable.page)
const pages = ref(1)
const rows = ref(15)
const records = ref(0)

const firstNo = computed(() => (page.value - 1) * rows.value + 1)
const tableHeightStyle = computed(() => (showMap.value ? `height: ${tableSplHeight.value}%` : 'height: 100%'))
const loading = computed(() => $catalogsTable.foldersLoading)
const tableStore = computed(() => $catalogsTable)
const route = useRoute()

const tableParamsData = ref({
  limit: 15,
  displayedColumns: ['type', 'name', 'address_raw', 'object_type', 'func_purpose', 'modified_date'],
  sortField: 'object_type',
  grouped: 'on',
  sortDirection: 'asc',
})

const { tableParams } = useTableParams()

const itemsCtxMenu = ref([
  { label: 'Свойства', icon: 'fi_edit-3', emit: 'onOpenFeatures' },
  { label: 'Удалить', icon: 'fi_trash', emit: 'onDelete' },
])

const groups = ref([
  {
    title: 'Вложенные каталоги',
    requirement: (item: any) => item.children,
  },
  {
    title: 'Вложенные объекты недвижимости',
    requirement: (item: any) => item.realty_cards && !item.children,
  },
  {
    title: 'Вложенные карточки',
    requirement: (item: any) => !item.realty_cards,
  },
])

const grouped = computed(() => (tableParamsData.value.grouped === 'on' ? groups.value : []))

const emit = defineEmits(['onDelete', 'onOpenFeatures', 'acceptParameters', 'folderSelected'])
const table = ref<InstanceType<typeof Table> | null>(null)
const ObjectsLayerRef = ref<InstanceType<typeof ObjectsLayer> | null>(null)

const toggleOptions = () => (showOptions.value = !showOptions.value)
const toggleMap = () => (showMap.value = !showMap.value)
const showAddCatalogModal = () => (isAddCatalogModalVisible.value = true)
const showAddObjectModal = (objectType: string) => {
  isAddObjectModalVisible.value = true
  currentObjectType.value = objectType
}

const onItemSelect = (item: any) => {
  activeAnalog.value = item
  console.log(item, activeAnalog.value)
}

const getRecords = async (page: any) => {
  if (page && page !== page.value) activeAnalog.value = null
  $catalogsTable.setObjectsRespLoading(true)
  const resp = await $catalogsTable.getObjects(page)
  if (resp) $catalogsTable.setObjectsRespLoading(false)
}

const refreshRecords = () => getRecords(page.value)

const setSortDirection = (event: Event, field: string) => {
  const sortDirection = $catalogsTable.getColumnSortDirection(field)
  $catalogsTable.setSortDirection(sortDirection, field)
  getRecords(page.value)
}

const acceptParameters = (data: any) => {
  tableParamsData.value = cloneDeep(data)
  $catalogsTable.setSortDirection(data.sortDirection, data.sortField)
  $catalogsTable.updateSearchObjectLimit(data.limit)
  $catalogsTable.onTableColumns(
    data.displayedColumns,
    tableParams.displayedColumns.options.map((option: optionType) => option.value),
  )
  getRecords(page.value)
}

const bindObject = (object: any) => {
  $catalogsTable.bindObject([object.id])
}

const onRowDblClick = (item: any) => {
  if (item.children) {
    emit('folderSelected', item)
  } else if (item.realty_cards) {
    $catalogsTable.previousRoute = route.fullPath
    navigateTo({ path: `/real_estate/${item.id}`, hash: '#Базовые поля' })
  } else {
    $catalogsTable.previousRoute = route.fullPath
    navigateTo(`/${calcTypeToPath[item.func_purpose.object_type]}/${item.id}`)
  }
}

const onDelete = (value: object) => {
  emit('onDelete', value)
}

const onOpenFeatures = (value: object) => {
  emit('onOpenFeatures', value)
}

watch(
  () => $catalogsTable.objectsRespData,
  () => {
    page.value = $catalogsTable.objectsRespData.page
    pages.value = $catalogsTable.objectsRespData.total_pages
    records.value = $catalogsTable.objectsRespData.rows_filtered
    rows.value = $catalogsTable.objectsRespData.rows
    activeAnalog.value = null
  },
)

watch(
  () => showOptions.value,
  (newVal) => {
    if (newVal) {
      tableParamsData.value.displayedColumns = $catalogsTable.tableColumns
        .filter((item: tableColumnType) => item.isSwitchOn)
        .map((item: tableColumnType) => item.field)
    }
  },
)

onBeforeMount(() => {
  $catalogsTable.getObjects()
})
</script>

<style lang="scss" scoped>
:deep(table tbody tr td .fi_folder) {
  width: 1.25rem;
  height: 1.25rem;
}
</style>
