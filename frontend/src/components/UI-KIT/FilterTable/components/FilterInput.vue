<template>
  <DatePickerInput
    v-if="['datetime', 'date'].includes(inputType)"
    :id="field + inputNum"
    v-model="dateValue"
    :placeholder="placeholder"
    short
  />
  <input
    v-else
    :class="[
      'form-control',
      ['string', 'field', 'url'].includes(inputType) ? 'long-filter-input' : 'short-filter-input',
    ]"
    :placeholder="placeholder"
    :type="inputType"
    :value="value"
    @change="updateValue"
  />
</template>

<script lang="ts" setup>
import { useNuxtApp } from 'nuxt/app'
import DatePickerInput from '~/components/UI-KIT/Inputs/DatePickerInput.vue'

const props = defineProps({
  inputType: { type: String, required: true },
  value: { type: String, required: true },
  placeholder: { type: String, required: true },
  inputNum: { type: String, required: false, default: '' },
  field: { type: String, required: true },
  isAllFilters: { type: Boolean, required: true },
  store: { type: Object },
})

const emit = defineEmits(['update:value', 'changeFilter'])
const { $filtersStore }: any = useNuxtApp()
const updateValue = (e: any) => {
  const editedValue =
    props.inputType === 'decimal' ? e.target.value.replace(/[^0-9.,]+/g, '').replace(',', '.') : e.target.value
  emit('update:value', editedValue)
  emit('changeFilter')
  if (props.store) {
    props.store.updateFilter(props.field, editedValue.toString(), props.inputNum, props.isAllFilters)
  }
}
const dateValue = computed({
  get: () => props.value,
  set: (newValue) => {
    emit('update:value', newValue)
    emit('changeFilter')
    if (props.store) {
      props.store.updateFilter(props.field, newValue, props.inputNum, props.isAllFilters)
    } else $filtersStore.updateFilter(props.field, newValue, props.inputNum, props.isAllFilters)
  },
})
</script>
