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
      <div class="input-group border w-100">
        <input
          :id="btn.id"
          v-model="saAddress"
          aria-expanded="false"
          aria-haspopup="true"
          autocomplete="off"
          class="form-control dropdown-toggle"
          data-bs-toggle="dropdown"
          placeholder="Введите адрес объекта"
          type="text"
          @click="addressMenu.show()"
          @focus="addressMenu.show()"
          @keyup.enter="onEnterPressed()"
          @keyup.down="nextSaVariant()"
          @keyup.up="prevSaVariant()"
          @keyup.esc="addressMenu.hide()"
        />
        <button class="btn btn-outline-secondary btn-toggle-password" type="button" @click="clear(btn.id)">
          <i class="icon icon-lg fi_backspace align-text-bottom"></i>
        </button>
      </div>
      <BFormCheckbox v-model="$mapStore.saAutoScale" name="check-button" switch class="ms-1"
        >автомасштаб по результатам
      </BFormCheckbox>
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
        @click.prevent="typeof index === 'number' && jumpToAddress(index)"
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
const props = defineProps({
  mapStore: { type: Object, default: {} },
})
const { $mapStore: $mapStoreGeneral, $addressVermins, $searchServer, $mapObjectDefaults } = useNuxtApp()
console.log(props.mapStore, Object.keys(props.mapStore).length)
const $mapStore = Object.keys(props.mapStore).length ? props.mapStore : $mapStoreGeneral
const saAddress = ref('')
const saDelay = ref(500)
const loading = ref(false)
let loadController: AbortController
const timer = ref<any>(undefined)
const addressMenu = shallowRef()

watch(saAddress, (address) => {
  clearTimeout(timer.value)

  timer.value = setTimeout(() => {
    getsaVariants(address, true, $mapStore)
    $mapStore.setSaActiveIndex(0)
  }, saDelay.value)
})

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
  if (typeof variantIndex !== 'undefined') $mapStore.setSaActiveIndex(variantIndex)
  if ($mapStore.saVariants.length > 0 && $mapStore.saActiveIndex < $mapStore.saVariants.length) {
    $mapStore.setGoToAddress($mapStore.saVariants[$mapStore.saActiveIndex])
  }
}
</script>
