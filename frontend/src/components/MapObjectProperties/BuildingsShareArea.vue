<template>
  <div class="price-and-area">
    <div class="row mt-2 mb-4">
      <div class="map-object-properties_body_input_label-wrapper d-flex justify-content-start col-6 order-1">
        Площадь офисных помещений, кв. м
      </div>
      <div class="input-wrapper input-wrapper__building col-6 order-3">
        <BFormInput
          v-if="indicatorChangeOffice"
          :id="'office_input'"
          v-model.number="modelNumberOffice"
          :type="'number'"
          :formatter="decimalFormatter"
          @blur="
            () => {
              indicatorChangeOffice = false
            }
          "
          :no-wheel="true"
          class="map-object-properties_body_input form-control form-control-lg"
          :disabled="mutableData.func_purpose.name === 'Прочее' || disabledComputed"
        />
        <BFormInput
          v-else
          v-model.number="modelNumberOffice"
          :id="'office_input'"
          :type="'text'"
          @focus="
            () => {
              indicatorChangeOffice = true
              officeValue = officeValue ? officeValue : ''
              inputChange('office')
            }
          "
          :no-wheel="true"
          class="map-object-properties_body_input form-control form-control-lg"
          :formatter="decimalFormatter"
          :disabled="mutableData.func_purpose.name === 'Прочее' || disabledComputed"
        />
      </div>
      <MapObjectPropertiesInput
        :object-data="mutableOptions.object_offices_area_share.objectData"
        :data="mutableData.object_offices_area_share"
        :is-share="true"
        :disabled="true"
        :required="false"
        :mutable-data="mutableData"
        :index="2"
        :disabled-modifier="$objectStore.readOnly"
        :field="'object_offices_area_share'"
      ></MapObjectPropertiesInput>
    </div>
    <div class="row mb-4">
      <div class="map-object-properties_body_input_label-wrapper d-flex justify-content-start col-6 order-1">
        Площадь торговых помещений, кв. м
      </div>
      <div class="input-wrapper input-wrapper__building col-6 order-3">
        <BFormInput
          v-if="indicatorChangeSale"
          :id="'sale_input'"
          v-model.number="modelNumberSale"
          :type="'number'"
          :formatter="decimalFormatter"
          @blur="
            () => {
              indicatorChangeSale = false
            }
          "
          :no-wheel="true"
          class="map-object-properties_body_input form-control form-control-lg"
          :disabled="mutableData.func_purpose.name === 'Прочее' || disabledComputed"
        />
        <BFormInput
          v-else
          :id="'sale_input'"
          v-model.number="modelNumberSale"
          :type="'text'"
          :formatter="decimalFormatter"
          @focus="
            () => {
              indicatorChangeSale = true
              saleValue = saleValue ? saleValue : ''
              inputChange('sale')
            }
          "
          :no-wheel="true"
          class="map-object-properties_body_input form-control form-control-lg"
          :disabled="mutableData.func_purpose.name === 'Прочее' || disabledComputed"
        />
      </div>
      <MapObjectPropertiesInput
        :object-data="mutableOptions.object_trade_area_share.objectData"
        :data="mutableData.object_trade_area_share"
        :is-share="true"
        :disabled="true"
        :required="false"
        :mutable-data="mutableData"
        :index="2"
        :disabled-modifier="$objectStore.readOnly"
        :field="'object_trade_area_share'"
      ></MapObjectPropertiesInput>
    </div>
    <div class="row mb-4">
      <div class="map-object-properties_body_input_label-wrapper d-flex justify-content-start col-6 order-1">
        Площадь бытовых помещений, кв. м
      </div>
      <div class="input-wrapper input-wrapper__building col-6 order-3">
        <BFormInput
          v-if="indicatorChangeCommon"
          :id="'common_input'"
          v-model.number="modelNumberCommon"
          :type="indicatorChangeCommon ? 'number' : 'text'"
          :formatter="decimalFormatter"
          @blur="
            () => {
              indicatorChangeCommon = false
            }
          "
          :no-wheel="true"
          class="map-object-properties_body_input form-control form-control-lg"
          :disabled="mutableData.func_purpose.name === 'Прочее' || disabledComputed"
        />
        <BFormInput
          v-else
          :id="'common_input'"
          v-model.number="modelNumberCommon"
          :type="indicatorChangeCommon ? 'number' : 'text'"
          :formatter="decimalFormatter"
          @focus="
            () => {
              indicatorChangeCommon = true
              commonValue = commonValue ? commonValue : ''
              inputChange('common')
            }
          "
          :no-wheel="true"
          class="map-object-properties_body_input form-control form-control-lg"
          :disabled="mutableData.func_purpose.name === 'Прочее' || disabledComputed"
        />
      </div>
      <MapObjectPropertiesInput
        :object-data="mutableOptions.object_common_area_share.objectData"
        :data="mutableData.object_common_area_share"
        :is-share="true"
        :disabled="true"
        :required="false"
        :mutable-data="mutableData"
        :index="2"
        :disabled-modifier="$objectStore.readOnly"
        :field="'object_common_area_share'"
      ></MapObjectPropertiesInput>
    </div>
    <div class="row mb-2">
      <div class="map-object-properties_body_input_label-wrapper d-flex justify-content-start col-6 order-1">
        Площадь производственно-складских помещений, кв. м
      </div>
      <div class="input-wrapper input-wrapper__building col-6 order-3">
        <BFormInput
          v-if="indicatorChangeProd"
          :id="'prod_input'"
          v-model.number="modelNumberProd"
          :type="'number'"
          :formatter="decimalFormatter"
          @blur="
            () => {
              indicatorChangeProd = false
            }
          "
          :no-wheel="true"
          class="map-object-properties_body_input form-control form-control-lg"
          :disabled="mutableData.func_purpose.name === 'Прочее' || disabledComputed"
        />
        <BFormInput
          v-else
          v-model.number="modelNumberProd"
          :id="'prod_input'"
          :type="'text'"
          :formatter="decimalFormatter"
          @focus="
            () => {
              indicatorChangeProd = true
              prodValue = prodValue ? prodValue : ''
              inputChange('prod')
            }
          "
          :no-wheel="true"
          class="map-object-properties_body_input form-control form-control-lg"
          :disabled="mutableData.func_purpose.name === 'Прочее' || disabledComputed"
        />
      </div>
      <MapObjectPropertiesInput
        :object-data="mutableOptions.object_storage_area_share.objectData"
        :data="mutableData.object_storage_area_share"
        :is-share="true"
        :disabled="true"
        :required="false"
        :mutable-data="mutableData"
        :disabled-modifier="$objectStore.readOnly"
        :index="2"
        :field="'object_storage_area_share'"
      ></MapObjectPropertiesInput>
    </div>
  </div>
