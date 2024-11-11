<template>
  <BModal
    v-model="$mapStore.toShowGeoInfoModal"
    :size="'lg'"
    @hide="onClose"
    :dialog-class="'geo-info-modal-class'"
    :ok-only="true"
    :ok-title="'Закрыть'"
    :title="'Информация об объекте'"
  >
    <template v-if="$mapStore.toShowGeoInfoModal && $mapStore.geoInfoPos">
      <div class="row geo-layer-settings" style="width: 1200px">
        <div class="col-3 h-100 pe-0 geo-layer-settings-tabs">
          <OptionRadiobutton
            v-for="option in geoInfoTabs"
            :key="option.value"
            v-model:checkedValue="computedGeoTabParam"
            :checked="computedGeoTabParam === option.value"
            :label="option.name"
            :icon="option.icon"
            :name="'allOptions'"
            :value="option.value"
          />
        </div>
        <div class="col-9 geo-layer-settings-body">
          <div v-show="computedGeoTabParam === 'geoTsof'" class="h-100 w-100">
            <MapObjectPropertiesGeoTsof
              :is-non-card-version="true"
              :geo_pos="$mapStore.geoInfoPos"
              :is-geo-object="false"
              :is-linked-real-estate="false"
            />
          </div>
          <div v-show="computedGeoTabParam === 'geoLayer'" class="h-100">
            <MapObjectPropertiesGeoLayers
              :lat="$mapStore.geoInfoPos.coordinates[1]"
              :lng="$mapStore.geoInfoPos.coordinates[0]"
            />
          </div>
          <div v-show="computedGeoTabParam === 'osm'" class="h-100">
            <OsmInfoTable :obj="$mapStore.geoInfoOsmObj.address" />
          </div>
        </div>
      </div>
    </template>
  </BModal>
</template>

<script setup lang="ts">
import OsmInfoTable from './OsmInfoTable.vue'
import OptionRadiobutton from '~/components/UI-KIT/Buttons/OptionRadiobutton.vue'
import MapObjectPropertiesGeoTsof from '../MapObjectProperties/Sections/GeoTsof.vue'
import MapObjectPropertiesGeoLayers from '../MapObjectProperties/Sections/GeoLayers.vue'
type tabValueType = 'geoTsof' | 'osm' | 'geoLayer'
const { $mapStore } = useNuxtApp()

const currentTab: Ref<'geoTsof' | 'osm' | 'geoLayer'> = ref('geoTsof')
const computedGeoTabParam = computed({
  get: () => currentTab.value,
  set: (val: tabValueType) => (currentTab.value = val),
})
const geoInfoTabs = [
  { value: 'geoTsof', name: 'Гео-цофы', icon: 'fi_minus' },
  { value: 'osm', name: 'ОСМ', icon: 'fi_minus' },
  { value: 'geoLayer', name: 'Гео-слои', icon: 'fi_minus' },
]

function onClose() {
  $mapStore.onCloseGeoInfoModal()
  computedGeoTabParam.value = 'geoTsof'
}
</script>

<style scoped>
.geo-layer-settings {
  height: 100%;
  display: flex;
}

.geo-layer-settings-tabs, .geo-layer-settings-body {
  height: calc(80vh - 3rem);
  overflow-y: auto;
}
</style>


