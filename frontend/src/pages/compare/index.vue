<template>
  <LoadingCover v-if="$userStore.pageLoading" />
  <div v-else class="h-100">
    <CompareComponent />
  </div>
</template>

<script lang="ts" setup>
import CompareComponent from '~/components/GeoObject/CompareComponent.vue'
import LoadingCover from '~/components/UI-KIT/Loaders/LoadingCover.vue'

const { $userStore }: any = useNuxtApp()
</script>
