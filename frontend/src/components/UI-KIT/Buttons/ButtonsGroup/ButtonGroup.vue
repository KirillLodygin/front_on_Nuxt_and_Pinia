<template>
  <div class="btn-group" role="group">
    <button
      v-for="(button, index) of buttonsData"
      type="button"
      :class="buttonClasses(index, button.value)"
      @click="() => setTabValue(button.value)"
    >
      <i v-if="!onlyLabels" :class="['icon icon-lg', button.iconClass, {'me-1': !onlyLabels && !onlyIcons}]"></i>
      <span v-if="!onlyIcons">
        {{ button.displayName ? button.displayName : button.value }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
type button = {
  displayName?: string
  value: number | string | boolean
  iconClass?: string
}
const props = defineProps({
  modelValue: { type: Number, required: true },
  buttonsData: { type: Array<button>, required: true },
  onlyIcons: { type: Boolean, required: false, default: false },
  onlyLabels: { type: Boolean, required: false, default: false },
})

const buttonClasses = (index: number, value: number | string | boolean) => ({
  'btn bth-tool': true,
  active: props.modelValue === value,
  first: index === 0,
  last: index === props.buttonsData.length - 1,
})

const emit = defineEmits(['update:modelValue'])
const setTabValue = (value: number | string | boolean) => {
  emit('update:modelValue', value)
}
</script>
