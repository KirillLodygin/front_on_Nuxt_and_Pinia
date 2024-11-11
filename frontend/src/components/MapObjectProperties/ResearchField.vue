<template>
  <div v-if="type === 'none'" class="field-wrapper" :class="isSublayer ? 'ps-4' : ''">
    <div v-for="(option, i) in optionsComputed" :key="option.value" class="check-block research-check-block">
      <input class="d-none" type="checkbox" :id="option.value + i" :value="option.value" v-model="checkBoxValue" />
      <label :class="getLabelClass(option.value)" @click.stop="handleClick(option.value + i)"></label>
      <div class="row flex-grow-1">
        <div
          :class="
            props.expandable ? (props.expanded ? 'opened-filter checkbox-top' : 'closed-filter checkbox-top') : ''
          "
          class="d-flex me-auto research-filter-name col flex-grow-1 align-items-top"
          :role="!isSublayer ? 'button' : ''"
          @click="emit('expanded')"
        >
          <i
            v-if="props.expandable"
            class="icon checkbox-top-chevron"
            :class="props.expanded ? 'fi_chevron-down' : 'fi_chevron-right'"
          />
          {{ option.display_name }}
        </div>
        <div v-if="checkBoxValue.includes(option.value)" class="col-1 d-flex align-items-center justify-content-center">
          <div
            class="colored-checkbox"
            :style="checkBoxValue.includes(option.value) ? { backgroundColor: option.color } : {}"
          />
        </div>
        <div
          v-if="props.isLayer && props.displayCounts"
          class="ms-1 col-1 d-flex align-items-center justify-content-center me-1"
        >
          {{ props.countByCheckedLayers[props.field!] }}
        </div>
        <div v-else-if="props.displayCounts" class="ms-1 col-1 d-flex align-items-center justify-content-center me-1">
          {{ props.countByCheckedSublayers[option.value!] }}
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="type === 'choice'" class="field-wrapper field-wrapper__choice">
    <p v-if="label" class="field-text field-text__choice">{{ label }}</p>
    <div class="field-group h-100">
      <SelectWithOptions v-model="value" :options="props.options!" :required="true" :default="value" />
    </div>
  </div>
</template>

<script setup lang="ts">
import _isEqual from 'lodash/isEqual'
import SelectWithOptions from '../UI-KIT/Selects/SelectWithOptions.vue'
interface Props {
  modelValue: any
  options?: any[]
  label?: string
  type: string
  expandable: boolean
  expanded: boolean
  isLayer?: boolean
  isSublayer?: boolean
  field?: string
  countByCheckedLayers?: any
  countByCheckedSublayers?: any
  displayCounts?: boolean
  searchable: boolean
  searchStr?: string
  intermediateState?: boolean
}
const props = defineProps<Props>()

const emit = defineEmits(['update:modelValue', 'update:checkedValue', 'checkAll', 'uncheckAll', 'expanded'])
const value = computed({
  get: () => {
    return props.modelValue
  },
  set: (value) => emit('update:modelValue', value),
})

const getLabelClass = (optionValue: any) => {
  return {
    'checkbox-top': true,
    checked: checkBoxValue.value.includes(optionValue) && !props.intermediateState,
    unchecked: !checkBoxValue.value.includes(optionValue) && !props.intermediateState,
    intermediate: props.intermediateState,
  }
}

const handleClick = (valueArg: string) => {
  const input = document.getElementById(valueArg)
  input?.click()
}
const checkBoxValue = ref(props.modelValue)
watch(
  () => checkBoxValue.value,
  (newVal, oldVal) => {
    if (!_isEqual(newVal, oldVal)) {
      emit('update:modelValue', newVal)
      if (!props.intermediateState) {
        if (props.type === 'none' && props.field && newVal.includes(props.field)) {
          emit('checkAll', props.field)
        } else emit('uncheckAll', props.field)
      } else {
        if (props.type === 'none' && props.field && newVal.includes(props.field)) {
          emit('checkAll', props.field)
        }
      }
    }
  },
)

const optionsComputed = computed(() => {
  if (props.isLayer) {
    return props.options?.filter((item) => item.value === props.field)
  } else if (props.searchable && props.searchStr) {
    return props.options?.filter((item) =>
      item.display_name.toLocaleLowerCase().includes(<string>props.searchStr?.toLocaleLowerCase()),
    )
  } else return props.options
})

watch(
  () => props.modelValue,
  (newVal, oldVal) => {
    if (props.type === 'none') {
      checkBoxValue.value = newVal
    }
  },
)
</script>

<style scoped></style>
