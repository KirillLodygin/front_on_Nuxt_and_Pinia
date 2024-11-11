<template>
  <div class="input-and-icon" ref="rootElement" v-click-outside="handleClickOutside">
    <input
      :id="componentId"
      v-mask="dateMask"
      :class="[
        props.class ? props.class : 'ms-auto me-2 position-relative form-control',
        { 'short-filter-input': props.short },
        { 'is-invalid': (props.modelValue && !validDate) || (props.required && !props.modelValue) },
      ]"
      :max="props.max || ''"
      :required="props.required || false"
      :state="props.state || false"
      :disabled="props.disabled"
      :placeholder="props.placeholder || 'дд.мм.гггг'"
      :style="props.style ? props.style : ''"
      :value="props.modelValue"
      autocomplete="none"
      type="text"
      @change.prevent="inputDate"
      @keydown.delete="checkFirstLetter"
    />
    <i
      v-if="!props.disabled"
      class="background-icon icon icon-lg fi_calendar end-0 me-2"
      role="button"
      @click.stop="toggleDatePicker"
    />
    <BPopover
      v-model="datePickerPopover"
      :target="componentId"
      custom-class="overflow-hidden"
      placement="bottom"
      :manual="true"
    >
      <VDatePicker v-model="pickerDate" locale="ru-RU" :max-date="maxDate" :min-date="minDate" />
    </BPopover>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { openDatePickerId } from '~/composables/datePickerStore'

interface Props {
  modelValue: string | null
  placeholder?: string
  short?: boolean
  id?: string // Сделаем id необязательным
  class?: string
  disabled?: boolean
  style?: any
  max?: string
  state?: boolean
  required?: boolean
  maxDate?: string | null
  minDate?: string | null
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'input'])
const dateMask = '##.##.####'

const rootElement = ref(null)
const datePickerPopover = ref(false)
const validDate = ref(true)

const componentId = ref(props.id || `datePickerInput-${Math.random().toString(36).substr(2, 9)}`)

const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

const pickerDate = computed({
  get: () => {
    if (props.modelValue) {
      const [day, month, year] = props.modelValue.split('.')
      const dateSt = new Date(Number(year), Number(month) - 1, Number(day))
      return new Date(dateSt.getFullYear(), dateSt.getMonth(), dateSt.getDate())
    }
    return new Date()
  },
  set: (newValue: Date) => {
    const formattedDate = formatDate(new Date(newValue.getFullYear(), newValue.getMonth(), newValue.getDate()))
    emit('update:modelValue', formattedDate)
    emit('input')
    validDate.value = true
    datePickerPopover.value = false
  },
})

const minDate = computed(() => {
  if (props.minDate) {
    const [day, month, year] = props.minDate.split('.')
    return new Date(Number(year), Number(month) - 1, Number(day))
  }
  return null
})

const maxDate = computed(() => {
  if (props.maxDate) {
    const [day, month, year] = props.maxDate.split('.')
    return new Date(Number(year), Number(month) - 1, Number(day))
  }
  return null
})

// Функция для установки сегодняшней даты
const setTodayDate = () => {
  const today = new Date()
  const formattedDate = formatDate(today)
  emit('update:modelValue', formattedDate)
  emit('input')
}

const toggleDatePicker = () => {
  if (!datePickerPopover.value) {
    setTodayDate()
    datePickerPopover.value = true
  } else {
    datePickerPopover.value = false
  }
}

// Проверка удаления первой буквы
const checkFirstLetter = (event: Event) => {
  const eventTargetA = event.target as HTMLInputElement
  const isFirstSelected = eventTargetA.selectionStart === 1
  datePickerPopover.value = false
  setTimeout(() => {
    const eventTarget = event.target as HTMLInputElement
    if (isFirstSelected) {
      setTimeout(() => {
        eventTarget.focus()
        eventTarget.setSelectionRange(0, 0)
      }, 0)
    }
  }, 0)
}

// Обработка ввода даты
const inputDate = (event: Event) => {
  datePickerPopover.value = false
  const eventTarget = event.target as HTMLInputElement
  const editedValue = eventTarget.value
  const [day, month, year] = editedValue.split('.')
  const dateObj = new Date(Number(year), Number(month) - 1, Number(day))

  if (isNaN(dateObj.getTime()) || editedValue !== formatDate(dateObj)) {
    validDate.value = false
  } else {
    validDate.value = true
    emit('update:modelValue', editedValue)
    emit('input')
  }
}

// Функция для обработки клика вне элемента
const handleClickOutside = () => {
  datePickerPopover.value = false
}
</script>
