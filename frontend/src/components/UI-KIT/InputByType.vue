<template>
  <div v-if="type === 'field'" class="input-wrapper">
    <InputByTypeLabel :label="label" :required="required" />
    <div class="input-and-icon">
      <BFormInput
        v-model="value"
        :required="required"
        :disabled="disabled"
        autocomplete="none"
        class="map-object-properties_body_input form-control form-control-lg"
      ></BFormInput>
    </div>
  </div>
  <div v-else-if="type === 'string'" class="input-wrapper">
    <InputByTypeLabel :label="label" :required="required" />
    <div class="input-and-icon">
      <BFormInput
        v-model="value"
        :required="required"
        :disabled="disabled"
        autocomplete="none"
        class="map-object-properties_body_input form-control form-control-lg"
      ></BFormInput>
    </div>
  </div>
  <div v-else-if="type === 'decimal'" class="input-wrapper">
    <InputByTypeLabel :label="label" :required="required" />
    <div class="input-and-icon">
      <BFormInput
        v-model="value"
        :required="required"
        :disabled="disabled"
        autocomplete="none"
        class="map-object-properties_body_input form-control form-control-lg"
        :key="key"
        @blur="key++"
      ></BFormInput>
    </div>
  </div>
  <div v-else-if="type === 'datetime'" class="input-wrapper">
    <InputByTypeLabel :label="label" :required="required" />
    <div class="input-and-icon">
      <DatePickerInput
        v-model="value"
        :required="required"
        :disabled="disabled"
        class="map-object-properties_body_input form-control form-control-lg"
      />
    </div>
  </div>
  <div v-else-if="type === 'choice'" class="input-wrapper">
    <InputByTypeLabel :label="label" :required="required" />
    <SelectWithOptions v-model="value" :default="value" :is-cube="isCube" :options="options" :required="required" />
  </div>
  <div v-else-if="type === 'checkbox'" class="input-wrapper">
    <InputByTypeLabel :label="label" :required="required" />
    <div
      :class="checkboxContainerClass ? checkboxContainerClass : ''"
      class="input-and-icon input-and-icon__checkbox d-flex flex-column"
    >
      <div
        v-for="(option, i) in options"
        :key="option.value"
        class="check-block"
        :class="option.disabled ? 'disabled-checkbox' : ''"
      >
        <input
          :id="option.value + i"
          v-model="value"
          :value="option.value"
          :disabled="option.disabled"
          class="d-none"
          type="checkbox"
        />
        <label
          :class="value.includes(option.value) ? 'checked' : 'unchecked'"
          @click.stop="handleClick(option.value + i)"
          >{{ option.display_name }}</label
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import InputByTypeLabel from './Inputs/InputByTypeLabel.vue'
import SelectWithOptions from './Selects/SelectWithOptions.vue'
import DatePickerInput from './Inputs/DatePickerInput.vue'

interface Props {
  modelValue: any
  type: string
  label: string
  options: any[]
  isCube: boolean
  required: boolean
  disabled?: boolean
  checkboxContainerClass?: string
  hyphenedDate?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'update:checkedValue'])
const key = ref(0)
const value = computed({
  get: () => {
    if (props.type === 'datetime' && props.modelValue && props.hyphenedDate) {
      return props.modelValue.split('T')[0].split('-').reverse().join('.')
    }
    return props.modelValue
  },
  set: (value) => {
    if (props.type === 'decimal') emit('update:modelValue', value.replace(/[^0-9.,]+/g, '').replace(',', '.'))
    else if (props.type === 'datetime' && props.hyphenedDate)
      emit('update:modelValue', value.split('.').reverse().join('-'))
    else emit('update:modelValue', value)
  },
})

const handleClick = (valueArg: string) => {
  const input = document.getElementById(valueArg) as HTMLInputElement
  if (input) {
    const isChecked = value.value.includes(input.value)

    if (isChecked) {
      // Проверяем, будет ли после удаления остаться только один чекбокс
      if (value.value.length === 1 && value.value.includes(input.value)) {
        return // Предотвращаем снятие, если это последний чекбокс
      } else {
        // Убираем значение из массива
        value.value = value.value.filter((v: string) => v !== input.value)
      }
    } else {
      // Добавляем значение в массив
      value.value = [...value.value, input.value]
    }
  }
}
</script>
