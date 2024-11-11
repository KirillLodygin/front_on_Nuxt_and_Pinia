<template>
  <BModal
    v-model="isShowFiltersAdditionalParameters"
    class="filters-additional-params-modal"
    :class="{ 'd-block': isShowFiltersAdditionalParameters }"
    body-class="p-0"
    centered
    :hideHeaderClose="true"
    no-close-on-backdrop
    size="xl"
    titleClass="w-100"
    @hide="onHide"
  >
    <template #title>
      <div class="row">
        <div class="col h5 my-1"><i class="icon icon-lg fi_modules"></i> ПАРАМЕТРЫ ФИЛЬТРАЦИИ</div>
        <div class="col text-end">
          <button aria-label="Close" class="btn-close" data-v-079b865c="" type="button" @click="close()"></button>
        </div>
      </div>
    </template>

    <div class="filters-additional-parameters-body">
      <div class="options-menu">
        <OptionRadiobutton
          v-for="option of allOptions"
          :key="option.value"
          v-model:checkedValue="selectedCheck"
          :checked="option.checked"
          :label="option.label"
          :name="'allOptions'"
          :value="option.value"
          :store="store"
        />
      </div>
      <div class="all-filters">
        <div class="search-select">
          <input v-model="searchByFilters" class="form-control form-control-lg" type="search" />
        </div>
        <div v-if="sortedFilters.length > 0" :key="searchByFilters" class="row filters-field">
          <template v-for="filter of sortedFilters" :key="filter.label">
            <FilterBlock
              :filter="filter"
              :store="store"
              :is-all-filters="true"
              @changeFilter="filterChanged = !filterChanged"
            />
          </template>
        </div>
        <div v-else class="no-filters">
          <p>Фильтры не найдены</p>
        </div>
      </div>
    </div>

    <template #footer="{ ok }">
      <div>
        <button class="btn btn-lg btn-outline-secondary p-3 btn-footer me-2" @click="cancel()">Отмена</button>
      </div>
      <div>
        <button class="btn btn-lg btn-primary p-3 btn-footer me-2" @click="saveFilters()">Сохранить</button>
      </div>
    </template>
  </BModal>
</template>

<script lang="ts" setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import type { filterType } from '~/types/objectsFiltersStoreTypes'

import OptionRadiobutton from '../Buttons/OptionRadiobutton.vue'
import FilterBlock from '~/components/UI-KIT/FilterTable/FilterBlock.vue'
import { ConditionalNode } from 'mathjs'

const props = defineProps({
  allFilters: {
    type: Array as () => filterType[],
    default: () => [],
  },
  allFilteredFields: {
    type: Object as () => Record<string, string[]>,
    default: () => ({}),
  },
  allFiltersOptions: {
    type: Array as () => Record<string, any>[],
    default: () => [],
  },
  isShowFiltersAdditionalParameters: {
    type: Boolean,
    default: null,
  },
  store: { type: Object },
})

const { $filtersStore, $bvModal }: any = useNuxtApp()

const useDefaultData = computed(() => {
  return (
    !props.allFilters.length ||
    !Object.keys(props.allFilteredFields).length ||
    !props.allFiltersOptions.length ||
    !props.store
  )
})

const selectedCheck = computed(() => {
  const option = (useDefaultData.value ? $filtersStore.allFiltersOptions : props.allFiltersOptions).find(
    (item: Record<string, any>) => item.checked,
  )
  return option ? option.value : 'base_search_fields'
})
const searchByFilters = ref('')

const allOptions = computed(() => {
  return useDefaultData.value ? $filtersStore.allFiltersOptions : props.allFiltersOptions
})

const isShowFiltersAdditionalParameters = computed(() => {
  return props.isShowFiltersAdditionalParameters === null
    ? $bvModal.isShowFiltersAdditionalParameters
    : props.isShowFiltersAdditionalParameters
})

const sortedFilters = ref<filterType[]>([])
const filterChanged = ref(false)
watch([() => searchByFilters.value, () => selectedCheck.value, () => filterChanged.value], () => {
  sortFilters()
})

const sortFilters = () => {
  let result: filterType[] = []
  const filters = useDefaultData.value ? $filtersStore.allFilters : props.allFilters
  const filteredFields = useDefaultData.value ? $filtersStore.allFilteredFields : props.allFilteredFields

  if (selectedCheck.value === 'all_fields') {
    result = filters
  } else {
    const nameIndex = filteredFields[selectedCheck.value].reduce(
      (obj: Record<string, number>, fieldName: string, index: number) => {
        obj[fieldName] = index
        return obj
      },
      {},
    )
    result = filters
      .filter((filter: filterType) => filteredFields[selectedCheck.value].includes(filter.field) || filter.value)
      .sort((a: filterType, b: filterType) => nameIndex[a.field] - nameIndex[b.field])
  }
  if (searchByFilters.value) {
    result = result.filter((filter: filterType) =>
      filter.label.toLowerCase().includes(searchByFilters.value.toLowerCase()),
    )
  }
  sortedFilters.value = result
}

const onHide = () => {
  $bvModal.closeFiltersAdditionalParameters()
}

const close = () => {
  $bvModal.closeFiltersAdditionalParameters()
}

const cancel = () => {
  if (props.store) {
    props.store.restoreFilters()
  } else {
    $filtersStore.restoreFilters()
  }
  close()
}

const saveFilters = () => {
  if (props.store) {
    props.store.saveFilters()
  } else {
    $filtersStore.saveFilters()
  }
  close()
}

onMounted(() => {
  if (useDefaultData.value) {
    $filtersStore.updateAllFiltersOptions($filtersStore.searchParams.object_type_calc)
    sortFilters()
  } else {
    sortFilters()
  }
})
</script>

<style lang="scss">
.filters-additional-params-modal {
  .modal-dialog {
    margin: 0 auto;
    height: 100vh;
    overflow: hidden;

    .modal-content {
      height: 100%;
      margin: auto 0;
      overflow: hidden;
      max-height: 790px;

      .modal-body {
        overflow: hidden;
        height: 100%;

        .filters-additional-parameters-body {
          overflow: hidden;
          height: 100%;

          .options-menu {
            height: 100%;
          }

          .all-filters {
            height: 100%;

            .filters-field {
              height: calc(100% - 72px);
            }
          }
        }
      }
    }
  }
}
</style>
