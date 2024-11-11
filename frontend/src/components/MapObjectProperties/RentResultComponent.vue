<template>
  <div :class="!mutableData.rent_result_json?.length ? 'is-invalid' : 'is-valid'" class="rent-result_wrapper p-3">
    <div class="card-title mt-2 mb-3">Параметры расчётов итоговой стоимости</div>
    <div class="d-flex">
      <div>
        <div v-for="field in rentFields" :key="field" class="select-group">
          <MapObjectPropertiesInputLabel :object-data="mutableOptions[field].objectData" :required-computed="true" />
          <CustomSelect
            :default="mutableData[field]"
            :field="field"
            :is-for-rent="true"
            :mutable-data="mutableData"
            :options="mutableOptions[field].objectData.choices"
            :required="false"
            :disabled-modifier="$objectStore.readOnly"
            @input="
              ($event: any) => {
                updateMutableDataByField($event, field)
              }
            "
          />
        </div>
      </div>
      <div class="m-3 d-flex align-items-center justify-content-center">
        <button
          :class="
            !(mutableData.rent_co && mutableData.rent_pu && mutableData.rent_dimension && mutableData.rent_vat)
              ? 'rent-result_wrapper_add_disabled'
              : ''
          "
          :disabled="
            !(mutableData.rent_co && mutableData.rent_pu && mutableData.rent_dimension && mutableData.rent_vat) ||
            $objectStore.readOnly
          "
          class="rent-result_wrapper_add"
          @click="addRentResult"
        >
          <i class="rent-result_wrapper_icon icon fi_chevron-right" />
        </button>
      </div>
      <div class="results-wrapper">
        <MapObjectPropertiesInputLabel
          :object-data="mutableOptions.rent_result_json.objectData"
          :required-computed="true"
        />
        <div class="row_row">
          <div class="rent-result_result">
            {{ getString(defaultValue) }}
          </div>
        </div>
        <div v-for="item in mutableData.rent_result_json" :key="getString(item)">
          <div v-if="!checkIsDefault(item)" class="row_row">
            <div class="rent-result_result">
              {{ getString(item) }} <i class="rent-result_result_icon icon fi_x" @click="deleteRentResult(item)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import CustomSelect from '~/components/UI-KIT/Selects/BaseCustomSelect.vue'
import MapObjectPropertiesInputLabel from '~/components/MapObjectProperties/Fields/MapObjectPropertiesInputLabel.vue'

interface Props {
  mutableData: { [key: string]: any }
  mutableOptions: { [key: string]: any }
}
const { $objectStore } = useNuxtApp()
const { mutableData, mutableOptions } = defineProps<Props>()
const emit = defineEmits(['addRentResult', 'deleteRentResult', 'updateMutableData'])
const rent_vat = ref({ V: 'с учетом НДС', W: 'без учета НДС' })
const rent_pu = ref({
  P: 'с учетом КУ',
  W: 'без учета КУ',
})
const rent_co = ref({
  C: 'с учетом ЭР',
  W: 'без учета ЭР',
})
const rent_dimension = ref({
  SM: 'руб./кв. м в месяц',
  SY: 'руб./кв. м в год',
  M: 'руб. в месяц',
  Y: 'руб. в год',
})

type rentFieldsType = 'rent_vat' | 'rent_pu' | 'rent_co' | 'rent_dimension'
const rentFields: Ref<rentFieldsType[]> = ref(['rent_vat', 'rent_pu', 'rent_co', 'rent_dimension'])
const keys: { [key in rentFieldsType]: number } = reactive({
  rent_vat: Math.random() * 1000,
  rent_pu: Math.random() * 1000,
  rent_co: Math.random() * 1000,
  rent_dimension: Math.random() * 1000,
})
const defaultValue: Ref<{ [key: string]: any }> = ref({
  rent_vat: 'W',
  rent_pu: 'W',
  rent_co: 'W',
  rent_dimension: 'SM',
})

onMounted(() => {
  if (!checkIsThereDefault()) {
    emit('addRentResult', defaultValue.value)
  }
})

function addRentResult() {
  const obj = {
    rent_vat: mutableData.rent_vat,
    rent_pu: mutableData.rent_pu,
    rent_co: mutableData.rent_co,
    rent_dimension: mutableData.rent_dimension,
  }
  emit('addRentResult', obj)
}

// Функция для проверки есть ли в данных mutableData.rent_result_json объект, идентичный default
function checkIsThereDefault() {
  let isThereSame = true
  mutableData.rent_result_json &&
    mutableData.rent_result_json.forEach((item: { [key: string]: any }) => {
      for (const key in item) {
        if (item[key] !== defaultValue.value[key]) {
          isThereSame = false
        }
      }
    })

  return mutableData.rent_result_json && isThereSame
}

// Функция для проверки отдельно взятого объекта из mutableData.rent_result_json на факт равенства default
function checkIsDefault(obj: { [key: string]: any }) {
  let isSame = true

  for (const key in obj) {
    if (obj[key] !== defaultValue.value[key]) {
      isSame = false
    }
  }

  return isSame
}

function updateMutableDataByField(value: any, field: string) {
  emit('updateMutableData', field, value)
}

function deleteRentResult(item: any) {
  if ($objectStore.readOnly) return
  console.log('delete')
  emit('deleteRentResult', item)
}

function getString(objParam: { [key: string]: any }) {
  const obj = Object.keys(objParam).includes('_value') ? objParam.value : objParam

  return Object.keys(obj)
    .map((item) => getItemString(item)[obj[item]])
    .join(', ')
}

function getItemString(key: string): any {
  if (key === 'rent_vat') return rent_vat.value
  if (key === 'rent_pu') return rent_pu.value
  if (key === 'rent_co') return rent_co.value
  if (key === 'rent_dimension') return rent_dimension.value
}
</script>

<style scoped></style>
