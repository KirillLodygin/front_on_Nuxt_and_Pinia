<template>
  <div
    v-if="!$mapStore.displayCompareObjectFullscreen"
    :class="menuClasses"
    :tabindex="tabindex"
    class="form-select-menu"
    @blur="open = false"
  >
    <div
      :class="SelectedItems"
      class="selected realty-object-selected d-flex justify-content-between"
      style="height: 56px"
      @click="toggleOpen"
    >
      <div class="m-1">
        <div class="compare-object-select-option">{{ selectedIndex }}. {{ realtyObject?.name }}</div>
        <br />
        <template v-if="realtyObject![pricingFactor!]?.distance">
          <template
            v-if="realtyObject![pricingFactor!].type === 'by_foot'"
            class="geo-tsof-fullscreen_item_title small"
          >
            <i class="icon ic-walk icon icon-lg" />{{ getOnFootLine(realtyObject![pricingFactor!]) }}
          </template>
          <template v-if="realtyObject![pricingFactor!].type === 'by_car'" class="geo-tsof-fullscreen_item_title small">
            <i class="icon ic-rent_car icon-lg" />{{ getOnCarLine(realtyObject![pricingFactor!]) }}
          </template>
          <template v-if="realtyObject![pricingFactor!].type === 'direct'" class="geo-tsof-fullscreen_item_title small">
            <i class="icon fi_line icon-lg" />{{ getDirectLine(realtyObject![pricingFactor!]) }}
          </template>
        </template>
      </div>
      <i :class="iconClasses"></i>
    </div>
    <div :class="{ selectHide: !open, itemsOpen: open }" class="items">
      <div
        v-for="(option, i) of optionsComputed"
        :key="i"
        :title="option.display_name"
        :class="getOptionClass(option)"
        @mousedown="() => onOptionClick(option)"
      >
        <div>
          <div class="compare-object-select-option">{{ i + 1 }}. {{ option?.name }}</div>
          <br />
          <template v-if="option[pricingFactor!]">
            <template v-if="option[pricingFactor!].type === 'by_foot'" class="geo-tsof-fullscreen_item_title small">
              <i class="icon ic-walk icon icon-lg" />{{ getOnFootLine(option[pricingFactor!]) }}
            </template>
            <template v-if="option[pricingFactor!].type === 'by_car'" class="geo-tsof-fullscreen_item_title small">
              <i class="icon ic-rent_car icon-lg" />{{ getOnCarLine(option[pricingFactor!]) }}
            </template>
            <template v-if="option[pricingFactor!].type === 'direct'" class="geo-tsof-fullscreen_item_title small">
              <i class="icon fi_line icon-lg" />{{ getDirectLine(option[pricingFactor!]) }}
            </template>
          </template>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <div :class="{ selectHide: false, itemsOpen: true }" class="items no-selected-item">
      <div
        v-for="(option, i) of optionsComputed"
        :key="i"
        :title="option.display_name"
        :class="getOptionClass(option)"
        @mousedown="() => onOptionClick(option)"
      >
        <div>
          <div class="compare-object-select-option">{{ i + 1 }}. {{ option?.name }}</div>
          <br />
          <template v-if="option[pricingFactor!]">
            <template v-if="option[pricingFactor!].type === 'by_foot'" class="geo-tsof-fullscreen_item_title small">
              <i class="icon ic-walk icon icon-lg" />{{ getOnFootLine(option[pricingFactor!]) }}
            </template>
            <template v-if="option[pricingFactor!].type === 'by_car'" class="geo-tsof-fullscreen_item_title small">
              <i class="icon ic-rent_car icon-lg" />{{ getOnCarLine(option[pricingFactor!]) }}
            </template>
            <template v-if="option[pricingFactor!].type === 'direct'" class="geo-tsof-fullscreen_item_title small">
              <i class="icon fi_line icon-lg" />{{ getDirectLine(option[pricingFactor!]) }}
            </template>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { abbreviations } from '~/app_constants/wordAbbreviations'
import type { geoTsofObjectType } from '~/types/geoTsofTableTypes'

interface Props {
  options: Record<string, any>[]
}

const props = defineProps<Props>()
const emit = defineEmits(['input', 'rerender'])
const { $displayCompareObjectStore, $comparison } = useNuxtApp()

const valueSelected: any = ref(null)
const open = ref(false)
const tabindex = ref(0)
const pricingFactor = computed(() => {
  return $displayCompareObjectStore.currentPricingFactor + '_descr'
})
const realtyObject = computed(() => {
  return $displayCompareObjectStore.currentRealtyObject
})
const selectedIndex = computed(() => {
  let index = -1
  props.options.forEach((item, i) => {
    if (item.id === $displayCompareObjectStore.currentRealtyObject?.id) {
      index = i + 1
    }
  })
  return index
})

const menuClasses = computed(() => {
  const classes = []
  if (disabledComputed.value) {
    classes.push('disabled')
  }
  return classes
})

const SelectedItems = computed(() => {
  return [open.value ? 'open' : ''].filter(Boolean).join(' ') // Фильтруем пустые строки и соединяем в одну строку
})

// Функция, возвращающая классы для опции
const getOptionClass = (option: Record<string, any>) => {
  return {
    'select-option select-option_sm': true,
    active: realtyObject.value?.id === option.id,
    'select-option__disabled': !option[pricingFactor.value]?.distance,
  }
}

// Метод для обработки клика по опции
const onOptionClick = (option: Record<string, any>) => {
  if (!option[pricingFactor.value]) return
  $displayCompareObjectStore.setCurrentRealtyObject(option)
  open.value = false
}

const iconClasses = computed(() => [
  'icon',
  'caret-icon',
  'align-self-center',
  open.value ? 'fi_chevron-up' : 'fi_chevron-down',
])

const toggleOpen = () => {
  if (!disabledComputed.value) {
    open.value = !open.value
  }
}

const optionsComputed = computed(() => {
  return props.options
})

const disabledComputed = computed(() => {
  return false
})

const getOnFootLine = (obj: geoTsofObjectType) => {
  if (obj.all_types.by_foot && obj.all_types.by_foot.distance && obj.all_types.by_foot.time) {
    return ` ${obj.all_types.by_foot?.distance?.toFixed(1).replace(/\./g, ',')} км (${obj.all_types.by_foot?.time?.toFixed(0).replace(/\./g, ',')} мин)`
  }
  return ''
}

const getOnCarLine = (obj: geoTsofObjectType) => {
  if (obj.all_types.by_car && obj.all_types.by_car.distance && obj.all_types.by_car.time) {
    return ` ${obj.all_types.by_car?.distance?.toFixed(1).replace(/\./g, ',')} км (${obj.all_types.by_car?.time?.toFixed(0).replace(/\./g, ',')} мин)`
  }
  return ''
}

const getDirectLine = (obj: geoTsofObjectType) => {
  if (obj.all_types.direct && obj.all_types.direct.distance) {
    return ` ${obj.all_types.direct?.distance.toFixed(1).replace(/\./g, ',')} км`
  }
  return ''
}

// const { $mapStore } = useNuxtApp()
// watch(
//   () => $mapStore.displayCompareObjectFullscreen,
//   (newVal) => {
//     if (newVal) open.value = true
//     else open.value = false
//   },
// )
</script>

<style scoped></style>
