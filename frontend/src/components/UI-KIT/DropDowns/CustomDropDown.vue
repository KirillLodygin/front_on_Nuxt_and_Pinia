<template>
  <div>
    <span v-if="title">{{ title }}</span>
    <b-dropdown :text="selectedText" :class="dropDownClass">
      <b-dropdown-form>
        <b-form-checkbox-group v-model="internalValue" stacked>
          <b-form-checkbox v-for="option in options" :key="option.value" :value="option.value">
            {{ option.text }}
          </b-form-checkbox>
          <span v-if="!options.length">Опций нет</span>
        </b-form-checkbox-group>
      </b-dropdown-form>
    </b-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineProps, defineEmits } from 'vue'

interface Option {
  value: string
  text: string
}

const props = defineProps({
  title: String,
  options: { type: Array as PropType<Option[]>, default: () => [] },
  dropDownClass: String,
  text: String,
  modelValue: { type: Array as PropType<string[]>, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])
const internalValue = ref(props.modelValue)

watch(internalValue, (newValue) => {
  emit('update:modelValue', newValue)
})

// Create a computed property to generate the display text
const selectedText = computed(() => {
  if (internalValue.value.length === 0) {
    return props.text
  }
  const selectedOptions = props.options
    .filter((option) => internalValue.value.includes(option.value))
    .map((option) => option.text)

  if (selectedOptions.length === 1) {
    return selectedOptions[0]
  } else {
    return `${selectedOptions[0]}...`
  }
})
</script>
