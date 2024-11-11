<template>
  <div class="history-card-summary__wrapper-main d-flex w-100 h-100">
    <div class="wrapper-main__table-card w-100 justify-content-between h-100">
      <div class="table-card-wrapper d-flex flex-column gap-3 h-100 overflow-y-hidden">
        <div class="filters">
          <div class="filters-left d-flex">
            <div class="filters-left__date">
              <i class="icon icon-lg fi_filter"></i>
              <span>с</span>
              <!-- Используем кастомный компонент календаря для начальной даты -->
              <DatePickerInput
                v-model="startDate"
                placeholder="дд.мм.гггг"
                :maxDate="endDate"
                required
              />
              <span>по</span>
              <!-- Используем кастомный компонент календаря для конечной даты -->
              <DatePickerInput
                v-model="endDate"
                placeholder="дд.мм.гггг"
                :minDate="startDate"
                required
              />
            </div>
            <CustomDropDown
              class="filters-left__type"
              v-model="selectedTypes"
              :dropDownClass="'types'"
              :title="'Тип'"
              :text="'&nbsp;'"
              :options="typeOptions"
            />
          </div>

          <div class="filters-right d-flex">
            <button class="btn bth-tool rounded-3" @click="toggleModal">
              <i class="icon fi_sliders"></i>
              Параметры
            </button>
          </div>
        </div>
        <HistoryTable
          class="history-card__table"
          :class="selectedTab === 1 ? 'compressed' : 'normal'"
          :actions="paginatedActions"
          :items-per-page="itemsPerPage"
          :loading="loading"
          :page="page"
          :columns="visibleColumns"
          :showGroupData="vibleGroupActions"
          :groupBy="tableParamsData.groupingtField"
          :propSortDirection="tableParamsData.sortDirection || 'none'"
          :propsSortField="tableParamsData.sortField || 'defaultField'"
          :showDateDifference="false"
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
import CustomDropDown from '~/components/UI-KIT/DropDowns/CustomDropDown.vue'
import DatePickerInput from "~/components/UI-KIT/Inputs/DatePickerInput.vue";
import { useTableParamsHistoryEstimation } from '~/composables/CardSummary/useTableParamsHistoryEstimation'
import { usePriceChange } from '~/composables/CardSummary/usePriceChange'

const { $historyEstimation }: any = useNuxtApp()

interface Props {
  id: number
}

const props = defineProps<Props>()

const tableColumns = ref($historyEstimation.tableColumns)
const actions = computed(() => $historyEstimation.items)
const choices = computed(() => $historyEstimation.choices)

const loading = ref<boolean>(false)
const page = ref<number>(1)

const itemsPerPage = 11
const isModalVisible = ref(false)

const selectedTab = ref(0)

const visibleColumns = computed(() => {
  return tableColumns.value.filter((column: any) => tableParamsData.value.displayedColumns.includes(column.field))
})

const vibleGroupActions = computed(() => {
  return tableParamsData.value.groupingtField !== 'no'
})

// Получаем текущую дату и первый/последний день текущего месяца
const today = new Date()
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

// Форматируем начальную и конечную даты в формат "дд.мм.гггг" для компонента DatePickerInput
const formatDateForPicker = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

// Устанавливаем начальные значения startDate и endDate в формате "дд.мм.гггг"
const startDate = ref(formatDateForPicker(firstDayOfMonth))
const endDate = ref(formatDateForPicker(lastDayOfMonth))

// Логика для приведения даты обратно в формат "YYYY-MM-DD" при фильтрации
const parsePickerDate = (dateString: string): string => {
  const [day, month, year] = dateString.split('.')
  return `${year}-${month}-${day}`
}

const filteredActions = computed(() => {
  const start = new Date(parsePickerDate(startDate.value))
  const end = new Date(parsePickerDate(endDate.value))

  return actions.value
    .filter((action: any) => {
      const adsType = selectedTypes.value.includes(action.ads_type)
      const actionDate = new Date(parsePickerDate(action.date))
      return !isNaN(actionDate.getTime()) && !isNaN(start.getTime()) && !isNaN(end.getTime())
        ? actionDate >= start && actionDate <= end
        : true
    })
    .sort((a: any, b: any) => {
      const field = tableParamsData.value.sortField
      const direction = tableParamsData.value.sortDirection === 'asc' ? 1 : -1
      if (a[field] < b[field]) return -1 * direction
      if (a[field] > b[field]) return 1 * direction
      return 0
    })
})

const { actionsWithPriceChange } = usePriceChange(filteredActions)

const records = computed(() => filteredActions.value.length)
const pages = computed(() => Math.ceil(records.value / tableParamsData.value.limit))

const paginatedActions = computed(() => {
  const startIndex = (page.value - 1) * tableParamsData.value.limit
  return actionsWithPriceChange.value.slice(startIndex, startIndex + tableParamsData.value.limit)
})

const getRecords = async (_page: number) => {
  page.value = _page
}

const toggleModal = () => {
  isModalVisible.value = !isModalVisible.value
}

const selectedTypes = ref<any[]>([])

const typeOptions: any = computed(() => {
  const uniqueTypes = [
    ...new Set(
      filteredActions.value.map((action: any) => {
        if (action.ads_type === 'Продажа') {
          return 'sale'
        } else if (action.ads_type === 'Аренда') {
          return 'rent'
        } else {
          return 'unknown'
        }
      }),
    ),
  ]

  return uniqueTypes
    .filter((type) => type !== 'unknown')
    .map((type) => ({ value: type, text: type === 'sale' ? 'Продажа' : 'Аренда' }))
})

const updateDisplayedColumns = () => {
  const columnsToInclude = ['id', 'eventName', 'date']
  const hasSale = filteredActions.value.some((action: any) => action.ads_type === 'Продажа')
  const hasRent = filteredActions.value.some((action: any) => action.ads_type === 'Аренда')
  if (hasSale) {
    columnsToInclude.push('sellingPrice')
  }
  if (hasRent) {
    columnsToInclude.push('rentalPrice')
  }
  tableParamsData.value.displayedColumns = columnsToInclude
}

watch(filteredActions, () => {
  updateDisplayedColumns()
})

onMounted(() => {
  $historyEstimation.getChoices()
  updateDisplayedColumns()
  $historyEstimation.getObjects(props.id, 'evaluations')
  console.log('tableParamsData', tableParamsData.value.displayedColumns)
})

const { tableParams } = useTableParamsHistoryEstimation()

interface TableParamsDataInterface {
  limit: number
  displayedColumns: string[]
  groupingtField: string
  sortField: string
  sortDirection: string
}

const tableParamsData = ref<TableParamsDataInterface>({
  limit: 15,
  displayedColumns: [],
  groupingtField: 'no',
  sortField: 'date',
  sortDirection: 'asc',
})

const acceptParameters = (data: TableParamsDataInterface) => {
  tableParamsData.value = JSON.parse(JSON.stringify(data))
  getRecords(page.value)
}

watch(
  tableParamsData,
  () => {
    getRecords(page.value)
  },
  { deep: true },
)

</script>

<style lang="scss" scoped>
.filters-left {
  justify-content: start !important;
}
</style>
