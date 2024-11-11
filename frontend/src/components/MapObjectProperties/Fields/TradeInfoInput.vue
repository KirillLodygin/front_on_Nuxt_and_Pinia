<template>
  <div class="input-wrapper" :class="props.unavailable ? 'input-wrapper__unavailable' : ''">
    <div class="label-wrapper d-flex align-items-center">
      <MapObjectPropertiesInputLabel :object-data="{ label: props.label }" :required-computed="false" />

      <Switcher
        v-if="requiredComputed"
        v-model="isAddedToForm"
        :disabled="nuxtApp.$objectStore.readOnly"
        class="ms-auto"
      />
    </div>
    <div v-if="props.field === 'date_trade'" class="input-and-icon">
      <DatePickerInput
        :id="`trade_${index}`"
        v-model="computedDateValue"
        :class="props.unavailable ? 'form-control__unavailable' : ''"
        :disabled="nuxtApp.$objectStore.readOnly"
        :style="disabledComputed ? disabledCssProp : {}"
        class="map-object-properties_body_input form-control form-control-lg ms-0"
      />
    </div>
    <div v-else-if="props.field === 'is_trade_ending'" class="input-and-icon">
      <CustomSelect
        :default="computedValue"
        :disabled="false"
        :field="props.field"
        :is-cube="true"
        :options="selectorOptions"
        :required="false"
        :disabled-modifier="$objectStore.readOnly"
        class="select"
        @input="
          ($event: any) => {
            computedValue = $event
          }
        "
      />
    </div>
    <div v-else class="input-and-icon">
      <BFormInput
        autocomplete="none"
        class="map-object-properties_body_input form-control form-control-lg"
        v-model="computedValue"
        :class="props.unavailable ? 'form-control__unavailable' : ''"
        type="text"
        :disabled="disabledComputed || nuxtApp.$objectStore.readOnly"
        :style="disabledComputed ? disabledCssProp : ''"
        @focus="
          (e: any) => {
            e.target.value = computedValue
          }
        "
        @blur="
          (e: any) => {
            e.target.value = computedValue
          }
        "
      ></BFormInput>
    </div>
  </div>
</template>

<script setup lang="ts">
import CustomSelect from '~/components/UI-KIT/Selects/BaseCustomSelect.vue'
import Switcher from '~/components/UI-KIT/Selects/Switcher.vue'
import DatePickerInput from '~/components/UI-KIT/Inputs/DatePickerInput.vue'
import MapObjectPropertiesInputLabel from '~/components/MapObjectProperties/Fields/MapObjectPropertiesInputLabel.vue'

const nuxtApp = useNuxtApp()
// @ts-ignore
const props = defineProps({
  label: { type: String, required: true },

  value: { type: [String, Number, Boolean, null], required: true },
  index: { type: Number as any, required: true },
  selectOptions: { type: Array, required: true },
  field: { type: String as any, required: false },
  info: { type: String, required: false },
  unavailable: { type: Boolean },
})
const emit = defineEmits(['updateTradeInfo'])

const disabledCssProp = {
  backgroundImage: `url(/img/no-edit.svg)`,
  backgroundRepeat: `no-repeat`,
  backgroundPosition: `right 10px bottom 10px`,
}

const selectorOptions = props.selectOptions.map((obj: any) => {
  if (obj.value === 'None') {
    return { value: null, display_name: obj.display_name }
  } else if (obj.value === 'True') {
    return { value: true, display_name: obj.display_name }
  } else if (obj.value === 'False') {
    return { value: false, display_name: obj.display_name }
  }
})
// console.log(props.field, props.selectOptions, selectorOptions)
const infoCssProp = {
  backgroundImage: `url(/img/info-main.svg)`,
}
const computedDateValue = computed({
  get: () => computedValue.value?.split('-').reverse().join('.'),
  set: (newValue: any) => {
    computedValue.value = newValue.split('.').reverse().join('-')
  },
})
const computedValue: any = computed({
  get() {
    let valueIsNumber: null | boolean = null
    console.log('get', props.field, valueIsNumber)
    if (props.value && typeof props.value !== 'boolean') {
      valueIsNumber = typeof props.value === 'number' ? true : /^\d+(\.\d+)?$/.test(props.value.replace(',', '.'))
    }
    if (!isAddedToForm.value) {
      emit('updateTradeInfo', props.index, props.field, null)
    }
    if (['price_start', 'price_start_per_m', 'price_sale', 'price_sale_per_m'].includes(props.field)) {
      const val = String(parseFloat(String(props.value)))
      return valueIsNumber ? val.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : props.value
    } else {
      return props.value
    }
  },
  set(value: any) {
    let val
    if (['price_start', 'price_sale'].includes(props.field)) {
      if (value) {
        val = parseFloat(
          value
            .replace(/[^0-9,.]/g, '')
            .replace(',', '.')
            .replaceAll(' ', ''),
        )
      } else {
        val = null
      }
    } else if (props.field === 'date_trade') {
      if (value) {
        val = value
      } else {
        val = null
      }
    } else {
      val = value
    }
    emit('updateTradeInfo', props.index, props.field, val)
  },
})

const isAddedToForm = ref(true)

const disabledComputed = computed(
  () => ['price_start_per_m', 'price_sale_per_m'].includes(props.field) || !isAddedToForm.value,
)

const requiredComputed = props.field === 'price_sale' ? ref(true) : ref(false)
</script>
