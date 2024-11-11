<template>
  <div class="history-card-summary__wrapper-main d-flex w-100 h-100">
    <div class="wrapper-main__table-card w-100 justify-content-between h-100">
      <div class="table-card-wrapper d-flex flex-column gap-3 h-100 overflow-y-hidden">
        <div class="filters d-flex align-items-center">
          <div class="filters-left__date bg-body-secondary p-2 rounded-3">
            <i class="icon icon-lg fi_filter"></i>
            <span>с</span>
            <DatePickerInput class="rounded-3 date-input" type="date" v-model="startDate" />
            <span>по</span>
            <DatePickerInput class="rounded-3 date-input" type="date" v-model="endDate" />
          </div>
          <button class="btn bth-tool rounded-3" @click="toggleModal">
            <i class="icon fi_sliders"></i>
            Параметры
          </button>
        </div>
        <HistoryTable
          class="history-card__table"
          :actions="paginatedActions"
          :items-per-page="itemsPerPage"
          :loading="$userProfile.loading"
          :page="page"
          :columns="visibleColumns"
          :propSortDirection="tableParamsData.sortDirection"
          :propsSortField="tableParamsData.sortField"
          :firstNo="startIndex"
        />
      </div>
      <Pager
        :page="page"
        :pages="pages"
        :records="records"
        class="px-1 pb-1"
        @onChange="getRecords"
        @onRefresh="getRecords(page)"
      />
    </div>
  </div>
  <TableSettingsModal
    class="history-card-summary__parameters-modal"
    v-model="isModalVisible"
    :data="tableParamsData"
    :table-params="tableParams"
    @accept-parameters="acceptParameters"
  />
</template>

<script lang="ts" setup>
import HistoryTable from '~/components/UI-KIT/Table/HistoryTable.vue'
import Pager from '~/components/UI-KIT/Table/Pager.vue'
import TableSettingsModal from '~/components/UI-KIT/Modals/TableSettingsModal.vue'
import { useTableParams } from '~/composables/TableParams/UserProfile'
import DatePickerInput from '~/components/UI-KIT/Inputs/DatePickerInput.vue'

const { $userProfile }: any = useNuxtApp()

const tableColumns = ref($userProfile.tableColumns)
const actions = computed(() => $userProfile.items)

const page = ref<number>(1)

const itemsPerPage = 11
const isModalVisible = ref(false)
const startIndex = ref<number>(1)

const visibleColumns = computed(() => {
  const filtersColumns = tableColumns.value.filter((column: any) =>
    tableParamsData.value.displayedColumns.includes(column.field),
  )
  return filtersColumns
})

const today = new Date()
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
// const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

const startDate = ref(firstDayOfMonth.toISOString().substring(0, 10))
const endDate = ref(today.toISOString().substring(0, 10))

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '' // Если dateString не определен, возвращаем пустую строку
  const parts = dateString.split('.')
  if (parts.length !== 3) return ''
  const day = parts[0].padStart(2, '0')
  const month = parts[1].padStart(2, '0')
  const year = parts[2]
  return `${year}-${month}-${day}`
}

const filteredByDateActions = computed(() => {
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)

  return actions.value.filter((action: any) => {
    const actionDate = action.updated
    if (!actionDate) return false // Если дата не корректная, исключаем запись из результатов
    const actionDateObj = new Date(actionDate)
    return actionDateObj && !isNaN(start.getTime()) && !isNaN(end.getTime())
      ? actionDateObj >= start && actionDateObj <= end
      : true
  })
})

const records = computed(() => filteredByDateActions.value.length)
const pages = computed(() => Math.ceil(records.value / tableParamsData.value.limit))

const paginatedActions = computed(() => {
  startIndex.value = (page.value - 1) * tableParamsData.value.limit
  return filteredByDateActions.value.slice(startIndex.value, startIndex.value + tableParamsData.value.limit)
})

const getRecords = async (_page: number) => {
  page.value = _page
}

const toggleModal = () => {
  isModalVisible.value = !isModalVisible.value
}

onMounted(() => {
  $userProfile.getObjects()
})

const { tableParams } = useTableParams()

interface TableParamsDataInterface {
  limit: number
  displayedColumns: string[]
  groupingField: string
  sortField: string
  sortDirection: string
}

const tableParamsData = ref({
  limit: 15,
  displayedColumns: ['index', 'type', 'address', 'updated'],
  sortField: 'updated',
  sortDirection: 'desc',
})

const acceptParameters = (data: TableParamsDataInterface) => {
  tableParamsData.value = JSON.parse(JSON.stringify(data))
  getRecords(page.value)
}
</script>

<style lang="scss" scoped>
.history-card__table {
  :deep(tr td.index) {
    min-width: 56px;
  }
}
</style>
