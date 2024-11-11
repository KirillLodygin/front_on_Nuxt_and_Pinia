<template>
  <div class="h-100 overflow-y-auto">
    <div v-if="loading" class="table-load-bg">
      <div class="table-load">
        <div class="spinner-border" role="status"></div>
        <div>Загрузка данных...</div>
      </div>
    </div>
    <table class="table table-content">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.field || col.key || 'defaultKey'">
            <span class="title" v-if="col.isSwitchOff">{{ col.title || col.label || 'Default Title' }}</span>
            <SortableHeader
              v-else
              :field="col.field || col.key || 'defaultField'"
              :title="col.title || col.label || 'Default Label'"
              :sorted="sortedField === (col.field || col.key || 'defaultField')"
              :sortDirection="col.sortDirection"
              @sort="requestSort"
            />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr class="table-empty w-100 border-0" v-if="!actions.length">
          <td class="p-2 fs-6" colspan="100%">
            <AlertEmpty class="justify-content-center">
              Отсутствуют подходящие записи и предложения, поменяйте настройки фильтра
            </AlertEmpty>
          </td>
        </tr>
        <template v-else>
          <template v-for="(group, groupIndex) in groupedActions">
            <tr class="group-data-row" v-if="showGroupData">
              <td class="group-data" colspan="100%">
                <div class="group-data-wrapper">
                  <span v-if="groupBy === 'date'">
                    {{ group.key }}
                    <span v-if="showDateDifference && groupIndex > 0">(+{{ daysDifference(group.key) }} дней)</span>
                  </span>
                  <span v-else>{{ group.key }}</span>
                  <span class="line"></span>
                </div>
              </td>
            </tr>
            <tr
              v-for="(action, index) in group.items"
              :key="action.index"
              :class="{ 'last-group-row': index === group.items.length - 1 }"
            >
              <td v-for="col in columns" :key="col.field" class="text-center align-middle" :class="col.field">
                <span v-if="col.columnIndex">{{ computeItemIndex(groupIndex, index) }}</span>
                <!-- Тултип для времени экспозиции, если есть причина -->
                <template v-else-if="col.field === 'exposureTime' && action.exposureReason">
                  <span v-b-tooltip.hover :title="String(action.exposureReason)">
                    {{ action.exposureTime }}
                  </span>
                </template>
                <!-- Тултип для изменения цены, если есть причина изменения -->
                <template
                  v-else-if="col.field === 'priceChange' && action.priceChange !== '-' && action.priceChangeReason"
                >
                  <span v-b-tooltip.hover :title="'Причина изменения: ' + action.priceChangeReason">
                    {{ action.priceChange }}
                  </span>
                </template>
                <!-- Проверка и отображение значения без тултипа для других случаев -->
                <template v-else>
                  <template v-if="typeof action[col.field] === 'string' && String(action[col.field]).length !== 0">
                    <i class="icon" :class="action[`${col.field}Icon`]" v-if="action[`${col.field}Icon`]"></i>
                    <template v-if="Array.isArray(action[col.field])">
                      <div class="wrapper">
                        <template v-for="item in action[col.field]" :key="item">
                          <i class="icon" :class="item" v-if="String(item).startsWith('fi')"></i>
                          <span v-else>{{ item }}</span>
                        </template>
                      </div>
                    </template>
                    <span v-else>{{ action[col.field] }}</span>
                  </template>
                  <template v-else-if="typeof action[col.field] === 'number'">
                    <span>{{ action[col.field] }}</span>
                  </template>
                  <template v-else-if="Array.isArray(action[col.field])">
                    <i class="icon" :class="action[`${col.field}Icon`]" v-if="action[`${col.field}Icon`]"></i>
                    <div class="wrapper">
                      <template v-for="item in action[col.field]" :key="item">
                        <i class="icon" :class="item" v-if="String(item).startsWith('fi')"></i>
                        <div v-else>{{ item }}</div>
                      </template>
                    </div>
                  </template>
                  <template v-else>
                    <div class="empty"><i class="icon fi_minus"></i></div>
                  </template>
                </template>
              </td>
            </tr>
          </template>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, computed, ref, watch } from 'vue'
