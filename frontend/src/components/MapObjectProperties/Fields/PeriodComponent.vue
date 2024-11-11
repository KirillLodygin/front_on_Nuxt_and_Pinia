<template>
  <div class="tab_standard-fields_group_row_input-wrapper period">
    <div class="card-title mt-2 mb-3">Период неосновательного обогащения</div>
    <div class="row">
      <div class="col-6">
        <MapObjectPropertiesInputLabel
          :object-data="mutableOptions.enrichment_begin.objectData"
          :required-computed="false"
        />
        <DatePickerInput
          id="startDateValue"
          v-model="startDateValue"
          :disabled="disabledComputed"
          :required="requiredComputed"
          :state="
            requiredComputed ? !!startValue && new Date(startValue).getTime() > new Date('1900-01-01').getTime() : true
          "
          class="map-object-properties_body_input form-control form-control-lg date-input"
        />
      </div>
      <div class="col-6">
        <MapObjectPropertiesInputLabel
          :object-data="mutableOptions.enrichment_end.objectData"
          :required-computed="false"
        />
        <DatePickerInput
          id="endDateValue"
          v-model="endDateValue"
          :disabled="disabledComputed"
          :required="requiredComputed"
          :state="
            requiredComputed ? !!endValue && new Date(endValue).getTime() > new Date('1900-01-01').getTime() : true
          "
          class="map-object-properties_body_input form-control form-control-lg date-input"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DatePickerInput from '~/components/UI-KIT/Inputs/DatePickerInput.vue'
import MapObjectPropertiesInputLabel from '~/components/MapObjectProperties/Fields/MapObjectPropertiesInputLabel.vue'

interface Props {
  startData: string
  endData: string
  mutableOptions: { [key: string]: any }
  mutableData: { [key: string]: any }
  required: boolean
  disabled: boolean
}
const props = defineProps<Props>()
const emit = defineEmits(['updateMutableData'])
const { $objectStore } = useNuxtApp()
const startValue = ref(props.startData && props.startData.split('T')[0])
const endValue = ref(props.endData && props.endData.split('T')[0])
const startDateValue = computed({
  get: () => startValue.value?.split('-').reverse().join('.'),
  set: (newValue) => {
    startValue.value = newValue.split('.').reverse().join('-')
  },
})
const endDateValue = computed({
  get: () => endValue.value?.split('-').reverse().join('.'),
  set: (newValue) => {
    endValue.value = newValue.split('.').reverse().join('-')
  },
})
const disabledComputed = computed(() => {
  return props.disabled || $objectStore.readOnly
})
const requiredComputed = computed(() => {
  return props.required
})
watch(
  () => props.mutableData.enrichment_begin,
  (newVal) => {
    startValue.value = newVal
  },
)
watch(
  () => props.mutableData.enrichment_end,
  (newVal) => {
    endValue.value = newVal
  },
)
watch(
  () => startValue.value,
  (newVal) => {
    emit('updateMutableData', 'enrichment_begin', newVal)
  },
)
watch(
  () => endValue.value,
  (newVal) => {
    emit('updateMutableData', 'enrichment_end', newVal)
  },
)
</script>

<style scoped></style>
