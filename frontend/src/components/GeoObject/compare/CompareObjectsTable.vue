<template>
  <div>
    <table class="table table-content" style="table-layout: fixed">
      <thead id="_columns" class="w-100">
        <tr>
          <th
            v-for="header in sortableHeaderData"
            class="col"
            scope="col"
            :style="{ width: header.field !== 'index' ? '15%' : '5%' }"
          >
            <SortableHeader
              v-if="header.field !== 'index'"
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
          v-for="(obj, index) in comparisonObjects"
          :class="[
            {
              'table-active': activeComparisonItem && obj.id === activeComparisonItem.id,
            },
            'table-string',
          ]"
          @click="setActiveComparisonItem(obj)"
          @contextmenu.prevent="onRowCtx($event, obj)"
        >
          <td
            v-for="header in sortableHeaderData"
            class="col new-style-table"
            :style="{ width: header.field !== 'index' ? '15%' : '5%' }"
            :key="header.field"
          >
            <div v-if="header.field === 'index'">{{ index + 1 }}</div>

            <template v-if="header.field !== 'index' && !obj[header.field]">
              <i class="icon fi_minus"></i>
            </template>

            <template v-else>
              <div v-if="header.field === 'object_type'">{{ objectTypes[obj.object_type] }}</div>
              <div v-else-if="header.field === 'func_purpose'">{{ obj.func_purpose.name }}</div>
              <div v-else-if="header.field === 'object_type_calc'">
                <span
                  class="icon-container"
                  v-b-tooltip.hover.html
                  :title="`Объект имеет карточки следующих типов: ${getObjectTypeCalcColumnValue(obj.object_type_calc)
                    .map((i: any) => i.label)
                    .join(', ')}`"
                >
                  <span
                    v-for="icon in getObjectTypeCalcColumnValue(obj.object_type_calc)"
                    :key="icon.icon"
                    v-html="icon.icon"
                  ></span>
                </span>
              </div>
              <div v-else-if="header.field === 'added_date'">{{ obj.added_date.split('-').reverse().join('.') }}</div>
              <div v-else>
                <span v-html="obj[header.field]"></span>
              </div>
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!--контекстное меню таблицы объектов-->
  <ks-dropdown ref="rowCtxMenu" :target="'_body'" drop-pos="pointer">
    <div v-for="buttonData in functionalButtonsData">
      <button
        v-if="buttonData.type === 'button' && buttonData.for.includes('ctx')"
        :disabled="buttonData.disabled"
        class="dropdown-item cursor-pointer"
        @click="buttonData.function"
      >
        <i :class="buttonData.iconClass"></i> {{ buttonData.title }}
      </button>
    </div>
  </ks-dropdown>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import { compareSelectionTableHeaderObject } from '~/app_constants/comparisonTable'
import { objectTypes } from '~/app_constants/comparisonConsts'
import type { SortableHeaderType } from '~/types/objectEvaluationType'
import type { objectTypeCalcColumnValueType } from '~/types/comparisonTypes'

import SortableHeader from '~/components/ObjectsTable/SortableHeader.vue'
import KsDropdown from '~/components/MapComponent/KsDropdown.vue'

const { $comparison } = useNuxtApp()

interface Props {
  functionalButtonsData: Array<Record<string, any>>
}

const props = defineProps<Props>()

const emit = defineEmits(['onIsActiveFunctionalButtons', 'onItemSelect'])

const showMap = ref(false)
const sortableHeaderData: Ref<SortableHeaderType[]> = ref(compareSelectionTableHeaderObject)
const rowCtxMenu: any = ref(null)

const distanceObjects = computed(() => $comparison.distanceObjects)
const comparisonObjects = computed(() =>
  $comparison.currentComparisonObjects.sort((a: any, b: any): any => {
    const sortData = sortableHeaderData.value.find((obj: SortableHeaderType) => obj.sorted)
    if (sortData) {
      if (sortData.sortDirection === 'asc') {
        if (sortData.field === 'all_types') {
          return a.all_types[a.type].distance - b.all_types[b.type].distance
        }
        return (a[sortData.field] ? a[sortData.field] : '')
          .toString()
          .localeCompare((b[sortData.field] ? b[sortData.field] : '').toString())
      } else if (sortData.sortDirection === 'desc') {
        if (sortData.field === 'all_types') {
          return b.all_types[b.type].distance - a.all_types[a.type].distance
        }
        return (b[sortData.field] ? b[sortData.field] : '')
          .toString()
          .localeCompare((a[sortData.field] ? a[sortData.field] : '').toString())
      }
    } else {
      return b.id - a.id
    }
  }),
)
const activeComparisonItem = computed(() => $comparison.activeComparisonItem)
const isDisabled = computed(() => !$comparison.pricingFactorsArr.map((item) => item.is_checked).includes(true))

watch(
  () => isDisabled.value,
  () => {
    if (!isDisabled.value) {
      $comparison.isUpdateComparisonObjects(comparisonObjects.value)
    }
  },
)

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

const isCheckedInstanceObject = (field: string) => {
  $comparison.isCheckedInstanceObject(field)
}

const setActiveComparisonItem = (obj: Record<string, any>) => {
  $comparison.setActiveComparisonItem(obj)
  emit('onIsActiveFunctionalButtons')
  emit('onItemSelect', obj)
}

// нажатие правой кнопкой мыши на строку объекта
const onRowCtx = (event: Event, obj: Record<string, any>) => {
  if (!activeComparisonItem.value || obj.id !== activeComparisonItem.value.id) return
  if (rowCtxMenu.value) rowCtxMenu.value.show(event)
}

const getObjectTypeCalcColumnValue = (value: objectTypeCalcColumnValueType) => {
  return $comparison.getObjectTypeCalcColumnValue(value)
}

const setNewDistanceValue = (value: string, field: string) => {
  $comparison.setNewDistanceValue(value, field)
}
</script>

<style lang="scss" scoped>
.new-style-table {
  word-break: break-word;
  overflow-wrap: break-word;
}
</style>
