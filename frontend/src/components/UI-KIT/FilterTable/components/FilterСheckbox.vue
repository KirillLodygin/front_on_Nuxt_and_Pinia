<template>
  <div :class="disabled ? 'text-secondary' : ''" class="checkbox-block">
    <input
      :id="choice.value"
      :checked="choice.checked"
      :disabled="disabled"
      :name="name"
      :value="choice.value"
      type="checkbox"
    />
    <label :class="choice.checked ? 'checked' : 'unchecked'" @click="handleClick()">{{
      returnFormattedDisplayName(choice.display_name)
    }}</label>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue'
import type { PropType } from 'vue'
import type { choiceType } from '~/types/objectsFiltersStoreTypes'

const props = defineProps({
  choice: { type: Object as PropType<choiceType>, required: true },
  name: { type: String, required: true },
  disabled: { type: Boolean, default: false },
  field: { type: String, required: true },
  isAllFilters: { type: Boolean, required: true },
  store: { type: [String, Object], required: false },
})

const emit = defineEmits(['update:checkedValue', 'changeFilter'])

const { $refsFiltersStore, $filtersStore } = useNuxtApp()

const objectType = computed(() => $filtersStore.searchParams.object_type_calc)

const handleClick = () => {
  if (props.disabled) return
  emit('update:checkedValue', props.choice.value)
  emit('changeFilter')
  if (typeof props.store === 'object') {
    props.store.updateCheckedFilter(
      props.field,
      props.choice.value,
      props.isAllFilters,
      props.store.searchParams.object_type_calc,
    )
  } else if (props.store === 'refsFiltersStore') {
    $refsFiltersStore.updateCheckedFilter(props.field, props.choice.value, props.isAllFilters)
  } else {
    // Условие проверки на disabled теперь корректно, так как disabled имеет значение по умолчанию
    if (!props.disabled) {
      $filtersStore.updateCheckedFilter(props.field, props.choice.value, props.isAllFilters, objectType.value)
    }
  }
}

const returnFormattedDisplayName = (displayName: string) => {
  return displayName.split(':')[0]
}
</script>
