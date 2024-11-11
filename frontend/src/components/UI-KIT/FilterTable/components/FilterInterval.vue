<template>
  <FilterInput
    :input-type="inputType"
    :placeholder="intervalValues.first.placeholder"
    :field="field"
    :is-all-filters="isAllFilters"
    input-num="first"
    v-model:value="firstValue"
    :store="store"
    @changeFilter="emit('changeFilter')"
  />
  <FilterInput
    :input-type="inputType"
    :placeholder="intervalValues.second.placeholder"
    :field="field"
    :is-all-filters="isAllFilters"
    input-num="second"
    v-model:value="secondValue"
    :store="store"
    @changeFilter="emit('changeFilter')"
  />
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { intervalValuesType } from '~/types/objectsFiltersStoreTypes'
import FilterInput from '~/components/UI-KIT/FilterTable/components/FilterInput.vue'

const props = defineProps({
  field: { type: String, required: true },
  intervalValues: { type: Object as PropType<intervalValuesType>, required: true },
  inputType: { type: String, required: true },
  isAllFilters: { type: Boolean, required: true },
  store: { type: Object },
})
const emit = defineEmits(['changeFilter'])
const firstValue = ref(props.intervalValues.first.value)
const secondValue = ref(props.intervalValues.second.value)
// Watch for changes in intervalValues and update firstValue and secondValue
watch(
  () => props.intervalValues,
  (newIntervalValues) => {
    firstValue.value = newIntervalValues.first.value
    secondValue.value = newIntervalValues.second.value
  },
  { deep: true },
)
</script>
