<template>
  <div class="check-block">
    <input type="checkbox" :name="name" :value="field" :checked="isSwitchOn" />
    <label :class="isSwitchOn ? 'checked' : 'unchecked'" @click="handleClick()">{{ label }}</label>
  </div>
</template>

<script setup name="SortTableCheckbox" lang="ts">
import { useNuxtApp } from 'nuxt/app'

const props = defineProps({
  name: { type: String, required: true },
  field: { type: String, required: true },
  label: { type: String, required: true },
  isSwitchOn: { type: Boolean, required: true },
})

const handleClick = () => {
  const { $filtersStore }: any = useNuxtApp()
  $filtersStore.changeTableStructure(props.field)
}
</script>
