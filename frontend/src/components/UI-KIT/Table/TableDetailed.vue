<template>
  <BAccordion flush free>
    <template v-if="meaning && meaning.length">
      <BAccordionItem
        v-for="(item, index) in meaning"
        :visible="index === 0"
        :key="item?.id"
        :value="item.id"
        :title="hasRegion(item)"
        body-class="table-accordion-body"
      >
        <table class="table table-content">
          <thead id="_columns">
            <tr v-if="tableHeaderStructure?.length">
              <th v-for="(header, index) in tableHeaderStructure" :key="index" :colspan="header.colspan" scope="col">
                <span>{{ header.title }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <TableRow
              v-for="tableRow in filteredTableBodyArr(item)"
              :key="tableRow.id"
              :table-row="tableRow.body"
              :headers="tableHeaderStructure"
              :is-formula="isFormula"
            />
          </tbody>
        </table>
      </BAccordionItem>
    </template>
  </BAccordion>
</template>

<script lang="ts" name="TableDetailed" setup>
import { defineProps, computed } from 'vue'
import type { bookType, bookJsonStringType } from '~/types/calculationsTypes'
import TableRow from '~/components/UI-KIT/Table/TableRow.vue'

const tableHeaderStructure = computed(() => {
  const headerRow = props.meaning[0]?.json_data[0]
  const structure: { title: string; colspan: number }[] = []

  if (headerRow) {
    let lastTitle = String(headerRow[0])
    let colspan = 1

    for (let i = 1; i < headerRow.length; i++) {
      let title = String(headerRow[i])

      if (title === lastTitle) {
        colspan++
      } else {
        structure.push({ title: lastTitle, colspan })
        lastTitle = title
        colspan = 1
      }
    }

    structure.push({ title: lastTitle, colspan })
  }

  return structure
})

type tableBodyArrType = {
  id: number
  body: bookJsonStringType
}

const props = defineProps({
  meaning: {
    type: Array as PropType<bookType[]>,
    required: true,
    default: [],
  },
  isFormula: {
    type: Boolean,
    required: false,
    default: false,
  },
  page: {
    type: String,
    required: false,
    default: '',
  },
})

const hasRegion = (item: bookType) => {
  return item.region ? item.region : undefined
}

const tableHeaderArr = computed(() => {
  return props.meaning[0]?.json_data[0]
})

const filteredTableHeader = computed(() => {
  return tableHeaderArr.value.filter((header: any) => !!header)
})

const tableBodyArr = (el: bookType): Array<tableBodyArrType> =>
  el.json_data.slice(1).map((item: bookJsonStringType, index: number) => ({ id: index, body: item }))

// Фильтрация тела таблицы с удалением дубликатов
const filteredTableBodyArr = (el: bookType): Array<tableBodyArrType> => {
  if (props.page === 'references') {
    // Логика для страницы 'references'
    const headers = props.meaning[0]?.json_data[0] || []
    return el.json_data.slice(1).reduce((acc: tableBodyArrType[], item, index) => {
      const hasDuplicate = item.some((cell, cellIndex) => {
        return String(headers[cellIndex]).trim() === String(cell).trim()
      })
      if (!hasDuplicate) {
        acc.push({ id: index, body: item })
      }
      return acc
    }, [])
  } else {
    // Дефолтная логика
    return tableBodyArr(el)
  }
}
</script>