</template>

<script setup lang="ts">
import MapObjectPropertiesInput from '~/components/MapObjectProperties/Fields/MapObjectPropertiesInput.vue'
interface Props {
  areaData: number | string
  officeData: number | string
  saleData: number | string
  prodData: number | string
  commonData: number | string

  mutableData: { [key: string]: any }
  mutableOptions: { [key: string]: any }
}

const {
  areaData,
  officeData,
  saleData,
  prodData,
  commonData,

  mutableData,
  mutableOptions,
} = defineProps<Props>()
const emit = defineEmits(['updateMutableData'])
const { $objectStore } = useNuxtApp()

const areaOptions: Ref<any[]> = ref([
  { value: 1, display_name: 'м²' },
  { value: 100, display_name: 'сот' },
  { value: 10000, display_name: 'га' },
])
const areaCurrentOption: Ref<any> = ref(1)
const areaValue: Ref<any> = ref(+areaData)
const officeValue: Ref<any> = ref(+officeData)
const saleValue: Ref<any> = ref(+saleData)
const prodValue: Ref<any> = ref(+prodData)
const commonValue: Ref<any> = ref(+commonData)

const indicatorChangeProd: Ref<boolean> = ref(false)
const indicatorChangeSale: Ref<boolean> = ref(false)
const indicatorChangeOffice: Ref<boolean> = ref(false)
const indicatorChangeCommon: Ref<boolean> = ref(false)

const modelNumberOffice = computed({
  get() {
    return indicatorChangeOffice.value
      ? officeValue.value
      : (+officeValue.value)
          .toLocaleString(undefined, { maximumFractionDigits: 20 })
          .replace(/[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/, ' ')
  },
  set(value) {
    officeValue.value = +value
    updateArea('object_offices_area', 'object_offices_area_share', officeValue.value)
  },
})
const modelNumberProd = computed({
  get() {
    return indicatorChangeProd.value
      ? prodValue.value
      : (+prodValue.value)
          .toLocaleString(undefined, { maximumFractionDigits: 20 })
          .replace(/[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/, ' ')
  },
  set(value) {
    prodValue.value = +value
    updateArea('object_storage_area', 'object_storage_area_share', prodValue.value)
  },
})
const modelNumberCommon = computed({
  get() {
    return indicatorChangeCommon.value
      ? commonValue.value
      : (+commonValue.value)
          .toLocaleString(undefined, { maximumFractionDigits: 20 })
          .replace(/[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/, ' ')
  },
  set(value) {
    commonValue.value = +value
    updateArea('object_common_area', 'object_common_area_share', commonValue.value)
  },
})
const modelNumberSale = computed({
  get() {
    return indicatorChangeSale.value
      ? saleValue.value
      : (+saleValue.value)
          .toLocaleString(undefined, { maximumFractionDigits: 20 })
          .replace(/[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/, ' ')
  },
  set(value) {
    saleValue.value = +value
    updateArea('object_trade_area', 'object_trade_area_share', saleValue.value)
  },
})

const objectAreaUpdated = computed(() => {
  return $objectStore.keysByObj.areaData
})
watch(
  () => mutableData.object_area,
  (newVal) => {
    console.log('objectAreaUpdated.value', objectAreaUpdated.value, areaData)
    areaValue.value = +newVal

    updateArea('object_offices_area', 'object_offices_area_share', officeValue.value)
    updateArea('object_trade_area', 'object_trade_area_share', saleValue.value)
    updateArea('object_storage_area', 'object_storage_area_share', prodValue.value)
    updateArea('object_common_area', 'object_common_area_share', commonValue.value)
  },
)
const dateUpdated = computed(() => {
  return $objectStore.keysByObj.date
})

function decimalFormatter(value: string) {
  return value.replace(/[^0-9.,]+/g, '')
}
async function inputChange(field: string) {
  const key = field + 'Value'
  await nextTick()
  document.getElementById(field + '_input')!.focus()
}

function updateArea(field: any, fieldShare: any, value: any) {
  emit('updateMutableData', field, value * areaCurrentOption.value)

  emit('updateMutableData', fieldShare, ((value * areaCurrentOption.value) / areaValue.value).toFixed(4))
}
const keysByObjRender = computed(() => $objectStore.keysByObj)
const disabledComputed = computed(() => $objectStore.readOnly)
</script>
