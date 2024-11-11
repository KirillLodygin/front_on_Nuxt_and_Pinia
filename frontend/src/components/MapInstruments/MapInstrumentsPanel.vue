<template>
  <MapInstrumentsPanelHeader :active-tab-index="activeTabIndex" @close="close" />
  <hr class="m-2" />
  <MapInstrumentsPanelBody :active-tab-index="activeTabIndex" />
</template>

<script setup lang="ts">
import MapInstrumentsPanelHeader from '~/components/MapInstruments/MapInstrumentsPanelHeader.vue'
import MapInstrumentsPanelBody from '~/components/MapInstruments/MapInstrumentsPanelBody.vue'

defineProps({
  activeTabIndex: { type: Number, required: true },
})
const emit = defineEmits(['close'])
const close = () => emit('close')
</script>
