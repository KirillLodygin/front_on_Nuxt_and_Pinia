<template>
  <div class="map-and-search-address">
    <Teleport v-if="$mapStore.addObjectToComparisonFullscreen" to=".map">
      <div class="geo-tsof-fullscreen d-flex flex-column">
        <div class="compare-list-fullscreen-text p-3 pb-0"><i class="icon fi_compare me-2" />Список сравнения</div>
        <div class="ps-4">
          <table class="">
            <tr
              v-for="(object, index) in $comparison.comparisonObjects"
              :key="index"
              class="compare-list-fullscreen-text"
              :class="[
                {
                  'table-active': $comparison.activeComparisonItem && object.id === $comparison.activeComparisonItem.id,
                },
              ]"
              role="button"
              @click="$comparison.setActiveComparisonItem(object)"
            >
              <td class="border-0">
                <span class="fw-bold">{{ index + 1 }}</span>
              </td>

              <td class="border-0">
                <i class="icon" :class="object.id ? 'ksi_building' : 'fi_map-pin'" /> {{ object.address_raw }}
              </td>
            </tr>
          </table>
        </div>
      </div>
    </Teleport>

    <div
      :class="''"
      id="search-address-input-id"
      class="search-address-input-for-all"
      :style="{ left: computedLeftProperty }"
    >
      <search-address-input :map-store="$mapStore"></search-address-input>
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
      :ctx-menu-mode="COMPARE"
      showFullscreenButton
      show-ctx-menu
      class="h-100"
      :on-full-screen-start="() => ($mapStore.addObjectToComparisonFullscreen = true)"
      :on-full-screen-end="() => ($mapStore.addObjectToComparisonFullscreen = false)"
      @return-object="(obj: Record<string, any>) => addObjectToCompare(obj)"
      @return-point="(obj: Record<string, any>) => setItem(obj)"
    >
      <ObjectsLayer
        ref="ObjectsLayerRef"
        :mode="'addObjectsToCompare'"
        :activeItem="$comparison.activeComparisonItem"
        :items="items"
        :map="map"
        :mapInit="mapInit"
        :key="$comparison.comparisonObjects.length"
        @on-item-select="(obj) => emit('onItemSelect', obj)"
      />
    </MapComponent>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import type { Geometry } from 'geojson'
import { COMPARE } from '~/app_constants/comparisonConsts'
import SearchAddressInput from '~/components/UI-KIT/Inputs/SearchAddressInput.vue'
import ObjectsLayer from '~/components/MapComponent/ObjectsLayer.vue'
import MapComponent from '~/components/MapComponent/MapComponent.vue'

const emit = defineEmits(['returnAddress', 'onItemSelect'])
const { $mapStore, $comparison } = useNuxtApp()
const items = computed(() => {
  return $comparison.currentComparisonObjects.map((item) => {
    const newId = item.id > 0 ? item.id : +item.id * -1
    return {
      ...item,
      id: newId,
    }
  })
})
const computedLeftProperty = computed(() => {
  return $mapStore.addObjectToComparisonFullscreen ? '500px' : '10px'
})
function setItem(obj: Record<string, any>) {
  console.log(items, obj)
  // if (items.map((item) => item.id).includes(obj.id)) return
  // items.push(obj)
  // console.log(items)
}

function addObjectToCompare(obj: Record<string, any>) {
  $comparison.addComparisonObject(obj)
}

watch(
  () => $mapStore.addObjectToComparisonFullscreen,
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

const ObjectsLayerRef = ref<InstanceType<typeof ObjectsLayer> | null>(null)

function fitActiveItem() {
  console.log('fitActiveItem')
  ObjectsLayerRef?.value?.fitActiveItem()
}

defineExpose({
  fitActiveItem,
})
</script>

<style scoped></style>
