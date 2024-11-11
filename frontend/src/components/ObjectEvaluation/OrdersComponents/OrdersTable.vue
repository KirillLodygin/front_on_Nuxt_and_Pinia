<template>
  <div class="overflow-y-auto position-relative h-100">
    <div v-if="props.loading" class="table-load-bg">
      <div class="table-load">
        <div class="spinner-border" role="status"></div>
        <div>Загрузка данных...</div>
      </div>
    </div>
    <table class="table table-content">
      <thead id="_columns">
        <tr>
          <th class="col-auto align-middle" scope="col">#</th>
          <th v-for="header in sortableHeaderData" class="col-auto align-middle" scope="col">
            <SortableHeader
              :sortDirection="header.sortDirection"
              :sorted="header.sorted"
              :title="header.title"
              field=""
              @click="onColumnClick(header.title)"
            />
          </th>
        </tr>
      </thead>

      <tbody id="_body">
        <tr
          v-for="(order, index) of computedOrders"
          :class="[{ 'table-active': order === activeOrder }, 'table-string']"
          @click="onRowClick(order)"
          @contextmenu="onRowCtx($event, order)"
          @dblclick="onRowDblClick(order)"
        >
          <td>{{ index + 1 }}</td>
          <td>
            {{ getOrderName(order) }}
          </td>
          <td>{{ getEvaluationType(order.evaluation_type) }}</td>
          <td>{{ getEvaluationStatus(order.evaluation_status) }}</td>
          <td>{{ getNormalDate(order.source?.orderUpdated) }}</td>
          <td>{{ order.summary_result }}</td>
          <td>{{ getUserNames(order.owner) }}</td>
        </tr>
      </tbody>
    </table>
    <AlertEmpty v-if="!props.loading && !orders.length">
      Расчеты для объекта не найдены. Чтобы добавить расчёт, воспользуйтесь кнопкой "Новый расчёт"
    </AlertEmpty>
  </div>
</template>

<script lang="ts" setup>
import SortableHeader from '~/components/ObjectsTable/SortableHeader.vue'
import {
  type EATypesInterface,
  type EStatusesInterface,
  EvaluationsApproachesTypes,
  EvaluationsStatuses,
} from '~/app_constants/EvaluationsApproachesTypes'

import { getUserNames, reformatDate } from '~/utils/objectUtils'
import AlertEmpty from '~/components/UI-KIT/Alerts/AlertEmpty.vue'

const props = defineProps({
  orders: { type: Array as PropType<Array<any>>, default: [] },
  activeOrder: { type: Object as PropType<any>, default: null },
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['setActiveOrder', 'onRowCtx', 'openOrder'])

const getOrderName = (order: Record<string, any>) => {
  return order.name
    ? order.name
    : `${getEvaluationType(order.evaluation_type, true)} ${reformatDate(order.order_created)}` +
        (order.source?.aim.tz_number ? ` ТЗ ${order.source?.aim.tz_number}` : '')
}
const getEvaluationType = (type: keyof EATypesInterface, short = false) => {
  if (short) return EvaluationsApproachesTypes[type]?.[0]
  else return EvaluationsApproachesTypes[type]?.[1]
}

const getEvaluationStatus = (type: keyof EStatusesInterface) => {
  return EvaluationsStatuses[type]
}

const getNormalDate = (dateValue: string) => {
  const date = new Date(dateValue)
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' }
  return date.toLocaleDateString('ru-RU', options)
}

const computedOrders = computed(() => {
  return props.orders.sort((a: any, b: any): any => {
    const sortData = sortableHeaderData.value.find((obj: SortableHeaderInterface) => obj.sorted)
    if (sortData) {
      if (sortData.sortDirection === 'asc') {
        if (sortData.field === 'orderUpdated') {
          return a.source[sortData.field].localeCompare(b.source[sortData.field])
        } else if (sortData.field === 'owner') {
          return getUserNames(a[sortData.field]).localeCompare(getUserNames(b[sortData.field]))
        } else {
          return a[sortData.field].toString().localeCompare(b[sortData.field].toString())
        }
      } else if (sortData.sortDirection === 'desc') {
        if (sortData.field === 'orderUpdated') {
          return b.source[sortData.field].localeCompare(a.source[sortData.field])
        } else if (sortData.field === 'owner') {
          return getUserNames(b[sortData.field]).localeCompare(getUserNames(a[sortData.field]))
        } else {
          return b[sortData.field].toString().localeCompare(a[sortData.field].toString())
        }
      }
    } else {
      return b.id - a.id
    }
  })
})

interface SortableHeaderInterface {
  title: string
  field: string
  sortDirection: 'none' | 'asc' | 'desc'
  sorted: boolean
  type: string
}

// данные заголовка таблицы ордеров
const sortableHeaderData: Ref<SortableHeaderInterface[]> = ref([
  { title: 'Название', sortDirection: 'none', sorted: false, field: 'name', type: 'string' },
  { title: 'Тип расчётов', sortDirection: 'none', sorted: false, field: 'evaluation_type', type: 'string' },
  { title: 'Статус', sortDirection: 'none', sorted: false, field: 'evaluation_status', type: 'string' },
  { title: 'Дата изменения', sortDirection: 'none', sorted: false, field: 'orderUpdated', type: 'string' },
  { title: 'Результат', sortDirection: 'none', sorted: false, field: 'summary_result', type: 'string' },
  { title: 'Создал ФИО', sortDirection: 'none', sorted: false, field: 'owner', type: 'string' },
])
// переключение интерфейса сортировки по нажатию на заголовок колонок (пока сортировки данных нет)
const onColumnClick = (title: string) => {
  sortableHeaderData.value.forEach((header: SortableHeaderInterface) => {
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
// обработка нажатия ЛКМ на строку таблицы
const onRowClick = (item: any) => {
  emit('setActiveOrder', item)
}
// обработка нажатия ПКМ на строку таблицы
const onRowCtx = (event: Event, item: any) => {
  emit('onRowCtx', event, item)
}
// обработка двойного нажатия ПКМ на строку таблицы (пока ничего нет)
const onRowDblClick = (item: any) => {
  emit('openOrder')
}
</script>
