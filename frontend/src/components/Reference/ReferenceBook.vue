<template>
  <div class="table-wrapper page-card h-100">
    <div class="content-block">
      <div class="filters-block">
        <h1 class="page-header">ТАБЛИЦЫ КОЭФФИЦИЕНТОВ</h1>
        <FiltersMenu :filters="filters" :store="'reference'" />
      </div>
      <TableBlock :navigate-string="navigateString.references" />
      <FiltersAdditionalParametersModal v-if="isShowFiltersAdditionalParameters" />
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import TableBlock from '~/components/Reference/ReferenceTable.vue'
import FiltersAdditionalParametersModal from '~/components/UI-KIT/Modals/FiltersAdditionalParametersModal.vue'
import { navigateString } from '~/app_constants/objectsTable'
import FiltersMenu from '~/components/UI-KIT/FilterTable/FiltersMenu.vue'

const { $refsFiltersStore, $bvModal, $constData }: any = useNuxtApp()

const isShowFiltersAdditionalParameters = computed(() => {
  return $bvModal.isShowFiltersAdditionalParameters
})

const filters = computed(() => $refsFiltersStore.allFilters)

watch(
  () => $constData.referenceBookGroups,
  () => {
    $refsFiltersStore.appStartingFilterFunctions().then(() => {
      $refsFiltersStore.initFilters()
      $refsFiltersStore.getObjects()
    })
  },
  { immediate: true },
)
</script>
