<template>
  <div class="filter-block-wrapp text-center">
    <ButtonWithLoader
      buttonClass="mb-2 p-0"
      height="32px"
      value="Применить фильтр"
      variant="outline-primary"
      width="80%"
      @click="applyFilters"
    />
    <ButtonWithLoader
      buttonClass="mb-2 p-0"
      height="32px"
      value="Сбросить фильтр"
      variant="outline-secondary"
      width="80%"
      @click="resetFilters"
    />
    <BorderlessActionButton v-if="store !== 'reference'" @click="showFiltersAdditionalParameters" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useNuxtApp, useRoute } from 'nuxt/app'
import BorderlessActionButton from '../BorderlessActionButton.vue'
import ButtonWithLoader from '~/components/UI-KIT/Buttons/BaseFormButton.vue'

const props = defineProps({
  store: { type: [String, Object] },
})

const { $filtersStore, $bvModal, $refsFiltersStore }: any = useNuxtApp()

const effectiveStore = computed(() => {
  if (props.store === 'reference') return $refsFiltersStore
  return props.store || $filtersStore
})

const applyFilters = () => {
  if (effectiveStore.value.applyFilterFn) {
    effectiveStore.value.applyFilterFn()
  } else {
    effectiveStore.value.setActiveItem(null)
    effectiveStore.value.pageNumber = 1
    effectiveStore.value.setObjectsRespLoading(true)
    effectiveStore.value.filterData()
    effectiveStore.value.setObjectsRespLoading(false)
  }
}

const resetFilters = () => {
  if (effectiveStore.value.cleanFilterFn) {
    effectiveStore.value.cleanFilterFn()
  } else {
    effectiveStore.value.setActiveItem(null)
    effectiveStore.value.pageNumber = 1
    const route = useRoute()
    const objectCalcType = route.path === '/evaluation' ? 'OO' : route.path === '/analog' ? 'OA' : ''
    effectiveStore.value.cleanFilter(objectCalcType)
    effectiveStore.value.getObjects()
  }
}

const showFiltersAdditionalParameters = () => {
  $bvModal.showFiltersAdditionalParameters()
}
</script>
