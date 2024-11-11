<template>
  <div class="filter-block-wrapp filter-references">
    <div class="filter-label">
      <span role="button" @click.prevent="openFilter()">
        <i :class="['icon me-1', props.filter.isOpen ? 'fi_chevron-down' : 'fi_chevron-right']"></i>
        {{ props.filter.label }}
      </span>
      <i v-if="isFilterSelect" class="icon icon-emphasis fi_filter-select ms-2"></i>
    </div>

    <Transition name="slide-y-fade">
      <div v-if="filter.isOpen" class="filter-body">
        <template v-if="filter.type === 'choice'" :key="filter.field" class="line line-block">
          <Input
            v-if="filter.field === 'param_name'"
            v-model="searchByFilters"
            v-model:checkedValue="selectedCheck"
            type="search"
            id="searchByParamsInput"
            class="filter-search"
            placeholder="Фильтр по параметру"
            :is-large="false"
            :on-blur-clear="false"
          />
          <div class="form-inputs">
            <template v-if="filterChoices.length">
              <FilterСheckbox
                v-for="choice of filterChoices"
                :key="choice.value"
                v-model:checkedValue="selectedCheck"
                :choice="choice"
                :field="filter.field"
                :is-all-filters="isAllFilters"
                :name="filter.label"
                store="refsFiltersStore"
              />
            </template>
            <div v-else class="alert d-flex align-items-center my-0">
              <i class="icon icon-lg fi_alert-circle" style="flex: 0 0 2.5rem"></i>
              <div>Параметры, удовлетворяющие текущим настройкам фильтра, не найдены.</div>
            </div>
          </div>
        </template>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import Input from '~/components/UI-KIT/Inputs/Input.vue'
import FilterСheckbox from '~/components/UI-KIT/FilterTable/components/FilterСheckbox.vue'
import { computed, ref } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import type { choiceType, filterType } from '~/types/objectsFiltersStoreTypes'

const { $refsFiltersStore }: any = useNuxtApp()

const props = defineProps({
  filter: { type: Object, required: true },
  isAllFilters: { type: Boolean, required: true },
})

const isFilterSelect = computed(() => {
  return !!props.filter?.value.length
})

const searchByFilters = ref('')
const selectedCheck = ref('')

const filterChoices = computed(() => {
  if (props.filter.field === 'param_name' && searchByFilters.value.length) {
    return props.filter.choices.filter((item: choiceType) =>
      item.value.toLowerCase().includes(searchByFilters.value.toLowerCase()),
    )
  } else {
    return props.filter.choices
  }
})

const openFilter = () => {
  $refsFiltersStore.openFilter(props.filter?.field, props.isAllFilters)
}

watch(
  () => props.filter.value,
  () => {
    const { $refsFiltersStore }: any = useNuxtApp()
    if (props.filter?.field === 'modified_by') {
      $refsFiltersStore.updateFilter(props.filter.field, props.filter.value.toString(), '', props.isAllFilters)
    }
    if ($refsFiltersStore.lastUpdatedFilter !== 'param_name') {
      $refsFiltersStore.updateFilterChoicesList('param_name')
    }
  },
)
</script>
