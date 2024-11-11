<template>
  <BModal
    v-model="toggle"
    :class="{ 'd-block': toggle }"
    centered
    content-class="map-modal-content"
    dialog-class="map-modal-dialog"
    :ok-only="true"
    ok-title="Закрыть"
    ok-variant="dark"
    title="Объект на карте"
  >
    <div :class="addressFromMap ? '' : 'd-none '" class="search-address-input-for-all">
      <search-address-input :map-store="$mapStore"></search-address-input>
    </div>
    <MapComponent
      ref="vMap"
      :address-from-map="addressFromMap"
      :express="express"
      :is-analog-map-modal="isAnalogMapModal"
      :layers-tree="layersTree"
      :only-buildings="isRealtyObject"
      :map-store="$mapStore"
      class="h-100"
      @return-address="
        (lngLat: any, address: string, osm_id: number, geo_json: Geometry) =>
          emit('returnAddress', lngLat, address, osm_id, geo_json)
      "
      @return-to-card="emit('returnToCard')"
    />
  </BModal>
</template>

<script lang="ts" setup>
import type { Geometry } from 'geojson'
import type { LngLatLike, Map } from 'maplibre-gl'
import MapComponent from '~/components/MapComponent/MapComponent.vue'
import SearchAddressInput from '~/components/UI-KIT/Inputs/SearchAddressInput.vue'
import createMapStore from '~/store/mapStoreDuplicatable'

const props = defineProps({
  modelValue: { type: Boolean, required: true, default: false },
  express: { type: Boolean, required: false, default: false },
  isAnalogMapModal: { type: Boolean, required: false, default: false },
  addressFromMap: { type: Boolean, required: false, default: false },
  layersTree: { type: Object, required: false, default: {} },
  marker: { type: Object, required: false },
  isRealtyObject: {
    type: Boolean,
    default: false,
  },
})

interface MapComponentInstance {
  setMarker(marker: any): void
  redraw(): void
  map: Map
}
const $mapStore = createMapStore('mapModal')
const vMap = ref<MapComponentInstance | null>(null)
const emit = defineEmits(['update:modelValue', 'returnAddress', 'returnToCard'])
const toggle = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
watch(toggle, () => {
  console.log(props.marker)
  if (toggle.value && props.marker && Object.keys(props.marker).length && props.marker.lat && props.marker.lng) {
    vMap.value?.setMarker(props.marker)
  } else {
    let mapCenter: LngLatLike = [37.6241, 55.7515]
    vMap.value?.map.setCenter(mapCenter)
  }
})
</script>
