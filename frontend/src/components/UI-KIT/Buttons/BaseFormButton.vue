<template>
  <button
    :class="['btn', getBtnClass(), getSizeClass(), getBtnOutlineClass(), props.buttonClass]"
    :disabled="props.loading || props.disabled"
    :style="{ width: props.width, height: props.height, fontSize: props.fontSize, color: getColor() }"
    :type="props.type"
  >
    <span v-if="props.loading">
      <BSpinner small></BSpinner>
    </span>
    <span v-else>
      <i v-if="props.startIconClass" :class="[props.startIconClass, { 'icon-light': props.variant === 'dark' }]" />
      {{ props.value }}
      <i v-if="props.endIconClass" :class="[props.endIconClass, { 'icon-light': props.variant === 'dark' }]" />
    </span>
  </button>
</template>

<script lang="ts" setup>
const props = defineProps({
  value: { type: String, required: true },
  startIconClass: { type: String, required: false, default: '' },
  endIconClass: { type: String, required: false, default: '' },
  buttonClass: { type: String, required: false, default: '' },
  loading: { type: Boolean, required: false, default: false },
  disabled: { type: Boolean, required: false, default: false },
  type: { type: String as PropType<any>, required: false, default: 'button' },
  width: { type: String, required: false, default: '' },
  height: { type: String, required: false, default: '' },
  // Если необходимо не применять, то передавать ''
  variant: { type: String, required: false, default: 'primary' },
  // Если необходимо не применять, то передавать ''
  outlineVariant: { type: String, required: false, default: 'primary' },
  size: { type: String, required: false, default: '' },
  fontSize: { type: String, required: false, default: '' },
})

const getBtnClass = () => {
  if (props.variant === '') return ''
  return 'btn-' + props.variant
}
const getBtnOutlineClass = () => {
  if (props.outlineVariant === '') return ''
  return 'btn-outline-' + props.outlineVariant
}
const getSizeClass = () => {
  return props.size ? 'btn-' + props.size : ''
}

const getColor = () => {
  return props.variant === 'primary' ? 'var(--primary-l50)' : 'var(--primary-d15)'
}
</script>
