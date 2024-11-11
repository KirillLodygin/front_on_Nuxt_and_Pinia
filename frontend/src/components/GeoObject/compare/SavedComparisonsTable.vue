<template>
  <table class="table table-content" style="table-layout: fixed">
    <thead id="_columns" class="w-100">
      <tr>
        <th v-for="header in sortableHeaderData" class="col" scope="col" :style="{ width: getPercents(header.field) }">
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
        :class="[
          {
            'table-active': compareId === currentComparisonList,
          },
          'table-string',
        ]"
        @click="onIsCurrentCompareOnFocus"
      >
        <td>—</td>
        <td>Текущий список сравнения</td>
        <td>Список сравнения по умолчанию</td>
        <td>{{ comparisonObjectsLength === 0 ? '—' : String(comparisonObjectsLength) }}</td>
        <td>{{ comparisonObjectsLength === 0 ? '—' : reformatDate(new Date().toISOString()) }}</td>
      </tr>
      <tr>
        <td colspan="5">
          <div style="font-weight: 600">Сохранённые сравнения</div>
        </td>
      </tr>
      <tr
        v-for="(obj, index) in comparisonObjects"
        @click="setCompareId(obj.id)"
        :class="[
          {
            'table-active': compareId && obj.id === compareId,
          },
          'table-string',
        ]"
      >
        <td>{{ index + 1 }}</td>
        <td>{{ obj.name }}</td>
        <td>{{ obj.description }}</td>
        <td>{{ String(obj.comparation_objects.length) }}</td>
        <td>{{ obj.modified_date ? reformatDate(obj.modified_date) : reformatDate(obj.added_date) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import { savedCompareSelectionTableHeaderObject } from '~/app_constants/comparisonTable'
import type { SortableHeaderType } from '~/types/objectEvaluationType'
import { reformatDate } from '~/utils/objectUtils'
import { currentComparisonList } from '~/app_constants/comparisonConsts'

import SortableHeader from '~/components/ObjectsTable/SortableHeader.vue'

const { $comparison } = useNuxtApp()

interface Props {
  functionalButtonsData: Array<Record<string, any>>
}

const props = defineProps<Props>()

const sortableHeaderData: Ref<SortableHeaderType[]> = ref(savedCompareSelectionTableHeaderObject)

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

const comparisonObjectsLength = computed(() => $comparison.comparisonObjects.length)

const comparisonObjects = computed(() =>
  $comparison.savedComparisonsList.sort((a: any, b: any): any => {
    const sortData = sortableHeaderData.value.find((obj: SortableHeaderType) => obj.sorted)
    if (sortData) {
      if (sortData.sortDirection === 'asc') {
        if (sortData.field === 'modified_by') {
          const aVal = a[sortData.field] ? reformatDate(a[sortData.field]) : reformatDate(a.added_date)
          const bVal = b[sortData.field] ? reformatDate(b[sortData.field]) : reformatDate(b.added_date)
          return aVal.toString().localeCompare(bVal.toString())
        }

        if (sortData.field === 'obj_arr_length') {
          const aVal = a.comparation_objects.length
          const bVal = b.comparation_objects.length
          return aVal - bVal
        }

        return a[sortData.field].toString().localeCompare(b[sortData.field].toString())
      } else if (sortData.sortDirection === 'desc') {
        if (sortData.field === 'modified_by') {
          const aVal = a[sortData.field] ? reformatDate(a[sortData.field]) : reformatDate(a.added_date)
          const bVal = b[sortData.field] ? reformatDate(b[sortData.field]) : reformatDate(b.added_date)
          return bVal.toString().localeCompare(aVal.toString())
        }

        if (sortData.field === 'obj_arr_length') {
          const aVal = a.comparation_objects.length
          const bVal = b.comparation_objects.length
          return bVal - aVal
        }

        return b[sortData.field].toString().localeCompare(a[sortData.field].toString())
      }
    } else {
      return b.id - a.id
    }
  }),
)

const compareId = computed(() => $comparison.compareId)

const getPercents = (field: string) => {
  if (field === 'index') return '4%'
  if (['name', 'description'].includes(field)) return '34%'
  if (field === 'obj_arr_length') return '18%'
  return '10%'
}

const setCompareId = (objId: number) => {
  $comparison.setCompareId(objId)
}

const onIsCurrentCompareOnFocus = () => {
  $comparison.setCompareId(currentComparisonList)
}
</script>
