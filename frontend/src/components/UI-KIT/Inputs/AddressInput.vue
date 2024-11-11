<!-- Контрол для поиска по адресу в виде текстового поля с выпадающим списком -->
<template>
  <ks-dropdown
    ref="addressMenu"
    :show-if="saAddress.length > 0"
    class="ms-auto me-2 w-100 position-relative"
    icon="fas fa-ellipsis-v"
    scroll-holder-id="search-panel"
    @show="scrollMenuToActiveItem()"
  >
    <template v-slot:btn="btn">
      <input
        :id="btn.id"
        v-model="saAddress"
        :disabled="props.disabled"
        aria-expanded="false"
        aria-haspopup="true"
        autocomplete="off"
        class="form-control dropdown-toggle map-object-properties_body_input form-control form-control-lg w-100 pe-5"
        data-bs-toggle="dropdown"
        placeholder="Введите адрес объекта"
        :class="props.required && saAddress ? 'is-valid' : 'is-invalid'"
        type="text"
        @blur="onBlur"
        @click="(event) => addressMenu.show(event)"
        @focus="addressMenu.show()"
        @input="fromProps = false"
        @keyup.enter="onEnterPressed()"
        @keyup.down="nextSaVariant()"
        @keyup.up="prevSaVariant()"
        @keyup.esc="addressMenu.hide()"
      />
    </template>
    <div v-if="loading" class="dropdown-item">
      <BSpinner small></BSpinner>
      <span>Загрузка данных</span>
    </div>
    <div v-else-if="$mapStore.saVariants.length" id="saMenuItems" style="max-height: 300px; overflow-y: auto">
      <a
        v-for="(variant, index) in $mapStore.saVariants"
        :key="variant.place_id"
        :class="{ 'dropdown-item': true, active: index === $mapStore.saActiveIndex }"
        href="#"
        @mouseenter="typeof index === 'number' && posSaVariant(index)"
        @mousedown="
          () => {
            console.log('@mousedown jumpToAddress')
            return typeof index === 'number' && jumpToAddress(index)
          }
        "
      >
        <i :class="[variant.icon, 'fa-fw']"></i> {{ variant.type_rus || variant.category_rus || variant.category }}:
        {{ variant.shortName }}
      </a>
    </div>
    <div v-else class="dropdown-item"><i class="fas fa-search-minus"></i> Подходящих объектов не найдено</div>
  </ks-dropdown>
</template>

<script lang="ts" setup>
import { useNuxtApp } from 'nuxt/app'
import { ref, watch } from 'vue'
import KsDropdown from '~/components/MapComponent/KsDropdown.vue'
import { useAddressSearch } from '~/composables/useAddressSearch'
import createMapStore from '~/store/mapStoreDuplicatable'

interface Props {
  disabled: boolean
  defaultValue: string
  required: boolean
  onlyBuildings: boolean
}

const props = defineProps<Props>()
const { $addressVermins, $searchServer, $mapObjectDefaults, $geoObject } = useNuxtApp()
const emit = defineEmits(['updateMutableData', 'returnAddress'])
const saAddress = ref(props.defaultValue)
const saDelay = ref(500)
const loading = ref(false)
let loadController: AbortController
const timer = ref<any>(undefined)
const addressMenu = shallowRef()
const addressChosen = ref(false)
const fromProps = ref(false)
const $mapStore = createMapStore('addressInput')

watch(saAddress, (address) => {
  if (fromProps.value) return
  clearTimeout(timer.value)

  timer.value = setTimeout(() => {
    getsaVariants(address, props.onlyBuildings, $mapStore)

    $mapStore.setSaActiveIndex(0)
    if (!$mapStore.saVariants.length) {
      addressChosen.value = false
    }
  }, saDelay.value)
  if (!props.onlyBuildings) {
    emit('updateMutableData', 'address_raw', address)
  }
})

