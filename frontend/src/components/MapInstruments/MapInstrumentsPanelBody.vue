<template>
  <div v-if="activeTabIndex === 1">
    <BSpinner v-if="loading" small></BSpinner>
    <GeoLayersTree ref="layersTreeInput" :treeData="layersTree" class="mb-1"></GeoLayersTree>
  </div>
  <div v-else-if="activeTabIndex === 2">
    <DataVisualization />
  </div>
  <div v-else-if="activeTabIndex === 3">
    <Routing />
  </div>
  <div v-else-if="activeTabIndex === 4">
    <Isochrone />
  </div>
  <div v-else-if="activeTabIndex === 5">
    <Measuring />
  </div>
</template>

<script setup lang="ts">
import GeoLayersTree from '~/components/MapInstruments/Tab1GeoLayersTree/GeoLayersTree.vue'
import type { geoLayerTreeNodeType } from '~/types/treeTypes'
import DataVisualization from '~/components/MapInstruments/Tab2DataVisualization/DataVisualization.vue'
import Routing from '~/components/MapInstruments/Tab3Routing/Routing.vue'
import Isochrone from '~/components/MapInstruments/Tab4Isochrone/Isochrone.vue'
import Measuring from '~/components/MapInstruments/Tab5Measuring/Measuring.vue'
const { $mapStore } = useNuxtApp()
defineProps({
  activeTabIndex: { type: Number, required: true },
})

const layersTree = computed<geoLayerTreeNodeType[]>(() => {
  const data = $mapStore.geoLayerTree.filter((node) => node.id !== $mapStore.osmLayerId)
  if ($mapStore.isShortLayersView) {
    return data.filter((node) => $mapStore.shortLayersViewIdsList.includes(node.id))
  }
  return data
})
const loading = computed(() => $mapStore.isLayersLoading)

onMounted(async () => {
  await $mapStore.getLayerTree()
})
</script>