import SortableHeader from '~/components/ObjectsTable/SortableHeader.vue'
import AlertEmpty from '~/components/UI-KIT/Alerts/AlertEmpty.vue'

type SortDirectionType = 'asc' | 'desc' | 'none'

const props = defineProps({
  actions: {
    type: Array as any,
    default: () => [],
  },
  loading: Boolean,
  page: {
    type: Number,
    default: 1,
  },
  itemsPerPage: {
    type: Number,
    default: 10,
  },
  columns: Array as any,
  showGroupData: Boolean,
  groupBy: String,
  propSortDirection: {
    type: String,
    default: undefined,
  },
  propsSortField: {
    type: String,
    required: false,
  },
  showDateDifference: {
    type: Boolean,
    default: true,
  },
  firstNo: {
    type: Number,
    default: 1,
  },
})

const sortedField = ref<string>('')
const sortDirection = ref<SortDirectionType>('asc')

watch(
  () => props.propSortDirection,
  (newSortDirection) => {
    // @ts-ignore
    sortDirection.value = newSortDirection ?? 'none'
    props.columns.find((column: any) => column.field === sortedField.value).sortDirection = sortDirection.value
  },
)

watch(
  () => props.propsSortField,
  (newPropsSortField) => {
    // @ts-ignore
    requestSort(newPropsSortField)
  },
)

const sortedActions = computed(() => {
  if (!sortedField.value) return props.actions ?? []
  return [...(props.actions ?? [])].sort((a, b) => {
    const valueA = a[sortedField.value as keyof any] || ''
    const valueB = b[sortedField.value as keyof any] || ''
    return valueA < valueB ? -1 : (valueA > valueB ? 1 : 0) * (sortDirection.value === 'asc' ? 1 : -1)
  })
})

const computeItemIndex = (groupIndex: number, itemIndex: number) => {
  let index = props.firstNo + 1
  for (let i = 0; i < groupIndex; i++) {
    index += groupedActions.value[Object.keys(groupedActions.value)[i]].length
  }
  return index + itemIndex
}

const groupedActions = computed(() => {
  return sortedActions.value.reduce(
    (acc: any, action: any) => {
      const key = action[props.groupBy as keyof any] as string
      let group = acc.find((g: any) => g.key === key)
      if (!group) {
        group = { key, items: [] }
        acc.push(group)
      }
      group.items.push(action)
      return acc
    },
    [] as Array<{ key: string; items: any[] }>,
  )
})

const earliestKey = ref(groupedActions.value[0]?.key || '')

const convertDate = (d: string) => {
  if (props.groupBy === 'date' && d && d.includes('.')) {
    const [day, month, year] = d.split('.')
    return new Date(`${year}-${month}-${day}`)
  }
  return null
}

const daysDifference = (currentKey: string) => {
  if (props.groupBy !== 'date' || !currentKey) return 0

  const current = convertDate(currentKey)
  const earliest = convertDate(earliestKey.value)
  if (!current || !earliest) return 0

  const diffTime = current.getTime() - earliest.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const emit = defineEmits(['requestSort'])

const requestSort = (field: string = 'defaultField') => {
  // Сбрасываем направление сортировки для всех колонок
  props.columns.forEach((column: any) => {
    if (column.field !== field) {
      column.sortDirection = 'none'
    }
  })

  if (sortedField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : sortDirection.value === 'desc' ? 'none' : 'asc'
    props.columns.find((column: any) => column.field === field).sortDirection = sortDirection.value
  } else {
    sortedField.value = field
    sortDirection.value = 'asc'
    props.columns.find((column: any) => column.field === field).sortDirection = sortDirection.value
  }
}
</script>
