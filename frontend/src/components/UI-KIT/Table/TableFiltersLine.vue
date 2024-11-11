<template>
  <div class="filters-line">
    <template v-for="key of filtersKeys" :key="key">
      <div v-if="props.tableHeaderFilters[key]" class="filter-ticket">
        {{ `${key}: ${props.tableHeaderFilters[key]}` }}
        <a
          v-if="
            !(
              key === 'Тип объекта для оценки' ||
              ((key === 'Тип объекта' || key === 'Связь с объектом') && $geoObject.linkExistingCardTable) ||
              ((key === 'Тип объекта' || key === 'Привязан к объекту') && $geoObject.linkExistingObjectsTable)
            )
          "
          href="#"
          class="icon-link"
          @click="emitDeleteFilter(key)"
        >
          <i class="icon icon-bold fi_x filter-ticket-cross" />
        </a>
      </div>
    </template>
  </div>
</template>

<script setup name="TableFiltersLine" lang="ts">
import { computed, defineProps, defineEmits } from 'vue'
import { type tableHeaderFiltersType } from '~/types/objectsFiltersStoreTypes'

const props = defineProps({
  tableHeaderFilters: { type: Object as PropType<tableHeaderFiltersType>, required: true },
  onDeleteFilter: Function as PropType<(key: string) => void>, // Опциональный пропс
})

const { $filtersStore, $geoObject } = useNuxtApp()
const emit = defineEmits(['deleteFilter'])

const filtersKeys = computed(() => Object.keys(props.tableHeaderFilters))

const emitDeleteFilter = (key: string) => {
  if (props.onDeleteFilter) {
    props.onDeleteFilter(key)
  } else {
    $filtersStore.deleteFilter(key)
  }
}
</script>
