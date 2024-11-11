<template>
  <template v-if="isCube">
    <div class="cube-select-options">
      <div
        v-for="(option, index) of props.options"
        :id="'cube-select-option' + field"
        :key="index"
        :class="getClassByOption(option, index)"
        class="cube-select-option"
        @click="handleOptionClick(option)"
      >
        {{ option.display_name }}
      </div>
    </div>
  </template>
  <template v-else>
    <div
      :class="[disabledComputed ? 'disabled' : '', props.price && open ? 'button-wrapper__open' : '']"
      :tabindex="tabindex"
      class="form-select-menu select"
      @blur="open = false"
    >
      <div :class="classList" class="selected d-flex" @click="toggleOpen">
        {{ selected }}
        <i :class="iconList"></i>
      </div>
      <div :class="{ selectHide: !open, itemsOpen: open }" class="items overflow-y-auto">
        <div
          v-if="!required"
          class="select-option empty"
          @mousedown="
            () => {
              selected = ''
              open = false
              valueSelected = null
              $emit('update:modelValue', null)
            }
          "
        >
          Вернуть пустое значение
        </div>
        <div
          v-for="(option, i) of props.options"
          :key="i"
          :class="getClass(option)"
          :title="option.display_name"
          @mousedown="() => handleClick(option)"
        >
          {{ option.display_name }}
        </div>
      </div>
    </div>
  </template>
</template>

<script lang="ts" setup>
import { cloneDeep } from 'lodash'

interface Props {
  modelValue: string | null
  options: Array<any>
  default: any
  required: boolean
  disabled?: boolean
  unavailable?: boolean
  field?: string
  price?: boolean
  isCube?: boolean
  optionTextNowrap?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const { $objectStore } = useNuxtApp()
const selected: any = computed(() => {
  return props.options.find((option) => option.value === props.default)?.display_name
})
const valueSelected: any = ref(null)
const open = ref(false)
const tabindex = ref(0)

const disabledComputed = computed(() => {
  return props.unavailable || props.disabled
})

const getClassByOption = (option: any, index: any) => {
  return {
    first: index === 0,
    last: index === props.options.length - 1,
    active: props.default === option.value,
    disabled: disabledComputed.value,
  }
}

const toggleOpen = () => {
  if (!disabledComputed.value) {
    open.value = !open.value
  }
}

const handleOptionClick = (option: { disabled: any; value: string; display_name: any }) => {
  console.log('handleOptionClick option', option)
  if (disabledComputed.value || option.disabled) return
  valueSelected.value = option.value
  selected.value = option.display_name
  selectValue(option.value)
}

const classList = computed(() => {
  return [
    props.required && valueSelected.value === null ? 'is-invalid' : 'is-valid',
    open.value ? 'open' : '',
    props.price ? 'justify-content-center align-items-center' : '',
    props.unavailable ? 'selected__unavailable' : '',
  ]
})

const getClass = (option: any) => {
  return {
    'select-option': true,
    'text-nowrap': typeof props.optionTextNowrap === 'undefined' ? true : props.optionTextNowrap,
    active: props.default === option.value,
    'select-option__disabled': option.disabled,
  }
}

const handleClick = (option: any) => {
  console.log('handleClick')
  if (option.disabled) {
    return
  }
  selected.value = option.display_name
  valueSelected.value = option.value
  open.value = false
  selectValue(option.value)
}

const iconList = computed(() => [
  'caret-icon',
  'icon',
  open.value ? 'fi_chevron-up' : 'fi_chevron-down',
  'align-self-center',
  props.price ? 'ms-2' : 'ms-auto',
])

const selectValue = (val: string) => {
  console.log('selectValue', val)
  emit('update:modelValue', val)
}
if (props.options && Array.isArray(props.options)) {
  props.options.forEach((option) => {
    if (option.value === props.default) {
      valueSelected.value = option.value
      selected.value = option.display_name
    }
  })
}
const optionRef = toRefs(props).options
watch(
  () => optionRef.value,
  (newVal) => {
    if (Array.isArray(newVal) && newVal.length > 0 && valueSelected.value) {
      const currentValueExists = newVal.some((item) => item.value === valueSelected.value)

      // Если текущее выбранное значение не существует, устанавливаем первое значение из списка
      if (!currentValueExists) {
        valueSelected.value = newVal[0].value
        selected.value = newVal[0].display_name
        selectValue(newVal[0].value)
      }
    }
  },
  { deep: true },
)
</script>
