<template>
  <div class="h-100">
    <WorkWithMapComponent />
  </div>
</template>

<script lang="ts" setup>
const { $mapStore } = useNuxtApp()
onMounted(() => $mapStore.getLayerTree())
</script>
