<template>
  <div class="card-panel">
    <div class="scenario-wrapper row align-items-start">
      <div v-for="pair in historyScenario" :key="pair[0] + pair[1]" class="row card-panel-row mb-4">
        <template v-for="(varietyInput, index) in pair" :key="varietyInput">
          <MapObjectPropertiesInput
            v-if="mutableOptions[varietyInput]?.objectData"
            :coordinates="mutableData.geo_pos.coordinates"
            :data="mutableData[varietyInput]"
            :disabled="true"
            :field="varietyInput"
            :find-map="mutableOptions[varietyInput]?.flags.findMap"
            :info="mutableOptions[varietyInput]?.flags.info"
            :is-pre-written="false"
            :is-share="varietyInput.includes('share')"
            :object-area="mutableData.object_area"
            :object-data="mutableOptions[varietyInput].objectData"
            :required="mutableOptions[varietyInput]?.flags.requiredField || false"
            :specify-map="mutableOptions[varietyInput]?.flags.specifyOnMap"
            :unavailable="mutableOptions[varietyInput]?.flags.unavailable"
            :is-cube="mutableOptions[varietyInput]?.flags.isCube"
            :index="index + 1"
            :mutable-data="mutableData"
          ></MapObjectPropertiesInput>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MapObjectPropertiesInput from '~/components/MapObjectProperties/Fields/MapObjectPropertiesInput.vue'
interface Props {
  mutableData: { [key: string]: any }
  mutableOptions: { [key: string]: any }
}
const { mutableData, mutableOptions } = defineProps<Props>()
const historyScenario = reactive([
  ['ads_downloaded', 'added_by'],
  ['ads_updated_internal', 'modified_by'],
])
</script>

<style scoped></style>
