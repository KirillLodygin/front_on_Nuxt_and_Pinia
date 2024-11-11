<template>
  <div class="custom-select" v-click-outside="closeDropdown">
    <div :class="['form-control form-control-lg d-flex', { open: dropdownOpen }]" @click="toggleDropdown">
      <span v-if="selectedOption" class="align-self-center w-100 d-flex">
        <i v-if="selectedOption.iconClass" :class="getIconClass(selectedOption.iconClass)"></i>
        {{ selectedOption.displayName }}
        <i :class="iconClasses"></i>
      </span>
    </div>

    <ul v-if="dropdownOpen" ref="customSelectOptionsContainer" class="custom-select-options">
      <li
        v-for="option in options"
        :key="String(option.value)"
        @click="selectOption(option)"
        class="select-option min-heght-25"
        :class="{ active: option.value === modelValue }"
      >
        <i v-if="option.iconClass" :class="getIconClass(option.iconClass)"></i>
        {{ option.displayName }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { settingsTypeOptions } from '~/app_constants/mapInstrumentsData'

const props = defineProps({
  modelValue: [String, Number, Boolean],
  options: Array<settingsTypeOptions>,
})
const emit = defineEmits(['update:modelValue', 'scrollToSelect'])

const dropdownOpen = ref(false)
const selectedOption = ref<settingsTypeOptions | null>(null)
const customSelectOptionsContainer = ref<HTMLElement | null>(null)
const getIconClass = (iconClass: string) => {
  if (
    ['color-circle', 'color-square', 'color-triangle', 'dashed-border-s', 'dashed-border-m', 'dashed-border-l'].some(
      (word) => iconClass.includes(word),
    )
  ) {
    return iconClass + ' align-self-center me-2'
  }
  return 'icon icon-lg ' + iconClass + ' align-self-center me-2'
}

const iconClasses = computed(() => [
  'icon caret-icon align-self-center ms-auto',
  dropdownOpen.value ? 'fi_chevron-up' : 'fi_chevron-down',
])

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
  scrollToSelect()
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

const selectOption = (option: settingsTypeOptions) => {
  emit('update:modelValue', option.value)
  dropdownOpen.value = false
}

const scrollToSelect = async () => {
  await nextTick()
  if (customSelectOptionsContainer.value) {
    emit('scrollToSelect', customSelectOptionsContainer.value)
  }
}

watch(
  () => props.modelValue,
  (newVal) => {
    selectedOption.value = props.options?.find((option: settingsTypeOptions) => option.value === newVal) || null
  },
  { immediate: true },
)
</script>
