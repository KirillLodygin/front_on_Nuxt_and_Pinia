<template>
  <div class="table-wrapper page-card h-100">
    <div class="content-block">
      <div class="h-100">
        <h1 class="page-header">{{ pageHeader }}</h1>
        <FiltersMenu />
      </div>
      <TableBlock :navigate-string="navigateString" :title-for-add-button="titleForAddButton" />
      <FiltersAdditionalParametersModal />
    </div>
  </div>
</template>

<script lang="ts" setup>
import FiltersMenu from '~/components/UI-KIT/FilterTable/FiltersMenu.vue'
import TableBlock from './TableBlock.vue'
import FiltersAdditionalParametersModal from '~/components/UI-KIT/Modals/FiltersAdditionalParametersModal.vue'
const { $bvModal }: any = useNuxtApp()
const props = defineProps({
  pageHeader: { type: String, required: true },
  titleForAddButton: { type: String, required: true },
  navigateString: { type: String, required: true },
})

const isShowFiltersAdditionalParameters = computed(() => {
  return $bvModal.isShowFiltersAdditionalParameters
})
</script>
