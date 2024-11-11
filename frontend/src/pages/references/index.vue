<template>
  <LoadingCover v-if="pageLoading" />
  <div v-else class="h-100">
    <ReferenceBook />
  </div>
</template>

<script lang="ts" setup>
import ReferenceBook from '~/components/Reference/ReferenceBook.vue'
import { useNuxtApp } from 'nuxt/app'
import LoadingCover from '~/components/UI-KIT/Loaders/LoadingCover.vue'
const pageLoading = computed(() => $userStore.pageLoading)

const { $userStore, $auth }: any = useNuxtApp()
</script>
