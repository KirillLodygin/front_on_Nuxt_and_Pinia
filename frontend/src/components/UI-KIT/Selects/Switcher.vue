<template>
  <div class="d-flex justify-content-end align-items-center">
    <div
      :class="['switcher-box', !modelValue ? 'start' : 'end', { disabled: props.disabled, 'me-2': props.label }]"
      @click="switcherToggle(!modelValue)"
    >
      <div class="switcher-toggle"></div>
      <div class="switcher-btn">
        <i :class="'caret-icon icon icon-xs icon-medium ' + (modelValue ? 'fi_check' : 'fi_minus')"></i>
      </div>
    </div>
    <span :class="['switcher-label', { disabled: props.disabled }]" @click="switcherToggle(!modelValue)">
      {{ label }}
    </span>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  disabled: { type: Boolean, required: false, default: false },
  label: { type: String, required: false, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const switcherToggle = (value: boolean) => {
  if (!props.disabled) {
    emit('update:modelValue', value)
  }
}
</script>
