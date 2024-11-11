<template>
  <div class="table-wrapper page-card h-100">
    <div class="content-block">
      <div class="h-100">
        <h1 class="page-header">{{ pageHeader }}</h1>
        <FiltersMenu
          :filters="$objectModelTable.allFilters"
          :store="$objectModelTable"
          style="width: 315px; padding-bottom: 40px"
        />
      </div>
      <ModelBlock :navigate-string="navigateString" :title-for-add-button="titleForAddButton" />
      <FiltersAdditionalParametersModal
        :isShowFiltersAdditionalParameters="isShowFiltersAdditionalParameters"
        :allFilters="allFilters"
        :allFilteredFields="allFilteredFields"
        :allFiltersOptions="allFiltersOptions"
        :store="$objectModelTable"
      />
    </div>
  </div>
</template>

<script lang="ts" name="TableBlockWrapper" setup>
import { computed, onMounted } from 'vue'
import FiltersMenu from '~/components/UI-KIT/FilterTable/FiltersMenu.vue'
import ModelBlock from './ModelBlock.vue'
import FiltersAdditionalParametersModal from '../UI-KIT/Modals/FiltersAdditionalParametersModal.vue'
import { useNuxtApp } from 'nuxt/app'

defineProps({
  pageHeader: { type: String, required: true },
  titleForAddButton: { type: String, required: true },
  navigateString: { type: String, required: true },
})

const { $objectModelTable, $bvModal, $geoObject }: any = useNuxtApp()

onMounted(async () => {
  if (!$objectModelTable.allFilters.length) {
    await $objectModelTable.appStartingFilterFunctions()
    $geoObject.linkExistingObjectsTableFiltersApplied = true
  }
})

const isShowFiltersAdditionalParameters = computed(() => {
  return $bvModal.isShowFiltersAdditionalParameters
})

const allFilters = computed(() => $objectModelTable.allFilters)
const allFilteredFields = computed(() => $objectModelTable.allFilteredFields)
const allFiltersOptions = computed(() => $objectModelTable.allFiltersOptions)
</script>

<style lang="scss">
.short-filter-input {
  width: 45%;
}
.input-and-icon {
  .short-filter-input {
    width: 100%;
  }
}
.filter-block-wrapp {
  border-top: 1px solid var(--gray);
  padding: 7px 0;
  gap: 7px;
}
</style>
