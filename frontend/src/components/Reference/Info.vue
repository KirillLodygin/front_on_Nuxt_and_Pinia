<template>
  <div class="info-block overflow-auto d-flex gap-5">
    <div
      v-for="(column, columnIndex) in infoColumns"
      :key="`column-${columnIndex}`"
      class="d-flex flex-column gap-3 w-50"
    >
      <div v-for="item in column" :key="`item-${item.label}`">
        <div class="text-muted">{{ item.label }}</div>
        <span>{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, withDefaults } from 'vue'

interface DataProps {
  data: {
    name_unique?: string
    source_to_report?: string
    source_to_report_footnote?: string
    source_to_report_footnote_unique?: string
    type?: string
    source?: string
    type_calc?: string
    type_data?: string
    formula?: string
    date_book?: string
    date_begin?: string
    date_end?: string
  } | null // Используем null в качестве значения по умолчанию
}

// Определяем props с null в качестве значения по умолчанию для data
const props = withDefaults(defineProps<DataProps>(), {
  data: null,
})

const { $refsFiltersStore } = useNuxtApp()

const convertDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

const infoColumns = computed(() => {
  // Возвращаем пустые списки, если data не определено
  if (!props.data) return [[], [], []]

  return [
    [
      { label: 'Название', value: props.data?.name_unique || undefined },
      { label: 'Источник информации (в отчет под таблицей)', value: props.data?.source_to_report || undefined },
      { label: 'Источник информации (сноска в отчет)', value: props.data?.source_to_report_footnote || undefined },
      {
        label: 'Источник информации (уникальные данные для сноски в отчет)',
        value: props.data?.source_to_report_footnote_unique || undefined,
      },
    ],
    [
      { label: 'Тип недвижимости', value: $refsFiltersStore.getColumnValue(props.data?.type || '', 'type') },
      { label: 'Источник информации', value: props.data?.source },
      { label: 'Тип сделки', value: $refsFiltersStore.getColumnValue(props.data?.type_calc || '', 'type_calc') },
      {
        label: 'Тип данных в справочнике',
        value:
          props.data?.type_data === 'F' && props.data?.formula !== 'None'
            ? `Формула: ${props.data?.formula}`
            : $refsFiltersStore.getColumnValue(props.data?.type_data || '', 'type_data'),
      },
    ],
    [
      { label: 'Дата справочника', value: convertDate(props.data?.date_book || '') },
      { label: 'Период использования справочника (начало)', value: convertDate(props.data?.date_begin || '') },
      { label: 'Период использования справочника (конец)', value: convertDate(props.data?.date_end || '') },
    ],
  ]
})
</script>
