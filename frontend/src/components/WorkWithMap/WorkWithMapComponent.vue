<template>
  <div class="position-relative h-100">
    <MapInstruments />
    <div class="search-address-input-for-all">
      <search-address-input :map-store="$mapStore"></search-address-input>
    </div>
    <MapComponent
      ref="vMap"
      v-slot="{ map, mapInit }"
      :address-from-map="true"
      :showFullscreenButton="true"
      :express="false"
      :is-analog-map-modal="false"
      :layers-tree="{}"
      :only-buildings="false"
      :map-store="$mapStore"
      :db-click-zoom="false"
      :ctx-menu-mode="'workWithMap'"
      class="h-100"
      @return-address=""
    >
      <RoutingInstrumentLayer :map="map" :map-init="mapInit" />
      <IsochroneLayer :map="map" :map-init="mapInit" />
    </MapComponent>
    <GeoInfoModal />
  </div>
</template>

<script setup lang="ts">
import MapComponent from '~/components/MapComponent/MapComponent.vue'
import RoutingInstrumentLayer from '~/components/MapComponent/RoutingInstrumentLayer.vue'
import SearchAddressInput from '~/components/UI-KIT/Inputs/SearchAddressInput.vue'
import MapInstruments from '~/components/MapInstruments/MapInstruments.vue'
import GeoInfoModal from './GeoInfoModal.vue'
import IsochroneLayer from '~/components/MapInstruments/Tab4Isochrone/IsochroneLayer.vue'
</script>
