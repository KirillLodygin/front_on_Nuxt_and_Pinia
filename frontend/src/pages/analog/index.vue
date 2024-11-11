<template>
  <LoadingCover v-if="pageLoading" />
  <div v-else class="h-100">
    <TableBlockWrapper
      :navigate-string="navigateString.analogs"
      :page-header="pageHeader.analogs"
      :title-for-add-button="titleForAddButton.analogs"
    />
  </div>
</template>

<script lang="ts" setup>
import { useNuxtApp } from 'nuxt/app'
import TableBlockWrapper from '~/components/ObjectsTable/TableBlockWrapper.vue'
import { navigateString, pageHeader, titleForAddButton } from '~/app_constants/objectsTable'
import LoadingCover from '~/components/UI-KIT/Loaders/LoadingCover.vue'

const { $filtersStore, $auth, $userStore }: any = useNuxtApp()
const pageLoading = computed(() => $userStore.pageLoading)
</script>
