<template>
  <template v-if="!isCube">
    <div :class="menuClasses" :tabindex="tabindex" class="form-select-menu" @blur="open = false">
      <div :class="SelectedItems" class="selected d-flex" style="height: 56px" @click="toggleOpen">
        {{ selected?.split(':')[0] }}
        <i :class="iconClasses"></i>
      </div>
      <div :class="{ selectHide: !open, itemsOpen: open }" class="items">
        <div v-if="!required && !isForRent" class="select-option" @click="clearSelection">Вернуть пустое значение</div>
        <div
          v-for="(option, i) of optionsComputed"
          :key="i"
          :title="option.display_name"
          :class="getOptionClass(option)"
          @mousedown="() => onOptionClick(option)"
        >
          {{ option.display_name.split(':')[0] }}
        </div>
      </div>
    </div>
  </template>

  <template v-else>
    <div class="cube-select-options flex-wrap" :class="props.required && !props.default ? 'is-invalid-select' : ''">
      <!-- <div > -->
      <div
        v-for="(option, index) of optionsComputed"
        :key="index"
        :class="getOptionClasses(option, index)"
        class="cube-select-option"
        @mousedown="() => onOptionSelect(option)"
      >
        {{
          abbreviations[option.display_name] ? abbreviations[option.display_name] : option.display_name.split(':')[0]
        }}
      </div>
      <!-- </div> -->
    </div>
  </template>
</template>

<script lang="ts" setup>
import { abbreviations } from '~/app_constants/wordAbbreviations'

interface Props {
  options: Array<any>
  default: any
  required: boolean
  disabled?: boolean
  unavailable?: boolean
  field?: string
  price?: boolean
  isCube?: boolean
  mutableData?: { [key: string]: any }
  isForRent?: boolean
  disabledModifier?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['input', 'rerender'])
const { $objectStore } = useNuxtApp()
const selected: any = ref(props.default)
const valueSelected: any = ref(null)
const open = ref(false)
const tabindex = ref(0)

const menuClasses = computed(() => {
  const classes = []
  if (disabledComputed.value) {
    classes.push('disabled')
  }
  if (props.price && open.value) {
    classes.push('button-wrapper__open')
  }
  return classes
})

const SelectedItems = computed(() => {
  return [
    props.required && !valueSelected.value ? 'is-invalid' : 'is-valid',
    open.value ? 'open' : '',
    props.price ? 'justify-content-center align-items-center' : '',
    props.unavailable ? 'selected__unavailable' : '',
  ]
    .filter(Boolean)
    .join(' ') // Фильтруем пустые строки и соединяем в одну строку
})

// Функция, возвращающая классы для опции
const getOptionClass = (option: { value: any; disabled: any }) => {
  return {
    'select-option text-nowrap': true,
    active: valueSelected.value === option.value,
    'select-option__disabled': option.disabled,
  }
}
const getOptionClasses = (option: { value: any; disabled: any }, index: number) => ({
  first: index === 0,
  last: index === optionsComputed.value.length - 1,
  active: valueSelected.value === option.value,
  disabled: disabledComputed.value || option.disabled,
  'cube-select-option': true,
})

const onOptionSelect = (option: { [x: string]: any; disabled?: any; value?: any; display_name?: any }) => {
  if (disabledComputed.value || option.disabled) return
  valueSelected.value = option.value
  selected.value = option.display_name
  emit('input', getEmittableValue(option))
}

// Метод для обработки клика по опции
const onOptionClick = (option: { [x: string]: any; disabled?: any; display_name?: any; value?: any }) => {
  if (option.disabled) {
    return
  }
  selected.value = option.display_name
  valueSelected.value = option.value
  open.value = false
  emit('input', getEmittableValue(option))
}

const iconClasses = computed(() => [
  'icon',
  'caret-icon',
  'align-self-center',
  open.value ? 'fi_chevron-up' : 'fi_chevron-down',
  props.price ? 'ms-2' : 'ms-auto',
])

const clearSelection = () => {
  selected.value = ''
  open.value = false
  valueSelected.value = null
  emit('input', null)
}

const toggleOpen = () => {
  if (!disabledComputed.value) {
    open.value = !open.value
  }
}

const optionsComputed = computed(() => {
  if (!props.options || typeof props.field === 'undefined') {
    return []
  }

  if (!Array.isArray(props.options)) {
    return props.options
  }

  // Фильтрация опций на основе их значения и поля
  return props.options.filter((option) => {
    const isExcludedValue = option.value === 'C' || option.value === 'B'
    const isExcludedField = ['engineering_severage', 'engineering_water', 'engineering_heat'].includes(
      props.field as any,
    )

    // Включаем опцию, если она не соответствует критериям исключения
    return !(isExcludedValue && isExcludedField)
  })
})

const updateSelectedFromValue = (value: any) => {
  const foundOption = optionsComputed.value.find((option) => {
    return option.value === value || (value && option.value === JSON.parse(JSON.stringify(value)).id)
  })
  if (foundOption) {
    selected.value = foundOption.display_name
    valueSelected.value = foundOption.value
  } else {
    selected.value = value
    valueSelected.value = value
  }
}

if (props.field && props.mutableData) {
  const updateSelection = (newVal: any) => {
    const selectedOption = optionsComputed.value.find(
      (option) => option.value === newVal || (newVal && option.value === JSON.parse(JSON.stringify(newVal)).id),
    )
    if (selectedOption) {
      selected.value = selectedOption.display_name
      valueSelected.value = selectedOption.value
    } else {
      selected.value = newVal
      valueSelected.value = newVal
    }
  }

  watch(() => props.mutableData![props.field as any], updateSelection, { immediate: true })
}

const getEmittableValue = (option: { [key: string]: any }) => {
  if (option.content) {
    return option.content
  } else return option.value
}

watch(
  () => $objectStore.readOnly,
  () => {
    emit('rerender')
  },
)
const disabledComputed = computed(() => {
  return props.unavailable || props.disabled || props.disabledModifier
})
// watch(
//   () => props.options,
//   (newVal) => {
//     console.log(newVal)
//   },
//   { deep: true },
// )

watch(optionsComputed, (newVal) => {
  if (newVal) {
    newVal.forEach((option) => {
      if (
        option.value === props.default ||
        (props.default && option.value === JSON.parse(JSON.stringify(props.default)).id)
      ) {
        selected.value = option.display_name
        valueSelected.value = option.value
      }
    })
  }
})

watch(
  () => props.default,
  () => updateSelectedFromValue,
)

// Created
if (props.options && Array.isArray(props.options)) {
  optionsComputed.value.forEach((option) => {
    if (option.value === props.default) {
      valueSelected.value = option.value
      selected.value = option.display_name
    }
  })
}
</script>

<style scoped></style>
