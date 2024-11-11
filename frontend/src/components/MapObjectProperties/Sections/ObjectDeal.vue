<template>
  <div class="h-100 p-2">
    <div v-if="isFieldsVisible" class="d-flex flex-column overflow-y-scroll card-panel flex-grow-1">
      <div v-for="row in scenario" :key="row.join(',')" class="row mb-3">
        <InputByType
          v-for="rowItem in row"
          :model-value="fieldValues[rowItem.field]"
          :type="mutableOptions[rowItem.field].objectData.type"
          :disabled="
            ['price_sale_start_per_m', 'price_sale_end_per_m'].includes(rowItem.field) || $objectStore.readOnly
          "
          :is-cube="false"
          :options="[]"
          :label="mutableOptions[rowItem.field].objectData.label"
          :required="mutableOptions[rowItem.field]?.flags.requiredField || false"
          :class="rowItem.class"
          :hyphened-date="true"
          @update:model-value="
            (value: string | number) => {
              fieldValues[rowItem.field] = value

              if (rowItem.field === 'price_sale_start') {
                fieldValues.price_sale_start_per_m = (+value / +mutableData.object_area).toFixed(2)
                updateMutableDataByField('price_sale_start_per_m', fieldValues.price_sale_start_per_m)
              }
              if (rowItem.field === 'price_sale_end') {
                fieldValues.price_sale_end_per_m = (+value / +mutableData.object_area).toFixed(2)
                updateMutableDataByField('price_sale_end_per_m', fieldValues.price_sale_end_per_m)
              }
              updateMutableDataByField(rowItem.field, value)
            }
          "
        />
      </div>
    </div>
    <div v-else class="h-100 d-flex align-items-center justify-content-center">
      <div class="d-flex flex-column align-items-center">
        <i class="icon medium fi_alert-triangle mb-2" />
        <div class="terms-of-sale-alert-text mb-4">
          Поля с данными о сделке отключены, т.к. карточка используется в режиме “Предложение“ (вкладке “Основные” >
          поле “Условия продажи/аренды”)
        </div>
        <BaseFormButton
          :button-class="'button-fit-text terms-of-sale-alert-button p-3'"
          :variant="''"
          :outline-variant="'secondary'"
          :value="'Перевести карточку в режим “Сделка”'"
          :disabled="$objectStore.readOnly"
          @click="handleSetNewTermsOfSale"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import InputByType from '~/components/UI-KIT/InputByType.vue'
import BaseFormButton from '../../UI-KIT/Buttons/BaseFormButton.vue'

interface Props {
  mutableData: Record<string, any>
  mutableOptions: Record<string, any>
}
const props = defineProps<Props>()
const emit = defineEmits(['updateMutableData', 'toggleAllDealFields'])
const { $objectStore } = useNuxtApp()
const scenario = computed(() => $objectStore.objectDealScenario)
const fields = computed(() => $objectStore.objectDealFields)
const fieldValues: Ref<Record<string, any>> = ref({})

onBeforeMount(() => {
  fields.value.forEach((field) => {
    console.log(field)
    if (props.mutableOptions[field].objectData.type === 'datetime')
      fieldValues.value[field] = props.mutableData[field] && props.mutableData[field].split('T')[0]
    else fieldValues.value[field] = props.mutableData[field]
  })
})

function updateMutableDataByField(field: string, value: any) {
  emit('updateMutableData', field, value)
}

const isFieldsVisible = computed(() => props.mutableData.terms_of_sale === 'D')

watch(
  () => props.mutableData.terms_of_sale,
  (newVal) => {
    if (newVal === 'D') {
      emit('toggleAllDealFields', fields.value, false)

      fields.value.forEach((field) => {
        console.log(field)
        if (props.mutableOptions[field].objectData.type === 'datetime')
          fieldValues.value[field] = props.mutableData[field] && props.mutableData[field].split('T')[0]
        else fieldValues.value[field] = props.mutableData[field]
      })
      $objectStore.checkBySection('Сделка с ОН', 'Сделка с ОН', props.mutableData, [])
    } else {
      clearFields()
    }
  },
)

function clearFields() {
  emit('toggleAllDealFields', fields.value, true)

  fields.value.forEach((field) => {
    updateMutableDataByField(field, null)
  })
}

function handleSetNewTermsOfSale() {
  updateMutableDataByField('terms_of_sale', 'D')
}
</script>

<style scoped></style>
