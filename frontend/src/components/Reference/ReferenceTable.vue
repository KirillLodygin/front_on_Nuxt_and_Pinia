<template>
  <div class="table-block h-100 overflow-y-auto">
    <TableFiltersLine :table-header-filters="tableHeaderFilters" :onDeleteFilter="handleDeleteFilter" />

    <ToolLine
      :activeItem="activeItem"
      :navigate-string-for-add-button="navigateString"
      :showMap="showMap"
      @onOptionsClick="showOptions = !showOptions"
      @onShowMapClick="showMap = !showMap"
      @onOpenTableForProgramClick="onOpenTableForProgramClickHandler"
      @onOpenTableForReportClick="onOpenTableForReportClickHandler"
      @onAddItemClick="onAddItemClickHandler"
    ></ToolLine>
    <Table
      :openTableForProgram="onOpenTableForProgramClickHandler"
      :store="$refsFiltersStore"
      :tableStructure="'tableStructureReferences'"
      :activeItem="activeItem"
      :firstNo="firstNumber"
      :items="items"
      :loading="$refsFiltersStore.loading"
      :navigate-string="navigateString"
      :style="activeItem ? `min-height: ${tableSplHeight}%;max-height: ${tableSplHeight}%;` : 'height: 100%'"
      @onColumnClick="setSortDirection"
      @onItemSelect="onItemSelect"
    ></Table>

    <Pager
      :page="$refsFiltersStore.pageNumber"
      :pages="pages"
      :records="records"
      @onChange="getRecords"
      @onRefresh="getRecords($refsFiltersStore.pageNumber)"
    ></Pager>
    <Info v-if="activeItem" :data="activeItem" />
  </div>
  <TableSettingsModal
    v-model="showOptions"
    :data="tableParamsData"
    :table-params="tableParams"
    @accept-parameters="acceptParameters"
  />
  <BModal
    v-model="showTable"
    :class="{ 'd-block': showTable }"
    centered
    content-class="map-modal-content"
    dialog-class="upload-modal-dialog"
    body-class="upload-modal-body"
    :ok-only="true"
    ok-title="Закрыть"
    ok-variant="dark"
    :title="modalTitle"
  >
    <TableDetailed :meaning="detailTableData" :page="'references'" />
  </BModal>
  <UploadModal ref="uploadModal" :schema="newReportingFormInput" />
</template>

<script lang="ts" setup>
import { useNuxtApp } from 'nuxt/app'
import TableFiltersLine from '~/components/UI-KIT/Table/TableFiltersLine.vue'
import ToolLine from '~/components/Reference/ToolLine.vue'
import Table from '~/components/UI-KIT/Table/Table.vue'
import Pager from '~/components/UI-KIT/Table/Pager.vue'
import Info from './Info.vue'
import type { bookType } from '~/types/calculationsTypes'
import type { sortDirectionType, tableColumnType } from '~/types/objectsFiltersStoreTypes'
import TableDetailed from '~/components/UI-KIT/Table/TableDetailed.vue'
import UploadModal from '~/components/UI-KIT/Modals/UploadModal.vue'
import { newReportingFormInput } from '~/app_constants/defaultValues'
import { getReferenceBookListForProgramUrl, getReferenceBookListForReportUrl } from '~/app_constants/api'
import TableSettingsModal from '~/components/UI-KIT/Modals/TableSettingsModal.vue'
import { useTableParams } from '~/composables/TableParams/References'
import { cloneDeep } from 'lodash'
import type { optionType } from '~/types/tablesTypes'

const props = defineProps({
  navigateString: { type: String, required: true },
})

const showTable: Ref<boolean> = ref(false)
const uploadModal: Ref<HTMLDivElement | null> = ref(null)
const showMap: Ref<boolean> = ref(true)
const showOptions: Ref<boolean> = ref(false)
const tableSplHeight: Ref<number> = ref(50)
const modalTitle: Ref<string> = ref('')
const paginatedItems = ref([])
const detailTableData = ref<bookType[]>([])
const { tableParams } = useTableParams()

const { $refsFiltersStore }: any = useNuxtApp()

