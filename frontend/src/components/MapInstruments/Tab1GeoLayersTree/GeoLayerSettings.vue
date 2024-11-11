<template>
  <div class="row geo-layer-settings">
    <div class="col-3 h-100 pe-0 geo-layer-settings-tabs">
      <OptionRadiobutton
        v-for="option in geoLayerSettingsTabs"
        :key="option.value"
        v-model:checkedValue="computedStyleSettingsParam"
        :checked="computedStyleSettingsParam === option.value"
        :label="option.name"
        :icon="option.icon"
        :name="'allOptions'"
        :value="option.value"
      />
    </div>
    <div class="col-9 geo-layer-settings-body">
      <div v-if="computedStyleSettingsParam === 'main'">
        <GeoLayerSettingsFields :type="computedStyleSettingsParam" :settings="geoLayerMainSettings" />
      </div>
      <div v-if="computedStyleSettingsParam === 'style'">
        <GeoLayerSettingsFields :type="computedStyleSettingsParam" :settings="geoLayerStyleSettings" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { geoLayerMainSettings, geoLayerSettingsTabs, geoLayerStyleSettings } from '~/app_constants/mapInstrumentsData'
import GeoLayerSettingsFields from '~/components/MapInstruments/GeoLayerSettingsFields.vue'
import OptionRadiobutton from '~/components/UI-KIT/Buttons/OptionRadiobutton.vue'
const { $mapStore } = useNuxtApp()
const computedStyleSettingsParam = computed({
  get: () => $mapStore.styleSettingsParam,
  set: (val: string) => $mapStore.setStyleSettingsParam(val),
})
</script>
