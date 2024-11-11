<template>
  <div v-if="props.addFactors" class="h-100 scenario-wrapper pe-2">
    <div class="card-toolbar">
      <button :disabled="$objectStore.readOnly || !isAllNamesFilled" class="btn bth-tool" @click="addNewFactor">
        <i class="icon fi_plus-circle fa-fw me-1" />Добавить доп. ЦОФ
      </button>
    </div>

    <div class="overflow-x-hidden overflow-y-auto p-2 h-90">
      <div v-for="(obj, index) in addFactorsData" :key="`${obj}_${index}}`" class="trade-block w-100 loop-panel mb-3">
        <div class="trade-header d-flex justify-content-between align-items-center">
          <div class="card-title">Доп ЦОФ {{ index + 1 }}. {{ obj.label }}</div>
          <button
            :disabled="$objectStore.readOnly"
            class="btn btn-outline-secondary btn-sm-rounded"
            @click="deleteFactor(+index)"
          >
            <i class="icon fi_trash" />
          </button>
        </div>
        <div class="d-flex justify-content-between map-object-properties_body_inputs_row row">
          <div class="col-6">
            <MapObjectPropertiesInputLabel :object-data="{ label: 'Название' }" :required-computed="false" />
            <BFormInput
              v-model="obj.label"
              :disabled="$objectStore.readOnly"
              class="map-object-properties_body_input form-control form-control-lg"
              @input="setFieldName(obj, $event)"
              @update:model-value="emit('updateMutableData', 'add_factors', addFactorsData)"
            />
          </div>
          <div class="col-6">
            <MapObjectPropertiesInputLabel :object-data="{ label: 'Значение' }" :required-computed="false" />
            <BFormInput
              v-model="obj.value"
              :disabled="$objectStore.readOnly"
              class="map-object-properties_body_input form-control form-control-lg"
              @update:model-value="emit('updateMutableData', 'add_factors', addFactorsData)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import _cloneDeep from 'lodash/cloneDeep'
import { translit } from '~/utils/translit'
import MapObjectPropertiesInputLabel from '~/components/MapObjectProperties/Fields/MapObjectPropertiesInputLabel.vue'

interface Props {
  addFactors: { field: any; label: any; value: any }[]
}

const props = defineProps<Props>()
const emit = defineEmits(['updateMutableData'])
const { $objectStore } = useNuxtApp()
const addFactorsData = ref(_cloneDeep(props.addFactors))
const deleteFactor = (index: number) => {
  addFactorsData.value.splice(index, 1)
  console.log('deleteFactor', addFactorsData.value)
  emit('updateMutableData', 'add_factors', addFactorsData.value)
}
const addNewFactor = () => {
  addFactorsData.value.push({
    field: '',
    label: '',
    value: '',
  })
  emit('updateMutableData', 'add_factors', addFactorsData.value)
}

const setFieldName = (obj: any, event: Event) => {
  const target = event.target as HTMLInputElement
  if (target) {
    obj.field = translit(target.value)
  }
}

const isAllNamesFilled = computed(() =>
  addFactorsData.value.length
    ? addFactorsData.value.filter((item) => item.label).length === addFactorsData.value.length
    : true,
)
</script>

<style scoped></style>
