<template>
  <div class="custom-select" v-click-outside="closeDropdown">
    <div
      :class="['form-control form-control-lg d-flex', { open: dropdownOpen }, getIconClass(selectedOption?.iconClass)]"
      @click="toggleDropdown"
    >
      <i :class="iconClasses" />
    </div>

    <ul v-if="dropdownOpen" class="custom-select-options">
      <li
        v-for="option in options"
        :key="String(option.value)"
        @click="selectOption(option)"
        class="select-option min-heght-25"
        :class="{ active: option.value === modelValue }"
      >
        <span :class="getIconClass(option.iconClass)"></span>
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
const emit = defineEmits(['update:modelValue'])

const dropdownOpen = ref(false)
const selectedOption = ref<settingsTypeOptions | null>(null)

const getIconClass = (iconClass: string | undefined) => {
  if (iconClass) {
    return 'd-flex gradation ' + iconClass
  }
  return
}

const iconClasses = computed(() => [
  'icon caret-icon align-self-center ms-auto',
  dropdownOpen.value ? 'fi_chevron-up icon-light' : 'fi_chevron-down icon-light',
])

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

const selectOption = (option: settingsTypeOptions) => {
  emit('update:modelValue', option.value)
  dropdownOpen.value = false
}

watch(
  () => props.modelValue,
  (newVal) => {
    selectedOption.value = props.options?.find((option: settingsTypeOptions) => option.value === newVal) || null
  },
  { immediate: true },
)
</script>
