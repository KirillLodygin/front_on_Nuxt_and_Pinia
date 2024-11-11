<template>
  <div class="form-select-menu" :tabindex="tabindex" @blur="handleBlur">
    <div :class="['selected d-flex', { open: isOpen }, { 'bg-disabled': disabled }]" @mousedown="handleClick">
      {{ displayValue }}
      <i :class="['caret-icon icon align-self-center ms-auto', isOpen ? 'fi_chevron-up' : 'fi_chevron-down']"></i>
    </div>
    <div :class="['items overflow-y-auto', { selectHide: !isOpen, itemsOpen: isOpen }]">
      <div
        v-for="(option, i) in props.options"
        :key="i"
        :class="[
          'select-option text-nowrap',
          { 'select-option__disabled': option.disabled, 'select-option__selected': option.value === selectedValue },
        ]"
        :title="option.display_name"
        @mousedown.prevent="() => selectValue(option.value)"
      >
        {{ option.display_name }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useNuxtApp } from 'nuxt/app'
import { ref, computed, watch } from 'vue'
import { COMPARE } from '~/app_constants/comparisonConsts'

interface Props {
  defaultValue: any
  options: any[]
  disabled?: boolean
  field: string
  index?: number
  area?: string
}

const props = defineProps<Props>()
const { $calculations, $comparison } = useNuxtApp()
const tabindex = ref(0)

const emit = defineEmits(['setData'])

const _selectedValue = ref(props.defaultValue)

const selectedValue = computed({
  get() {
    return _selectedValue.value
  },
  set(value) {
    _selectedValue.value = value
    emit('setData', value)
  },
})

const isOpen = computed(() => {
  if (props.area) {
    if (props.area === COMPARE) {
      return $comparison.getIsOpenMenuList(props.field)
    }

    if (props.area === 'pricing') {
      return $comparison.getIsOpenPricingFactor(props.field)
    }
  }
  return $calculations.getIsOpenMenuList(props.field, props.index)
})

const displayValue = computed(() => {
  if (
    typeof selectedValue.value === 'number' ||
    (props.area && (props.area === COMPARE || props.area === 'pricing'))
  ) {
    const option = props.options.find((option) => option.value === selectedValue.value)
    return option ? option.display_name : selectedValue.value
  }
  return selectedValue.value
})

const handleBlur = () => {
  if (props.area && props.area === COMPARE) {
    $comparison.resetIsListOpenLists()
    return
  }
  $calculations.resetIsListOpenLists()
}

const handleClick = () => {
  if (!props.disabled) {
    if (props.area) {
      if (props.area === COMPARE) {
        $comparison.updateIsListOpenLists(props.field)
        return
      }
      if (props.area === 'pricing') {
        $comparison.updateIsListOpenPricingFactors(props.field)
        return
      }
    }
    $calculations.updateIsListOpenLists(props.field, props.index)
  }
}

const selectValue = (value: any) => {
  selectedValue.value = value
  if (props.area) {
    if (props.area === COMPARE) {
      $comparison.resetIsListOpenLists()
      return
    }
    if (props.area === 'pricing') {
      $comparison.resetPricingFactorsArr()
      return
    }
  }
  $calculations.resetIsListOpenLists()
}

watch(
  () => props.defaultValue,
  async (newValue) => {
    await nextTick()
    _selectedValue.value = newValue
  },
  { deep: true },
)
</script>
