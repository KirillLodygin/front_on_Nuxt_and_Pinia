<template>
  <div class="filters-wrapp" :class="{ 'h-100': filters }">
    <h6 class="sort-header">Параметры фильтрации</h6>
    <div class="filters-list">
      <template v-if="filters">
        <LoadingCover v-if="loading" />
        <div v-else>
          <!-- Сценарий с переданными пропсами -->
          <template v-for="filter of filtersSorted" :key="filter.label">
            <template v-if="store === 'reference'">
              <ReferenceFilterBlock :filter="filter" :is-all-filters="true" />
            </template>
            <template v-else>
              <FilterBlock :filter="filter" :store="store" :is-all-filters="true" />
            </template>
          </template>
        </div>
      </template>
      <template v-else>
        <!-- Сценарий по умолчанию -->
        <template v-for="(filter, index) in allFilters" :key="filter.label">
          <FilterBlock :filter="filter" :is-all-filters="true" :is-last-filter="index === allFilters.length - 1" />
        </template>
      </template>
    </div>
    <FiltersButton :store="store" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, defineProps, watch } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import FilterBlock from '~/components/UI-KIT/FilterTable/FilterBlock.vue'
import FiltersButton from '~/components/UI-KIT/Buttons/ButtonsGroup/FiltersButtons.vue'
import LoadingCover from '~/components/UI-KIT/Loaders/LoadingCover.vue'
import type { filterType as inputValueType, choiceType, intervalValuesType } from '~/types/objectsFiltersStoreTypes'

// Определение пропсов
const props = defineProps<{
  filters?: any[]
  store?: string | any
}>()

const loading = ref(true) // состояние загрузки

interface CommonFilterType {
  label?: string
  field: string
  type: string
  value?: any
  input?: inputValueType
  intervalValues?: intervalValuesType
  choices?: Array<choiceType>
  isOpen?: boolean
}

const filtersSorted = computed(() => {
  if (props.filters && props.store && typeof props.store !== 'string' && props.store.filtersMenu) {
    const filterFieldsSet = new Set(props.store.filtersMenu)
    const filteredAndSortedFilters = props.filters
      .filter((filter: any) => filterFieldsSet.has(filter.field))
      .sort((a: any, b: any) => props.store.filtersMenu.indexOf(a.field) - props.store.filtersMenu.indexOf(b.field))
    return filteredAndSortedFilters
  }
  return props.filters || []
})

const { $filtersStore }: any = useNuxtApp()

const allFilters = computed(() => {
  if (!props.filters && $filtersStore.searchParams.object_type_calc) {
    const nameIndex = $filtersStore.allFilteredFields[$filtersStore.searchParams.object_type_calc].reduce(
      (obj: Record<string, number>, fieldName: string, index: number) => {
        obj[fieldName] = index
        return obj
      },
      {},
    )
    return $filtersStore.allFilters
      .filter(
        (filter: CommonFilterType) =>
          $filtersStore.allFilteredFields[$filtersStore.searchParams.object_type_calc].includes(filter.field) ||
          filter.value,
      )
      .sort((a: CommonFilterType, b: CommonFilterType) => nameIndex[a.field] - nameIndex[b.field])
  } else {
    return []
  }
})

watch(filtersSorted, (newVal: any) => {
  if (newVal.length > 0) {
    loading.value = false
  }
})

onMounted(() => {
  if (filtersSorted.value.length > 0) {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
:deep(.filter-references) {
  #searchByParamsInput {
    padding-right: 40px;
  }
}
</style>
