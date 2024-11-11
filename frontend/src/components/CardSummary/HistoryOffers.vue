<template>
  <div class="history-card-summary__wrapper-main d-flex w-100 h-100">
    <div class="wrapper-main__table-card w-100 justify-content-between h-100">
      <div class="table-card-wrapper d-flex flex-column gap-3 h-100 overflow-y-hidden">
        <div class="filters">
          <div class="filters-left d-flex">
            <div class="filters-left__date">
              <i class="icon icon-lg fi_filter"></i>
              <span>с</span>
              <DatePickerInput
                v-model="startDate"
                placeholder="дд.мм.гггг"
                :maxDate="endDate"
                required
              />
              <span>по</span>
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
            <CustomDropDown
              class="filters-left__area"
              v-model="selectedPlatforms"
              :dropDownClass="'areas'"
              :title="'Площадка'"
              :text="'&nbsp;'"
              :options="platformOptions"
            />
          </div>
          <div class="filters-right d-flex">
            <div aria-label="Простой пример" class="btn-group ms-auto" role="group">
              <button :class="['btn bth-tool', { active: selectedTab }]" type="button" @click="selectedTab = true">
                Развернуто
              </button>
              <button :class="['btn bth-tool', { active: !selectedTab }]" type="button" @click="selectedTab = false">
                Сжато
              </button>
            </div>
            <button class="btn bth-tool rounded-3" @click="toggleModal">
              <i class="icon fi_sliders"></i>
              Параметры
            </button>
          </div>
        </div>
        <HistoryTable
          class="history-card__table"
          :class="selectedTab ? 'normal' : 'compressed'"
          :actions="selectedTab ? paginatedActions : compactActions"
          :items-per-page="itemsPerPage"
          :loading="loading"
          :page="page"
          :columns="visibleColumns"
          :showGroupData="visibleGroupActions"
          :groupBy="tableParamsData.groupingField"
          :propSortDirection="tableParamsData.sortDirection || 'none'"
          :propsSortField="tableParamsData.sortField || 'defaultField'"
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
import DatePickerInput from "~/components/UI-KIT/Inputs/DatePickerInput.vue";
import TableSettingsModal from '~/components/UI-KIT/Modals/TableSettingsModal.vue'
import CustomDropDown from '~/components/UI-KIT/DropDowns/CustomDropDown.vue'
import { useTableParamsHistoryOffers } from '~/composables/CardSummary/useTableParamsHistoryOffers'
import { usePriceChange } from '~/composables/CardSummary/usePriceChange'

const { $historyOffers }: any = useNuxtApp()

interface Props {
  id: number
}

const props = defineProps<Props>()

const tableColumns = ref($historyOffers.tableColumns)
const actions = computed(() => $historyOffers.items)

const loading = ref<boolean>(false)
const page = ref<number>(1)

const itemsPerPage = 11
const isModalVisible = ref(false)

const selectedTab = ref(true)

const visibleColumns = computed(() => {
  return tableColumns.value.filter((column: any) => tableParamsData.value.displayedColumns.includes(column.field))
})

const visibleGroupActions = computed(() => {
  return tableParamsData.value.groupingField !== 'no'
})

// Форматирование дат для DatePickerInput
const formatDateForPicker = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

// Преобразование дат в формате "дд.мм.гггг" обратно в "YYYY-MM-DD"
const parsePickerDate = (dateString: string): string => {
  const [day, month, year] = dateString.split('.')
  return `${year}-${month}-${day}`
}

// Установка начальной и конечной дат в формате "дд.мм.гггг"
const today = new Date()
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

const startDate = ref(formatDateForPicker(firstDayOfMonth))
const endDate = ref(formatDateForPicker(lastDayOfMonth))

const selectedTypes = ref<any[]>([])
const selectedPlatforms = ref<any[]>([])

// Фильтрация действий по диапазону дат
const filteredByDateActions = computed(() => {
  const start = new Date(parsePickerDate(startDate.value))
  const end = new Date(parsePickerDate(endDate.value))

  return actions.value.filter((action: any) => {
    const actionDate = new Date(parsePickerDate(action.date))
    return actionDate && !isNaN(start.getTime()) && !isNaN(end.getTime())
      ? actionDate >= start && actionDate <= end
      : true
  })
})

// Основная фильтрация действий с учетом типов и площадок
const filteredActions = computed(() => {
  return filteredByDateActions.value.filter((action: any) => {
    const isSale = action.ads_type === 'Продажа'
    const actionType = isSale ? 'sale' : 'rent'
    const platformMatch =
      selectedPlatforms.value.length === 0 ||
      selectedPlatforms.value.includes(action.venue ? action.venue?.toLowerCase() : 'Нет')

    return (selectedTypes.value.length === 0 || selectedTypes.value.includes(actionType)) && platformMatch
  })
})

const { actionsWithPriceChange } = usePriceChange(filteredActions)

const typeOptions: any = computed(() => {
  const uniqueTypes = [
    ...new Set(filteredByDateActions.value.map((action: any) => (action.ads_type === 'Продажа' ? 'sale' : 'rent'))),
  ]
  return uniqueTypes.map((type) => ({ value: type, text: type === 'sale' ? 'Продажа' : 'Аренда' }))
})

const platformOptions: any = computed(() => {
  const platformMap = new Map()

  filteredByDateActions.value.forEach((action: any) => {
    const platformKey = `${action.venue?.toLowerCase() || 'Нет'}-${action.ads_type}`

    if (!platformMap.has(platformKey)) {
      platformMap.set(platformKey, {
        value: action.venue?.toLowerCase() || 'Нет',
        text: action.venue?.toLowerCase() || 'Нет',
        adsType: action.ads_type,
      })
    }
  })

  return Array.from(platformMap.values())
})

const compactActions: any = computed(() => {
  return paginatedActions.value.map((action: any) => {
    const compactAction: Record<string, any> = {
      date: action.date,
      exposureTime: action.exposureTime,
    }

    platformOptions.value.forEach((platform: any) => {
      if (typeof platform === 'object' && (action.venue ? action.venue.toLowerCase() : 'Нет') === platform.value) {
        const dataElements = []
        if (action.eventNameIcon) {
          dataElements.push(action.eventNameIcon)
        }
        if (action.sellingPrice) {
          dataElements.push(action.sellingPrice)
        } else {
          dataElements.push(action.rentalPrice)
        }
        if (action.priceChange) {
          dataElements.push(action.priceChange)
        }
        compactAction[platform.value] = dataElements
      }
    })

    return compactAction
  })
})

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

const updateDisplayedColumns = () => {
  const columnsToInclude = ['id', 'eventName', 'venue', 'date', 'exposureTime', 'priceChange']
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
  $historyOffers.getChoices()
  updateDisplayedColumns()
  $historyOffers.getObjects(props.id, 'analogs')
})

const { tableParams } = useTableParamsHistoryOffers()

interface TableParamsDataInterface {
  limit: number
  displayedColumns: string[]
  groupingField: string
  sortField: string
  sortDirection: string
}

const tableParamsData = ref({
  limit: 15,
  displayedColumns: ['index', 'eventName', 'venue', 'date', 'exposureTime', 'sellingPrice', 'priceChange'],
  groupingField: 'no',
  sortField: 'date',
  sortDirection: 'desc',
})

const acceptParameters = (data: TableParamsDataInterface) => {
  tableParamsData.value = JSON.parse(JSON.stringify(data))
  getRecords(page.value)
}

</script>
