<template>
  <div class="map-and-search-address">
    <Teleport v-if="$mapStore.displayCompareObjectFullscreen" to=".map">
      <div
        v-if="
          $displayCompareObjectStore.currentRealtyObject &&
          Object.keys($displayCompareObjectStore.currentRealtyObject).length &&
          $displayCompareObjectStore.currentPricingFactor
        "
        :class="'d-flex flex-column p-0'"
        id="search-address-input-id"
        class="search-address-input-for-all"
        style="background-color: transparent; z-index: 1000000"
      >
        <UIKITSelectsSelectWithOptions
          v-model:model-value="pricingFactorComputed"
          :options="pricingFactorsOptions"
          :default="$displayCompareObjectStore.currentPricingFactor"
          :required="true"
          :option-text-nowrap="false"
          :disabled="$displayCompareObjectStore.isRouteLoading"
        />
        <GeoObjectCompareRealtyObjectSelect :options="objects" />
      </div>
    </Teleport>

    <div
      v-if="
        $displayCompareObjectStore.currentRealtyObject &&
        Object.keys($displayCompareObjectStore.currentRealtyObject).length &&
        $displayCompareObjectStore.currentPricingFactor
      "
      :class="'d-flex flex-column p-0'"
      id="search-address-input-id"
      class="search-address-input-for-all"
      style="background-color: transparent; z-index: 1000"
    >
      <UIKITSelectsSelectWithOptions
        :model-value="pricingFactorComputed"
        :options="pricingFactorsOptions"
        :default="$displayCompareObjectStore.currentPricingFactor"
        :required="true"
        :option-text-nowrap="false"
        @update:model-value="
          (value) => {
            pricingFactorComputed = value
          }
        "
      />
      <GeoObjectCompareRealtyObjectSelect :options="objects" />
    </div>

    <!-- <div v-else :class="''" class="search-address-input-for-all">
        <search-address-input></search-address-input>
      </div> -->
    <MapComponent
      ref="vMap"
      v-slot="{ map, mapInit }"
      :address-from-map="true"
      :express="false"
      :is-analog-map-modal="true"
      :layers-tree="{}"
      showFullscreenButton
      class="h-100"
      :show-ctx-menu="false"
      :on-full-screen-start="() => ($mapStore.displayCompareObjectFullscreen = true)"
      :on-full-screen-end="() => ($mapStore.displayCompareObjectFullscreen = false)"
    >
      <ObjectsLayer
        ref="ObjectsLayerRef"
        :mode="'displayCompareObjects'"
        :activeItem="$comparison.activeComparisonItem"
        :items="objects"
        :map="map"
        :mapInit="mapInit"
        :key="$comparison.comparisonObjects.length"
      >
      </ObjectsLayer>
    </MapComponent>
  </div>
</template>

<script setup lang="ts">
import type { Geometry } from 'geojson'
import SearchAddressInput from '~/components/UI-KIT/Inputs/SearchAddressInput.vue'
import ObjectsLayer from '~/components/MapComponent/ObjectsLayer.vue'
const emit = defineEmits(['returnAddress'])
const { $mapStore, $comparison, $displayCompareObjectStore } = useNuxtApp()
const items: any[] = reactive([])
const pricingFactorComputed = computed({
  get() {
    return $displayCompareObjectStore.currentPricingFactor ? $displayCompareObjectStore.currentPricingFactor : ''
  },
  set(value: string) {
    console.log('set computed')
    $displayCompareObjectStore.setCurrentPricingFactor(value)
  },
})

watch(
  () => $mapStore.displayCompareObjectFullscreen,
  (newVal) => {
    if (newVal) {
      nextTick(() => {
        const map = document.getElementsByClassName('maplibregl-map')[0]
        const menu = document.getElementById('search-address-input-id')
        map.classList.add('geo-tsof-fullscreen-mode')
        map.prepend(menu!)
      })
    }
  },
)
const objects = computed(() => $comparison.currentComparisonObjects)
onBeforeMount(async () => {
  $displayCompareObjectStore.currentPricingFactor = null
  $displayCompareObjectStore.currentRealtyObject = null
  $displayCompareObjectStore.route = null
  if (!objects.value.length) return
  let firstPricingFactor = null
  let availableObject = null

  const prcingsFactorsArr = $comparison.currentPricingFactorsArr
    .filter((item) => item.is_checked)
    .map((item) => item.pricing_factor.field)
  const objectsArr = objects.value

  findObjectLoop: for (const factor of prcingsFactorsArr) {
    for (const object of objectsArr) {
      if (object?.[factor + '_descr']?.distance) {
        availableObject = object
        firstPricingFactor = factor
        break findObjectLoop
      }
    }
  }

  if (availableObject) {
    await $displayCompareObjectStore.setCurrentRealtyObject(availableObject)
  }
  if (firstPricingFactor) {
    await $displayCompareObjectStore.setCurrentPricingFactor(firstPricingFactor)
  }
})

const pricingFactorsOptions = computed(() => {
  return $comparison.currentPricingFactorsArr
    .filter((item) => item.is_checked)
    .map((item) => {
      return {
        value: item.pricing_factor.field,
        display_name: item.pricing_factor.label,
        disabled: !(
          $displayCompareObjectStore.currentRealtyObject &&
          $displayCompareObjectStore.currentRealtyObject[item.pricing_factor.field + '_descr']?.distance
        ),
      }
    })
})
</script>

<style scoped></style>
