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
          <i class="align-self-center icon-color icon-2x fi_map-pin fill-white" @click="onStartPointClick" />
          <div class="position-relative flex-grow-1 pe-2">
            <div class="d-flex w-100 ms-2">
              <input
                v-model="$mapStore.firstRoutingAddress"
                type="text"
                placeholder="Откуда"
                class="form-control form-control-lg rounded-0 rounded-start border-end-0"
                @click="
                  () => {
                    if (firstAddressArr.length) firstAddressArrSwitcher = !firstAddressArrSwitcher
                  }
                "
              />
              <button
                class="btn btn-outline-secondary btn-toggle-password rounded-0 rounded-end"
                type="button"
                @click="
                  () => {
                    $mapStore.firstRoutingAddress = ''
                  }
                "
              >
                <i class="icon icon-lg fi_backspace align-text-bottom"></i>
              </button>
            </div>
            <ul v-if="firstAddressArrSwitcher && firstAddressArr.length" class="ms-2 route-addresses-list">
              <li
                v-for="(address, index) in firstAddressArr"
                :key="index"
                @click="
                  () => {
                    $mapStore.firstRoutingAddress = address.display_name
                    $mapStore.firstRoutingCoords = { lat: Number(address.lat), lon: Number(address.lon) }
                    firstAddressArrSwitcher = false
                  }
                "
                class="route-addresses-list-item"
              >
                {{ address['display_name'] }}
              </li>
            </ul>
          </div>
        </div>
        <div class="d-flex mt-3">
          <i class="align-self-center icon-color icon-2x fi_map-pin fill-silver" @click="onEndPointClick" />
          <div class="position-relative flex-grow-1 pe-2">
            <div class="d-flex w-100 ms-2">
              <input
                v-model="$mapStore.secondRoutingAddress"
                type="text"
                placeholder="Куда"
                class="form-control form-control-lg rounded-0 rounded-start border-end-0"
                @click="
                  () => {
                    if (secondAddressArr.length) secondAddressArrSwitcher = !secondAddressArrSwitcher
                  }
                "
              />
              <button
                class="btn btn-outline-secondary btn-toggle-password rounded-0 rounded-end"
                type="button"
                @click="
                  () => {
                    $mapStore.secondRoutingAddress = ''
                  }
                "
              >
                <i class="icon icon-lg fi_backspace align-text-bottom"></i>
              </button>
            </div>
            <ul v-if="secondAddressArrSwitcher && secondAddressArr.length" class="ms-2 route-addresses-list">
              <li
                v-for="(address, index) in secondAddressArr"
                :key="index"
                @click="
                  () => {
                    $mapStore.secondRoutingAddress = address.display_name
                    $mapStore.secondRoutingCoords = { lat: Number(address.lat), lon: Number(address.lon) }
                    secondAddressArrSwitcher = false
                  }
                "
                class="route-addresses-list-item"
              >
                {{ address['display_name'] }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="ms-auto h-100 align-self-center">
        <button type="button" class="map-instrument-routing-repeat-button mt-3" @click="changeAddresses">
          <i class="align-self-center icon icon-lg fi_repeat m-3" />
        </button>
      </div>
    </div>
    <hr v-if="result || $mapStore.isRouteLoading" class="m-2 mt-3" />
    <BSpinner v-if="$mapStore.isRouteLoading" small></BSpinner>
    <div v-else-if="result" class="d-flex ms-2">
      <template v-if="result && 'trip' in result">
        <div class="flex-grow-1">Расстояние: {{ result.trip.summary.length.toFixed() }} км</div>
        <div class="flex-grow-1">
          Время в пути:
          <template v-if="result.trip.summary.time >= 3600">
            {{ Math.floor(result.trip.summary.time / 60 / 60) }} ч
            {{ Math.floor((result.trip.summary.time % 3600) / 60) }} мин
          </template>
          <template v-else> {{ Math.floor(result.trip.summary.time / 60) }} мин </template>
        </div>
      </template>
      <template v-if="result && 'error' in result">
        <div class="flex-grow-1 text-danger">Ошибка {{ result.error_code }}: {{ translatedError(result.error) }}</div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import ButtonGroup from '~/components/UI-KIT/Buttons/ButtonsGroup/ButtonGroup.vue'
import { computed } from 'vue'
import type { RouteDataType, ValhallaErrorResponseType } from '~/types/valhallaResponseTypes'

const { $mapStore } = useNuxtApp()
const computedHeight = computed(() => $mapStore.mapInstrumentPanelHeight - 65)
const translatedError = (error: string) => {
  const errorEnRuMatchings: Record<string, string> = {
    'Path distance exceeds the max distance limit: 250000 meters':
      'Расстояние между точками превышает 250 км для маршрута пешком',
    'No suitable edges near location': 'Нет доступных маршрутов вблизи указанного местоположения',
  }
  if (error in errorEnRuMatchings) {
    return errorEnRuMatchings[error]
  }
  return error
}
const transportationModeOptions = [
  { displayName: 'Автомобиль', value: 1, iconClass: 'ksi_car-alt' },
  { displayName: 'Пешком', value: 2, iconClass: 'ic-walk' },
  { displayName: 'Велосипед', value: 3, iconClass: 'ksi_bicycle' },
]

const firstAddressChangeTrigger = ref(false)
const secondAddressChangeTrigger = ref(false)

const changeAddresses = () => {
  const routingAddress = $mapStore.firstRoutingAddress
  $mapStore.firstRoutingAddress = $mapStore.secondRoutingAddress
  $mapStore.secondRoutingAddress = routingAddress
  const routingAddressCoords = $mapStore.firstRoutingCoords
  $mapStore.firstRoutingCoords = $mapStore.secondRoutingCoords
  $mapStore.secondRoutingCoords = routingAddressCoords
  firstAddressChangeTrigger.value = true
  secondAddressChangeTrigger.value = true
}

const firstAddressArr = ref<Record<string, any>[]>([])
const secondAddressArr = ref<Record<string, any>[]>([])
const firstAddressArrSwitcher = ref(false)
const secondAddressArrSwitcher = ref(false)

watch(
  () => $mapStore.firstRoutingAddress,
  async () => {
    if (!$mapStore.firstRoutingAddress?.length) {
      firstAddressArr.value = []
      firstAddressArrSwitcher.value = false
      $mapStore.routingData = null
      $mapStore.firstRoutingCoords = null
    }
    if (!$mapStore.isRouteAdressFromCtx) {
      const addressExists = firstAddressArr.value.some(
        (address) => address.display_name === $mapStore.firstRoutingAddress,
      )
      if (!addressExists) {
        const addresses = await $mapStore.getAddresses($mapStore.firstRoutingAddress)
        if (addresses) {
          firstAddressArr.value = addresses
          if (!firstAddressChangeTrigger.value) {
            firstAddressArrSwitcher.value = true
          }
          firstAddressChangeTrigger.value = false
        }
      }
    }
    $mapStore.isRouteAdressFromCtx = true
  },
)

watch(
  () => $mapStore.secondRoutingAddress,
  async () => {
    if (!$mapStore.secondRoutingAddress?.length) {
      secondAddressArr.value = []
      secondAddressArrSwitcher.value = false
      $mapStore.routingData = null
      $mapStore.secondRoutingCoords = null
    }
    if (!$mapStore.isRouteAdressFromCtx) {
      const addressExists = secondAddressArr.value.some(
        (address) => address.display_name === $mapStore.secondRoutingAddress,
      )
      if (!addressExists) {
        const addresses = await $mapStore.getAddresses($mapStore.secondRoutingAddress)
        if (addresses) {
          secondAddressArr.value = addresses
          if (!secondAddressChangeTrigger.value) {
            secondAddressArrSwitcher.value = true
          }
          secondAddressChangeTrigger.value = false
        }
      }
    }
    $mapStore.isRouteAdressFromCtx = false
  },
)

watch(
  [() => $mapStore.firstRoutingCoords, () => $mapStore.secondRoutingCoords, () => $mapStore.routingTransportationMode],
  $mapStore.getMapRoute,
)

const result = computed<RouteDataType | ValhallaErrorResponseType | null>(() => {
  const data = $mapStore.routingData

  if (data && 'trip' in data) {
    return data as RouteDataType
  } else if (data && 'error' in data) {
    return data as ValhallaErrorResponseType
  }
  return null
})

function onStartPointClick(e: MouseEvent) {
  $mapStore.isStartPointFromMapActive = !$mapStore.isStartPointFromMapActive
}

function onEndPointClick(e: MouseEvent) {
  $mapStore.isEndPointFromMapActive = !$mapStore.isEndPointFromMapActive
}
</script>
