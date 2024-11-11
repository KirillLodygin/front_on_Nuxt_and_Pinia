<template>
  <div class="overflow-y-auto overflow-x-hidden ps-2 pe-3" :style="{ height: `${computedHeight}px` }">
    <ButtonGroup
      :buttons-data="transportationModeOptions || []"
      v-model="$mapStore.routingTransportationMode"
      class="mt-1 w-100"
    />
    <div class="d-flex w-100">
      <div class="flex-grow-1 me-3">
        <div class="d-flex mt-3">
          <i class="align-self-center icon icon-2x fi_map-pin" @click="onPointClick" />
          <div class="position-relative flex-grow-1 pe-2">
            <div class="d-flex w-100 ms-2">
              <input
                v-model="$mapStore.isochronePointAddress"
                type="text"
                placeholder="Откуда"
                class="form-control form-control-lg rounded-0 rounded-start border-end-0"
                @click="switchOptions"
              />
              <button
                class="btn btn-outline-secondary btn-toggle-password rounded-0 rounded-end"
                type="button"
                @click="
                  () => {
                    $mapStore.isochronePointAddress = ''
                  }
                "
              >
                <i class="icon icon-lg fi_backspace align-text-bottom"></i>
              </button>
            </div>
            <ul v-if="isochroneAddressArrSwitcher && isochroneAddressArr.length" class="ms-2 route-addresses-list">
              <li
                v-for="(address, index) in isochroneAddressArr"
                :key="index"
                @click="
                  () => {
                    $mapStore.isochronePointAddress = address.display_name
                    $mapStore.isochronePointCoords = { lat: Number(address.lat), lon: Number(address.lon) }
                    isochroneAddressArrSwitcher = false
                  }
                "
                class="route-addresses-list-item"
              >
                {{ address['display_name'] }}
              </li>
            </ul>
          </div>
        </div>
        <div class="input-group d-flex mt-3">
          <i class="align-self-center icon icon-2x fi_clock filled" />
          <input
            v-model="$mapStore.isochroneContoursTime"
            id="time"
            type="number"
            placeholder="Время"
            class="form-control form-control-lg ms-2"
          />
          <span class="input-group-text">(мин)</span>
        </div>
      </div>
    </div>
    <hr v-if="result || $mapStore.isIsochroneLoading" class="m-2 mt-3" />
    <BSpinner v-if="$mapStore.isIsochroneLoading" small></BSpinner>
    <div v-else-if="result" class="ms-2 me-2">
      <template v-if="result && 'features' in result">
        <div v-for="object in isochroneObjectsData" class="d-flex w-100">
          <div class="mt-1 color-circle" :style="{ backgroundColor: object['color'] }"></div>
          <div class="pe-1 lh-sm">{{ object['title'] }}</div>
          <div class="ms-auto d-flex">
            <span class="mt-auto">{{ object['osm_objects'].length }}</span>
          </div>
        </div>
      </template>
      <template v-if="result && 'error' in result">
        <div class="text-danger">Ошибка {{ result.error_code }}: {{ result.error }}</div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import ButtonGroup from '~/components/UI-KIT/Buttons/ButtonsGroup/ButtonGroup.vue'
import { computed } from 'vue'
import type { IsochroneDataType, ValhallaErrorResponseType } from '~/types/valhallaResponseTypes'
import { Marker } from 'maplibre-gl'

const { $mapStore } = useNuxtApp()
const computedHeight = computed(() => $mapStore.mapInstrumentPanelHeight - 65)

const transportationModeOptions = [
  { displayName: 'Автомобиль', value: 1, iconClass: 'ksi_car-alt' },
  { displayName: 'Пешком', value: 2, iconClass: 'ic-walk' },
  { displayName: 'Велосипед', value: 3, iconClass: 'ksi_bicycle' },
]

const isochroneAddressArr = ref<Record<string, any>[]>([])
const isochroneAddressArrSwitcher = ref(false)

const isochroneObjectsData = computed(() => $mapStore.isochroneObjectsData)

watch(
  () => $mapStore.isochronePointAddress,
  async () => {
    isochroneAddressArr.value = []
    if (!$mapStore.isochronePointAddress.length) {
      isochroneAddressArrSwitcher.value = false
      $mapStore.isochroneData = null
      $mapStore.isochronePointCoords = null
    }
    if (!$mapStore.isIsochroneAddressFromCtx) {
      const addresses = await $mapStore.getAddresses($mapStore.isochronePointAddress)
      if (addresses) {
        isochroneAddressArr.value = addresses
        isochroneAddressArrSwitcher.value = true
      }
    }
    $mapStore.isIsochroneAddressFromCtx = false
  },
)

watch(
  [
    () => $mapStore.isochronePointCoords,
    () => $mapStore.isochroneContoursTime,
    () => $mapStore.routingTransportationMode,
  ],
  $mapStore.getIsochroneData,
)

const result = computed<IsochroneDataType | ValhallaErrorResponseType | null>(() => {
  const data = $mapStore.isochroneData

  if (data && 'features' in data) {
    return data as any
  } else if (data && 'error' in data) {
    return data as ValhallaErrorResponseType
  }
  return null
})

const switchOptions = () => {
  if (isochroneAddressArr.value.length) {
    isochroneAddressArrSwitcher.value = !isochroneAddressArrSwitcher.value
  }
}

function onPointClick(e: MouseEvent) {
  $mapStore.isIsochronePointFromMapActive = !$mapStore.isIsochronePointFromMapActive
}
</script>
