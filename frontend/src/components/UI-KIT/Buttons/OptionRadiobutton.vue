<template>
  <div class="radio-block">
    <input type="radio" :name="name" :id="label" :value="value" :checked="checked" />
    <label :class="[checked ? 'radio-checked' : '', 'radio-option']" @click="handleClick()">
      <i v-if="icon" :class="['icon', 'me-1', 'bg-cur-color', icon]"></i>
      {{ label }}
    </label>
  </div>
</template>

<script setup name="OptionRadiobutton" lang="ts">
import { useNuxtApp } from 'nuxt/app'

const props = defineProps({
  name: { type: String, required: true },
  checked: { type: Boolean, required: true },
  label: { type: String, required: true },
  icon: { type: String },
  value: { type: String },
  store: { type: Object },
})

const emit = defineEmits(['update:checkedValue'])
const handleClick = () => {
  emit('update:checkedValue', props.value)

  const { $filtersStore }: any = useNuxtApp()

  if (props.store) {
    props.store.updateAllFiltersOptions(props.value)
  } else {
    $filtersStore.updateAllFiltersOptions(props.value)
  }
}
</script>
