<template>
  <div class="map-instrument">
    <div class="map-instrument-tabs">
      <MapInstrumentsTabs v-model="activeTabIndex" />
    </div>
    <div v-if="activeTabIndex > 0" ref="mapInstrumentPanel" class="map-instrument-panel overflow-hidden">
      <MapInstrumentsPanel :active-tab-index="activeTabIndex" @close="closeInstrumentPanel" />
    </div>
  </div>
</template>

<script setup lang="ts">
import MapInstrumentsTabs from '~/components/MapInstruments/MapInstrumentsTabs.vue'
import MapInstrumentsPanel from '~/components/MapInstruments/MapInstrumentsPanel.vue'
import { mapModeType } from '~/types/mapTypes'

const { $mapStore } = useNuxtApp()
const activeTabIndex = computed({
  get: () => $mapStore.mapInstrumentActiveTabIndex,
  set: (newValue: number) => ($mapStore.mapInstrumentActiveTabIndex = newValue),
})
const closeInstrumentPanel = () => (activeTabIndex.value = -1)
const mapInstrumentPanel = ref<HTMLElement | null>(null)
let resizeObserver: ResizeObserver | null = null
const handleResize = () => {
  if (mapInstrumentPanel.value) {
    const height = mapInstrumentPanel.value.clientHeight
    $mapStore.setMapInstrumentPanelHeight(height)
  }
}

onMounted(() => {
  watchEffect(() => {
    if (mapInstrumentPanel.value) {
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
      resizeObserver = new ResizeObserver(() => handleResize())
      resizeObserver.observe(mapInstrumentPanel.value)
      handleResize()
    }
  })
})

onUnmounted(() => {
  if (resizeObserver && mapInstrumentPanel.value) {
    resizeObserver.disconnect()
  }
})

watch(activeTabIndex, (value) => {
  if (value === 5) {
    $mapStore.mapMode = 'measuring'
  } else {
    $mapStore.mapMode = 'free'
  }
})
</script>