watch(
  () => props.defaultValue,
  (newVal) => {
    fromProps.value = true
    saAddress.value = newVal
  },
)

const onEnterPressed = () => {
  addressMenu.value.hide()
  jumpToAddress(0)
}

// Прокрутка скрола меню к активному элементу
const scrollMenuToActiveItem = () => {
  if ($mapStore.saVariants.length) {
    const saMenuItem = document.querySelector(
      '#saMenuItems>a:nth-child(' + ($mapStore.saActiveIndex + 1) + ')',
    ) as HTMLDivElement
    const saMenuItemsDiv = document.getElementById('saMenuItems') as HTMLDivElement
    if (saMenuItemsDiv.scrollTop + saMenuItemsDiv.offsetHeight < saMenuItem.offsetTop + saMenuItem.offsetHeight) {
      saMenuItemsDiv.scrollTop = saMenuItem.offsetTop + saMenuItem.offsetHeight - saMenuItemsDiv.offsetHeight
    }
    if (saMenuItemsDiv.scrollTop > saMenuItem.offsetTop - 5) {
      saMenuItemsDiv.scrollTop = saMenuItem.offsetTop - 5
    }
  }
}

// Переход к следующему элементу из списка результатов поиска
const nextSaVariant = () => {
  if ($mapStore.saVariants.length - 1 > $mapStore.saActiveIndex) $mapStore.setSaActiveIndex($mapStore.saActiveIndex++)
  scrollMenuToActiveItem()
}

// Переход к предыдущему элементу из списка результатов поиска
const prevSaVariant = () => {
  if ($mapStore.saActiveIndex > 0) $mapStore.setSaActiveIndex($mapStore.saActiveIndex--)
  scrollMenuToActiveItem()
}

const posSaVariant = (index: number) => {
  $mapStore.setSaActiveIndex(index)
}

const clear = (inputId: string) => {
  saAddress.value = ''
  const input = document.getElementById(inputId) as HTMLInputElement
  input.focus()
}
const { getsaVariants } = useAddressSearch()

// Инициализация перехода к выбранному адресу
const jumpToAddress = (variantIndex: number) => {
  console.log('jumptoaddress')
  if (typeof variantIndex !== 'undefined') $mapStore.setSaActiveIndex(variantIndex)
  if ($mapStore.saVariants.length > 0 && $mapStore.saActiveIndex < $mapStore.saVariants.length) {
    saAddress.value = $mapStore.saVariants[$mapStore.saActiveIndex].shortName

    const address =
      $mapStore.saVariants[$mapStore.saActiveIndex].address.city ===
      $mapStore.saVariants[$mapStore.saActiveIndex].address.state
        ? 'г. ' +
          $mapStore.saVariants[$mapStore.saActiveIndex].address.city +
          ', ' +
          $mapStore.saVariants[$mapStore.saActiveIndex].shortAddress
        : $mapStore.saVariants[$mapStore.saActiveIndex].shortName

    emit(
      'returnAddress',
      {
        lngLat: {
          lat: +$mapStore.saVariants[$mapStore.saActiveIndex].lat,
          lng: +$mapStore.saVariants[$mapStore.saActiveIndex].lon,
        },
      },
      address,
      $mapStore.saVariants[$mapStore.saActiveIndex].osm_id,
      $mapStore.saVariants[$mapStore.saActiveIndex].geojson,
    )
    console.log('addressChosen.value = true')
    addressChosen.value = true
    addressMenu.value.hide()
  }
}

function onBlur() {
  if (!$mapStore.saVariants.length && !addressChosen && !props.onlyBuildings) {
    emit('updateMutableData', 'address_raw', saAddress)
  }

  setTimeout(() => {
    console.log('onBlur()')
    if (props.onlyBuildings && saAddress.value !== $geoObject.objectData.address_raw) {
      saAddress.value = $geoObject.objectData.address_raw
    }
  }, 100)
}
</script>