const initLimit: number = 15
const rows: Ref<number> = ref(initLimit) // items per page
const pages = computed(() => Math.ceil($refsFiltersStore.objectsRespData.length / rows.value)) // total pages
const records = computed(() => $refsFiltersStore.objectsRespData.length) // total items
const getRecords = (newPage: number) => {
  if ($refsFiltersStore.pageNumber !== newPage) {
    $refsFiltersStore.pageNumber = newPage
  }
  $refsFiltersStore.setActiveItem(null)
  let paginationOffset = rows.value * $refsFiltersStore.pageNumber - rows.value
  paginatedItems.value = $refsFiltersStore.objectsRespData.slice(paginationOffset, paginationOffset + rows.value)
}

const activeItem = computed(() => $refsFiltersStore.activeItem)

const firstNumber = computed(() => {
  return ($refsFiltersStore.pageNumber - 1) * rows.value + 1
})

const tableHeaderFilters = computed(() => $refsFiltersStore.tableHeaderFilters)
const items = computed(() => paginatedItems.value)

const onOpenTableForProgramClickHandler = async () => {
  await getReferenceBookListForProgram(activeItem.value.id)

  modalTitle.value = `ТАБЛИЦА ДЛЯ ПРОГРАММЫ: ${activeItem.value.name_unique}`
  showTable.value = true
}

const onOpenTableForReportClickHandler = async () => {
  await getReferenceBookListForReport(activeItem.value.id)

  modalTitle.value = `ТАБЛИЦА ДЛЯ ОТЧЕТА: ${activeItem.value.name_unique}`
  showTable.value = true
}

const onAddItemClickHandler = () => {
  ;(uploadModal.value as any)?.show()
}

const setSortDirection = (event: Event, field: string) => {
  const sortDirection: sortDirectionType = $refsFiltersStore.getColumnSortDirection(field)
  $refsFiltersStore.setSortDirection(sortDirection, field)
  $refsFiltersStore.sortObjects()
}

const onItemSelect = (item: any) => {
  $refsFiltersStore.setActiveItem(item)
}

const deleteEmptyColumns = (matrix: (string | number)[][]) => {
  let obj: Record<number, number> = {}

  matrix.forEach((el) => {
    el.forEach((a, i) => {
      a.toString().trim() || (obj[i] = (obj[i] || 0) + 1)
    })
  })

  return matrix.map((el) => el.filter((a, i) => obj[i] !== matrix.length))
}

const getReferenceBookListForReport = async (id: string) => {
  const data = await $http.get(getReferenceBookListForReportUrl(id)).then((res) => res._data)
  data.forEach((el: bookType) => {
    el.json_data = deleteEmptyColumns(el.json_data)
  })
  detailTableData.value = [].concat(data)
  console.log(detailTableData.value)
}

const getReferenceBookListForProgram = async (id: string) => {
  const data = await $http.get(getReferenceBookListForProgramUrl(id)).then((res) => res._data)
  data.forEach((el: bookType) => {
    el.json_data = [...deleteEmptyColumns(el.json_data)]
  })
  detailTableData.value = [].concat(data)
}


const handleDeleteFilter = (key: any) => {
  // Логика удаления фильтра
  $refsFiltersStore.deleteFilter(key)
}

watch(
  () => ({
    objectsRespData: $refsFiltersStore.objectsRespData,
    sortedField: $refsFiltersStore.sortedField,
    tableColumns: $refsFiltersStore.tableColumns,
    sortDirection: $refsFiltersStore.sortDirection,
  }),
  ({ objectsRespData, sortedField, tableColumns, sortDirection }) => {
    // Обновляем данные пагинации
    paginatedItems.value = objectsRespData.slice(0, rows.value)

    // Обновляем сортировку
    tableParamsData.value.sortField = sortedField

    // Обновляем отображаемые столбцы
    tableParamsData.value.displayedColumns = tableColumns
      .filter((column: { isSwitchOn: boolean }) => column.isSwitchOn)
      .map((column: { field: string }) => column.field)

    // Обновляем направление сортировки
    tableParamsData.value.sortDirection = sortDirection
  },
  { deep: true },
)

const tableParamsData = ref({
  limit: initLimit,
  displayedColumns: ['name_unique', 'type', 'source', 'type_calc', 'param_name'],
  sortField: $refsFiltersStore.sortedField,
  sortDirection: $refsFiltersStore.sortDirection,
})

const acceptParameters = (data: any) => {
  tableParamsData.value = cloneDeep(data)
  $refsFiltersStore.setSortDirection(data.sortDirection, data.sortField)
  rows.value = data.limit
  $refsFiltersStore.onTableColumns(
    data.displayedColumns,
    tableParams.displayedColumns.options.map((option: optionType) => option.value),
  )
  getRecords(1)
}
</script>
