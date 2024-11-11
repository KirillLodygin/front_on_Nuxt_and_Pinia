<template>
  <div>
    <ButtonGroup :buttons-data="options" v-model="activeTab" only-icons />
  </div>
</template>

<script setup lang="ts">
import ButtonGroup from '~/components/UI-KIT/Buttons/ButtonsGroup/ButtonGroup.vue'

const props = defineProps({
  modelValue: { type: Number, required: true },
})
const emit = defineEmits(['update:modelValue'])

const options = [
  { displayName: '1', value: 1, iconClass: 'fi_layers' },
  { displayName: '2', value: 2, iconClass: 'ksi_heatmap' },
  { displayName: '3', value: 3, iconClass: 'ksi_route' },
  { displayName: '2', value: 4, iconClass: 'ksi_isochrone' },
  { displayName: '3', value: 5, iconClass: 'fi_ruler' },
]
const activeTab = computed({
  get: () => props.modelValue,
  set: (value: number) => emit('update:modelValue', value),
})
</script>
